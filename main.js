const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')

let mainWindow

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 1000,

    // Window's Visual Features 
    frame: false, // Remove top bar 
    useContentSize: false, // Inhibit window size display 


    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    },
    alwaysOnTop: true,
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', () => {
    mainWindow = null
  });
};

app.whenReady()
  .then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});