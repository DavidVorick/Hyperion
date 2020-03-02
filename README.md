# Hyperion

Hyperion is a browser for Skynet. Hyerion expects a siad running in portal mode.

Currently, Hyperion can navigate to skylinks and determine whether the siad
instance is actively pinning that skylink. The pin detection is not
sophisiticated at this time.

Currently, Hyperion depends on a modified siad where the /renter/files endpoint
returns all files from root, and where the /skynet endpoints do not require an
api password.

```
// Installation:
npm install moustrap
npm install
npm start
```

### Hotkeys

Hyperion is meant to be vim-like, and thus has some hotkeys.

i: enter insert mode (currently does nothing)
escape: exit insert mode (currently does nothing)

ctrl+l: enable verbose console logging  
ctrl+L: disable verbose console logging  
ctrl+p: use console to log current hotkey status  
ctrl+h: go home (currently broken)  

### TODOs:

Need to figure out how to supply an api password.

Need to be able to pin skyfiles that we want to keep.

Need to remember all of the skyfiles that are associated with loading a
particular page so that when the user does a pin, siad pins all external
resources for the page.

Need to have a set of bookmarks to show the user, bookmarks and pinned items
should be the same.

Need to figure out how to block all non-localhost connections. Should be able to
use onBeforeRequest.

Need to refresh the 'skyfiles' map periodically. Need to update it when new
things get pinned.

Need to use something besides the deprecated 

Need to find a way to repaint / reload / refresh / reset a page after loading.
Sometimes i3 resizes things super quickly and the rendering is bad, I think this
is a race condition.

### Long Term:

Need to create a siad if one does not exist.

Need a page to fund a wallet.

Need to use a portal if siad isn't ready yet.

Need to remember what to pin while the user is using a portal,  then pin it when
siad is ready.
