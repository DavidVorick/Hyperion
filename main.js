// Imports
const path = require('path')
const URL = require('url').URL
const {
	app,
	globalShortcut,
	ipcMain,
	net,
	session,
	BrowserWindow,
	BrowserView
} = require('electron')

// Need to know the page view id so we know what to update when the user submits
// a skylink. Same with the urlBar.
var pageViewId = 0
var urlBarId = 0

// The list of skyfiles that the app knows are pinned.
var skyfiles = new Map()

// Function to create the browser window.
function createWindow () {
	// TODO: Block any non-localhost requests. Should be able to use
	// onBeforeRequest.

	// Clean things up before sending any outbound headers. This includes
	// setting the user-agent, the api-password, and determining whether the
	// user has pinned the current page they are viewing or not.
	session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
		// Set the user agent for the session.
		details.requestHeaders['User-Agent'] = 'Sia-Agent'

		// TODO: Need to set the api password as well.

		// Check whether this is a skylink call or not. If so, reference it
		// against the user's set of pinned files and issue a 'not pinned'
		// signal if the file is not pinned.
		// 
		// TODO: Need to figure out if this represents the user loading a new page
		// or if the browser is just fetching resources. If the user is loading a
		// completely new page, we need to reset the pin status.
		if (details.url.startsWith('http://localhost:9980/skynet/skylink/')) {
			var skylink = details.url.substr(37, details.url.length)
			console.log('MAKING SKYLINK REQUEST:', skylink)
			if (!skyfiles.has(skylink)) {
				console.log('has not')
				BrowserView.fromId(urlBarId).webContents.send('notPinned')
			}
		}
		callback({ cancel: false, requestHeaders: details.requestHeaders })
	})

	// Set a content security policy.
	//
	// TODO: Really not sure how this is supposed to work, but electron
	// complains.
	/*
	session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
		callback({
			responseHeaders: Object.assign({
				'Content-Security-Policy': [ "default-src 'unsafe-inline'" ]
			}, details.responseHeaders)
		})
	})
	*/

	// Create the browser window.
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			enableRemoteModule: false,
			preload: path.join(__dirname, 'preload.js')
		}
	})

	// Set the url bar view.
	let urlBar = new BrowserView({
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			enableRemoteModule: false,
			preload: path.join(__dirname, 'preload.js')
		}
	})
	urlBar.setBounds({ x: 0, y: 0, width: 800, height: 40 })
	urlBar.setAutoResize({ horizontal: true })
	urlBar.webContents.loadFile('index.html')
	urlBarId = urlBar.id
	mainWindow.addBrowserView(urlBar)

	let pageView = new BrowserView({
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			enableRemoteModule: false,
			preload: path.join(__dirname, 'preload.js')
		}
	})
	pageView.webContents.loadURL('https://google.com')
	pageView.setBounds({ x: 0, y: 40, width: 800, height: 600 })
	pageView.setAutoResize({ horizontal: true })
	pageViewId = pageView.id
	mainWindow.addBrowserView(pageView)

	// Open the DevTools.
	// urlBar.webContents.openDevTools()
	// pageView.webContents.openDevTools()

	// Fetch the list of skyfiles from siad.
	let body = ""
	const request = net.request('http://localhost:9980/renter/files')
	request.on('response', (response) => {
		// TODO: Log on error only
		//
		// console.log(`${response.statusCode}`)
		response.on('data', (chunk) => {
			// console.log(`BODY: ${chunk}`)
			body += chunk
		})
		response.on('end', () => {
			var files = JSON.parse(body).files
			for (var i = 0; i < files.length; i++) {
				if (files[i].skylinks != undefined) {
					for (var j = 0; j < files[i].skylinks.length; j++) {
						console.log('found pinned skyfile')
						console.log(files[i].skylinks[j])
						skyfiles.set(files[i].skylinks[j], 'true')
					}
				}
			}
		})
	})
	request.end()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

//////
// IPCs
//////

// IPC to load a skylink.
ipcMain.on('loadSkylink', (event, args) => {
	BrowserView.fromId(pageViewId).webContents.loadURL('http://localhost:9980/skynet/skylink/'+args)
})

// IPC to set the 'pinned' value based on whether or not these skylinks are
// loaded.
ipcMain.on('determinePinStatus', (event, skylinks) => {
	for (var i = 0; i < skylinks.length; i++) {
		console.log(skylinks[i])
		console.log(skyfiles.has(skylinks[i]))
	}
})

// IPC to go home.
// 
// TODO: Make a better homepage.
ipcMain.on('goHome', (event) => {
	BrowserView.fromId(pageViewId).webContents.loadFile('index.html')
})

// IPC to reload the main window.
// 
// TODO: Never got this working correctly. Sometimes i3 will resize a window
// after it appears, causing a race where the browser renders to the wrong size.
// Resizing fixes things, but I'd like a hotkey to trigger a re-render without
// having to actually resize the window.
ipcMain.on('reload', (event) => {
	console.log("don't know how to get it to relaod")
})
