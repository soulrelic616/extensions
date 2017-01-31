# Brackets Key Remapper
Allow users to change keyboard shortcuts, and save the changes persistently. They are all stored in the Brackets Preference File, to edit, use the Debug->Open Preference File menu item.
Keyboard shortcuts are remapped on saving the Preference file.

Like most programmers, I have way more projects on the go than I have time for, while there are a bunch of things I'd like to do to this extension to make it better, the fact it's working ok, means I'll devote more time to other projects that aren't yet functional. This code is public domain though, so if you want to completely take over this project, feel free to do so, just let me know so I can update this info. If you'd just like to make a addition, feel free to Fork it (https://confluence.atlassian.com/display/BITBUCKET/Fork+a+Repo%2C+Compare+Code%2C+and+Create+a+Pull+Request) or even make the changes and email me the main.js, I'll compare and merge your changes.

# Installation
To install via Brackets Extension Manager, use https://bitbucket.org/sacah/brackets-key-remapper/downloads/sacah-brackets-key-remapper-0.24.zip

## Future

## Changes
#### 8/10/2014
* Overwrite keyboard shortcuts of late bindings

#### 7/10/2014
* Fixing bug that clears all standard keys.
* Rewrote to focus on Command Id.
* Using new Preference system.
* Monkey patch native Brackets functions to capture late keyboard shortcuts.

#### 12/01/2014
* Added hack to save cleared key maps, and reload on next session.

#### 6/10/2013
* Added slight delay to catch extensions incorrectly registering shortcuts in appReady.

#### 24/08/2013
* Handling Tab key in Keyboard shortcuts.

#### 12/08/2013
* Attempting to handle issue some people are having with what appears to be an Undefined keyCombo. Hoping this issue doesn't popup somewhere else.

#### 06/08/2013
* Added support for NumPad keys
* Fixing conflict check, no longer reports incorrect matches, and checks on both Key Modifier and Shortcuts

#### 04/08/2013
* Added support for listing commands with no current keyboard shortcuts, allowing you to add one

#### 02/08/2013
* Added support for Cmd key on Macs
* Fixed up layout of Modifier/Shortcut columns

#### 22/07/2013
* Adding button to clear User saved keyboard shortcuts.
* Making some fixes for Brackets 0.27

#### 8/07/2013
* Updating version number to correct format.
* Adding file for download.

#### 6/07/2013
* Detect duplicate shortcuts and notify.
* Tidied up dialog layout.
* Separated out shortcut modifier and key to 2 INPUT fields. Considered this the most consistent, user friendly solution.

#### 5/07/2013
* Allow keyboard shortcuts to be entered by pressing keys. Values will be displayed in INPUT field.
* Update filter value on keyboard shortcut being changed.

#### 30/06/2013
* Added basic dialog, listing current Keyboard Shortcuts
* Filter box limits Keyboard Shortcuts shown in dialog based on Command or Shortcut
* Manually entering new Keyboard Shortcut will remap the Command to that Shortcut and persist across restarts

#### 29/06/2013 
* Initial commit, mainly testing if Brackets can install directly from BitBucket.