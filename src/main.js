const { app, BrowserWindow, ipcMain, clipboard } = require('electron');
const path = require('path');
const core = require('./core')
const { windowStateKeeper } = require('./windowStateKeeper')
const appConfig = require('electron-settings')
let mainWindow, cardListWindow, debugWindow

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.

  const mainWindowStateKeeper = windowStateKeeper('main')

  mainWindow = new BrowserWindow({

    frame: false,
    useContentSize: false,
    x: mainWindowStateKeeper.x,
    y: mainWindowStateKeeper.y,
    width: mainWindowStateKeeper.width,
    height: mainWindowStateKeeper.height,
    show: false,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindowStateKeeper.track(mainWindow)

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  setInterval(verifyGameStart, 5000)
};


async function verifyGameStart() {

  const opponentInfo = await core.getOpponentInfo(debugWindow ? debugWindow.webContents.send.bind(debugWindow.webContents) : null)
  console.log(opponentInfo)

  if (opponentInfo.id !== '0' && !cardListWindow) {
    openCardListWindow()
  }
  if (opponentInfo.id === '0' && cardListWindow) {
    cardListWindow.close()
    cardListWindow = null
  }

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.handle('windowClose', (event, args) => {
  switch (args) {
    case 'main': {
      app.quit()
      return
    }
    case 'listCard': {
      cardListWindow.close()
      cardListWindow = null
      return
    }
    case 'debug': {
      debugWindow.close()
      debugWindow = null
    }
  }
})

ipcMain.handle('windowMinimize', (event, args) => {
  switch (args) {
    case 'main': {
      mainWindow.minimize()
      return
    }
    case 'listCard': {
      cardListWindow.minimize()
      return
    }
    case 'debug': {
      debugWindow.minimize()
      return
    }
  }
})

ipcMain.handle('openDonatePage', (event) => {
  require('electron').shell.openExternal('https://www.paypal.com/donate/?hosted_button_id=KMYN4WU5L8FJ8')
})

function openCardListWindow() {

  const cardListWindowStateKeeper = windowStateKeeper('cardList')

  cardListWindow = new BrowserWindow({
    frame: false,
    useContentSize: false,
    x: cardListWindowStateKeeper.x,
    y: cardListWindowStateKeeper.y,
    width: cardListWindowStateKeeper.width,
    height: cardListWindowStateKeeper.height,
    transparent: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  cardListWindow.loadURL(LIST_CARDS_WINDOW_WEBPACK_ENTRY)
  cardListWindowStateKeeper.track(cardListWindow)

}

ipcMain.handle('getDeck', async () => {
  const deck = await core.getDeck(debugWindow ? debugWindow.webContents.send.bind(debugWindow.webContents) : null)
  if (deck.length === '0' && cardListWindow) {
    cardListWindow.close()
  }
  if (deck.length !== '0' && !cardListWindow) {
    openCardListWindow()
  }
  return deck
})

ipcMain.handle('removeCardsPlayed', async (event, deck) => {
  return await core.removeCardsPlayed(deck, debugWindow ? debugWindow.webContents.send.bind(debugWindow.webContents) : null)
})

ipcMain.handle('showCardListWindow', () => {
  console.log('showList')
  cardListWindow.setAlwaysOnTop(true, 'pop-up-menu')
  cardListWindow.show()
})

ipcMain.handle('ping', () => {
  console.log('ping')
  return 'pong'
})

ipcMain.handle('copyToClipBoard', (event, text) => {
  console.log(text)
  clipboard.writeText(text)
})

ipcMain.handle('openDebugWindow', () => {

  console.log('openDebugWindow')
  const debugWindowStateKeeper = windowStateKeeper('debug')

  debugWindow = new BrowserWindow({
    frame: false,
    useContentSize: false,
    x: debugWindowStateKeeper.x,
    y: debugWindowStateKeeper.y,
    width: debugWindowStateKeeper.width,
    height: debugWindowStateKeeper.height,
    transparent: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  debugWindow.loadURL(DEBUG_WINDOW_WEBPACK_ENTRY)
  debugWindowStateKeeper.track(debugWindow)
  debugWindow.show()

})