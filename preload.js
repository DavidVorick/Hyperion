// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
	const replaceText = (selector, text) => {
		const element = document.getElementById(selector)
		if (element) element.innerText = text
	}

	for (const type of ['chrome', 'node', 'electron']) {
		replaceText(`${type}-version`, process.versions[type])
	}
})

// Imports.
const {
	contextBridge,
	ipcRenderer
} = require('electron')


// Expose a content bridge so that the window can talk to the main process.
contextBridge.exposeInMainWorld(
	'ipcRenderer', {
		send: (channel, data) => {
			// whitelist channels for security
			let validChannels = ['loadSkylink', 'determinePinStatus']
			if (validChannels.includes(channel)) {
				ipcRenderer.send(channel, data)
			}
		},
		on: (channel, callback) => {
			ipcRenderer.on(channel, (event) => callback())
		}
	}
)


/////
// Hyperion Hotkeys
/////
var Mousetrap = require('mousetrap')

// Global variables dictating the different hotkey states.
var insertMode = false
var verboseLogging = true

// Activate insert mode.
Mousetrap.bind('i', function() {
	insertMode = true
	if (verboseLogging) {
		console.log('entering insert mode (\"i\")')
	}
})

// Quit insert mode.
Mousetrap.bind('escape', function() {
	insertMode = false
	if (verboseLogging) {
		console.log('quitting insert mode (\"escape\")')
	}
})

// Enable verboseLogging.
Mousetrap.bind('ctrl+l', function() {
	verboseLogging = true
	console.log('activating verbose logging (\"ctrl+l\")')
})

// Disable verboseLogging.
Mousetrap.bind('ctrl+L', function() {
	verboseLogging = false
	console.log('disabling verbose logging (\"ctrl+L\")')
})

// Log the mode status.
Mousetrap.bind('ctrl+p', function() {
	console.log('insert mode: ', insertMode)
	console.log('verbose logging: ', verboseLogging)
})

// Go home.
Mousetrap.bind('ctrl+h', function() {
	if (verboseLogging) {
		console.log('Going home (\"ctrl+h\")')
	}
	ipcRenderer.send('goHome')
})

// Reload.
Mousetrap.bind('r', function() {
	if (verboseLogging) {
		console.log('Going home (\"r\")')
	}
	ipcRenderer.send('reload')
})
