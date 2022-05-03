const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const core = require('./core')
const { windowStateKeeper }  = require('./windowStateKeeper')
let mainWindow, cardListWindow
process.env['NODE_' + 'ENV'] = 'production'

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

    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindowStateKeeper.track(mainWindow)

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  setInterval(verifyGameStart, 5000)
};


async function verifyGameStart() {
  // const opponentInfo = await core.getOpponentInfo(mainWindow.webContents.send.bind(mainWindow.webContents))

  console.log('verifyGameStart')
  const opponentInfo = await core.getOpponentInfo()
  console.log(opponentInfo)
  if (opponentInfo.id !== '0' && !cardListWindow) {
    openCardListWindow()
  }
  if (opponentInfo.id === '0' && cardListWindow) {
    cardListWindow.close()
    cardListWindow = null
  }

  // mainWindow.webContents.send('message', 'verifyGameStart')
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
ipcMain.handle('mainWindowClose', (event, args) => {
  switch (args) {
    case 'main': {
      app.quit()
      return
    }
    case 'listCard':
      cardListWindow.close()
      cardListWindow = null
  }
})

ipcMain.handle('mainWindowMinimize', (event, args) => {
  switch (args) {
    case 'main': {
      mainWindow.minimize()
      return
    }
    case 'listCard': {
      cardListWindow.minimize()
    }
  }
})

ipcMain.handle('openDonatePage', (event) => {
  require('electron').shell.openExternal('https://www.paypal.com/donate/?hosted_button_id=KMYN4WU5L8FJ8')
})

function openCardListWindow() {

  console.log('openCardList')

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

  console.log(cardListWindow)
  console.log(LIST_CARDS_WINDOW_WEBPACK_ENTRY)
}

ipcMain.handle('getDeck', async (event) => {
  const deck = await core.getDeck()
  if (deck.length === '0' && cardListWindow) {
    cardListWindow.close()
  }
  if (deck.length !== '0' && !cardListWindow) {
    openCardListWindow()
  }
  return deck
})

ipcMain.handle('removeCardsPlayed', async (event, deck) => {
  return await core.removeCardsPlayed(deck)
})

ipcMain.handle('showCardListWindow', () => {
  cardListWindow.setAlwaysOnTop(true, 'pop-up-menu')
  cardListWindow.show()
})

ipcMain.handle('ping', () => {
  console.log('ping')
  return 'pong'
})