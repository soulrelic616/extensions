/* 
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>
*/

define(function (require, exports, module) {
	"use strict";
	
	var Commands=brackets.getModule('command/Commands'),
		CommandManager=brackets.getModule('command/CommandManager'),
		KeyBindingManager=brackets.getModule('command/KeyBindingManager'),
    Menus=brackets.getModule('command/Menus'),
		PreferencesManager=brackets.getModule("preferences/PreferencesManager");
		
	var _keymapCmdFirst={},
		_keymapKeyFirst={};
	
	/*
		My KeyMaps format
		_keymapCmdFirst:
		{
			'navigate.nextMatch': {
				commandID: 'navigate.nextMatch',
				explicitPlatform: '',
				key: 'Alt-Down'
			},
			...
		}
		
		_keymapKeyFirst:
		{
			'Alt-Down': {
				commandID: 'navigate.nextMatch',
				explicitPlatform: '',
				key: 'Alt-Down'
			},
			...
		}
	*/
	

	// Convert from the Brackets Keymap format, which uses 'key' as an index, to our internal Keymap format, which uses 'commandID' as an index.
	function convertKeysSys2Int(sysKeys) {
		var _k, _keyMap={};
		for(var key in sysKeys) {
			_k=sysKeys[key];
			_keyMap[_k.commandID]={
				commandID: _k.commandID,
				explicitPlaform: _k.explicitPlatform,
				key: _k.key
			};
		}
		return _keyMap;
	}
	
	// Convert from our internal Keymap format, which uses 'commandID' as an index, to Brackets Keymap format, which uses 'key' as an index.
	function convertKeysInt2Sys(intKeys) {
		var _k, _keyMap={};
		for(var key in intKeys) {
			_k=intKeys[key];
			_keyMap[_k.key]={
				commandID: _k.commandID,
				explicitPlaform: _k.explicitPlatform,
				key: _k.key
			};
		}
		return _keyMap;
	}
	
	function bindKey(commandID, keymap) {
		if(Array.isArray(keymap)) {
			keymap=keymap[0];
		}
		if(!keymap) return;
		
		unbindKey(keymap.key);
		_keymapCmdFirst[commandID]={
			commandID: commandID,
			explicitPlatform: keymap.explicitPlatform,
			key: keymap.key
		}
		_keymapKeyFirst[keymap.key]=$.extend(_keymapKeyFirst[keymap.key], {
			commandID: commandID,
			explicitPlatform: keymap.explicitPlatform,
			key: keymap.key
		});
		
		KeyBindingManager.addBinding(commandID, keymap.key, keymap.explicitPlatform, 'sacahremapkeysnorunloop');
		
		prefs.set('keymap', _keymapCmdFirst);
	}
	
	function unbindKey(key) {
		var commandID=_keymapKeyFirst[key];
		if(commandID) commandID=commandID.commandID;
		
		if(_keymapKeyFirst[key]) _keymapKeyFirst[key]={};
		if(_keymapCmdFirst[commandID] && _keymapCmdFirst[commandID].key) _keymapCmdFirst[commandID].key='';
		KeyBindingManager.removeBinding(key);
	}
	
	/*
		Returned KeyMap format
		
		{
			'Alt-Down': {
				commandID: 'navigate.nextMatch',
				displayKey: '',
				explicitPlatform: '',
				key: 'Alt-Down'
			},
			...
		}	
	*/
	function getSysKeys() {
		return KeyBindingManager.getKeymap();
	}
	
	// I've had issues in the past with other extensions initialising after mine, and not capturing their bindings.
	// So here I can patch Brackets functions to capture them
	function monkeyPatchBrackets() {
		
		function mPatch(object, method, callback) {
			object[method]=callback(object[method]);
		}

		// Patch KeyBindingManager.addBinding
		mPatch(KeyBindingManager, 'addBinding', function (addBinding) {
			return function () {
				// Change keyboard shortcut if we have a saved one
				if(_keymapCmdFirst[arguments[0]] && _keymapCmdFirst[arguments[0]].key) arguments[1]=_keymapCmdFirst[arguments[0]].key;
				
				var _ret=addBinding.apply(this, arguments);
				if(arguments[3]=='sacahremapkeysnorunloop') {
					return _ret;
				}
				bindKey(arguments[0], _ret);
				return _ret;
			};
		});
	}
	
	function clearAllKeyBindings(sysKeys) {
		var _k;
		for(var key in sysKeys) {
			_k=sysKeys[key];
			KeyBindingManager.removeBinding(_k.key);
		}		
	}
	
	function remapKeys() {
		var _k;
		for(var commandID in _keymapCmdFirst) {
			_k=_keymapCmdFirst[commandID];
			KeyBindingManager.addBinding(_k.commandID, _k.key, _k.explicitPlatform, 'sacahremapkeysnorunloop');
		}		
	}
	
	function init() {
		var tmp=getSysKeys();
		clearAllKeyBindings(tmp);
		
		_keymapCmdFirst=prefs.get('keymap');
		
		_keymapKeyFirst=convertKeysInt2Sys(_keymapCmdFirst);
		
		_keymapKeyFirst=$.extend(tmp, _keymapKeyFirst);
		_keymapCmdFirst=$.extend(convertKeysSys2Int(_keymapKeyFirst), _keymapCmdFirst);
		
		prefs.set('keymap', _keymapCmdFirst);
		
		remapKeys();
	}
		
	var MY_COMMAND_ID='sacah.keyremapper.loadremapperdialog';
  
	var prefs=PreferencesManager.getExtensionPrefs(MY_COMMAND_ID);
	prefs.definePreference('keymap', 'object', {});
	
	monkeyPatchBrackets();
	
	prefs.on("change", init);
	init();
});