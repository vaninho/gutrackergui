const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { ConsoleMessage } = require('puppeteer');
const core = require('./core')

let mainWindow, cardListWindow

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({

    frame: false,
    useContentSize: false,
    width: 800,
    height: 600,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
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
  core.openDonatePage()
})

function openCardListWindow() {
  cardListWindow = new BrowserWindow({
    frame: false,
    useContentSize: false,
    width: 800,
    height: 600,
    transparent: true,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  cardListWindow.loadURL(LIST_CARDS_WINDOW_WEBPACK_ENTRY)
}

ipcMain.handle('getOpponentInfo', async () => {
  const opponentInfo = await core.getOpponentInfo()
  if (opponentInfo.id !== 0 && !cardListWindow) {
    openCardListWindow()
  }
})

ipcMain.handle('getDeck', async (event) => {
  const deck = await core.getDeck()
  if (deck.length === 0 && cardListWindow) {
    cardListWindow.close()
  }
  if (deck.length !== 0 && !cardListWindow) {
    openCardListWindow()
  }
  return deck
})

ipcMain.handle('removeCardsPlayed', async (event, deck) => {
  return await core.removeCardsPlayed(deck)
})

ipcMain.handle('ping', () => {
  console.log('pong')
})

ipcMain.handle('showCardListWindow', () => {
    cardListWindow.show()
})