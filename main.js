const { app, BrowserWindow } = require('electron')
const url = require('url')
const path = require('path')
const appConfig = require('electron-settings')

let mainWindow

const createWindow = () => {

  const mainWindowStateKeeper = windowStateKeeper('main')

  mainWindow = new BrowserWindow({
    // Window's Visual Features 
    frame: false, // Remove top bar 
    useContentSize: false, // Inhibit window size display 

    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    alwaysOnTop: true,
    x: mainWindowStateKeeper.x,
    y: mainWindowStateKeeper.y,
    width: mainWindowStateKeeper.width,
    height: mainWindowStateKeeper.height,
  })

  mainWindowStateKeeper.track(mainWindow)

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))


  // mainWindow.webContents.openDevTools()
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady()
  .then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});


function windowStateKeeper(windowName) {
  let window, windowState;
  function setBounds() {
    // Restore from appConfig
    if (appConfig.hasSync(`windowState.${windowName}`)) {
      windowState = appConfig.getSync(`windowState.${windowName}`);
      return;
    }
    // Default
    windowState = {
      x: 0,
      y: 100,
      width: 250,
      height: 750,
    };
  }
  function saveState() {
    if (!windowState.isMaximized) {
      windowState = window.getBounds();
    }
    windowState.isMaximized = window.isMaximized();
    appConfig.setSync(`windowState.${windowName}`, windowState);
  }
  function track(win) {
    window = win;
    ['resize', 'move', 'close'].forEach(event => {
      win.on(event, saveState);
    });
  }
  setBounds();
  return ({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    isMaximized: windowState.isMaximized,
    track,
  });
}