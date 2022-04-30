const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('guApp', {
    mainWindowClose: (args) => ipcRenderer.invoke('mainWindowClose', args),
    mainWindowMinimize: (args) => ipcRenderer.invoke('mainWindowMinimize', args),
    openDonatePage: () => { ipcRenderer.invoke('openDonatePage') },
    getDeck: async () => ipcRenderer.invoke('getDeck'),
    removeCardsPlayed: async (deck) => ipcRenderer.invoke('removeCardsPlayed',deck),
    getOpponentInfo: async () => ipcRenderer.invoke('getOpponentInfo'),
    showCardListWindow: () => ipcRenderer.invoke('showCardListWindow'),
    ping: () => ipcRenderer.invoke('ping'),
    ipcRendererOn: (fn) => ipcRenderer.on('message', (event, arg) => fn(arg))
});