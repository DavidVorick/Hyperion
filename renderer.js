// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
// window.ipcMain.send('loadSkylink', "CAAVU14pB9GRIqCrejD7rlS27HltGGiiCLICzmrBV0wVtA")
// window.ipcMain.send('loadSkylink', "AABSR21FcA-YmenaD-NvOb727LrVDAsEw_Bz1r4HxglcIQ")

// Set functions for telling the user whether the page is pinned or not.
function setImagePinned() {
	document.getElementById('pinnedImage').src='assets/pinned.svg'
}
function setImageNotPinned() {
	document.getElementById('pinnedImage').src='assets/notPinned.svg'
}

// When the 'go' button is clicked on the homepage, the browser will take you to
// the provided Skylink.
function loadSkylink() {
	// Loading a new page, reset the pinned status to 'pinned'.
	// 
	// TODO: This is a pretty sloppy way to do the pinning stuff, reconsider.
	setImagePinned()

	// Determine what link the user wants and load it.
	var link = document.getElementById('skylinkBox').value
	window.ipcRenderer.send('loadSkylink', link)
}

// Create the callback that is used to set the pinned status to 'not pinned'.
window.ipcRenderer.on('notPinned', function() {
	setImageNotPinned()
})
