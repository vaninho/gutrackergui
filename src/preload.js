const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('guApp', {
    mainWindowClose: (args) => ipcRenderer.invoke('mainWindowClose', args),
    mainWindowMinimize: (args) => ipcRenderer.invoke('mainWindowMinimize', args),
    openDonatePage: () => { ipcRenderer.invoke('openDonatePage') },
    getDeck: async () => ipcRenderer.invoke('getDeck'),
    removeCardsPlayed: async (deck) => ipcRenderer.invoke('removeCardsPlayed',deck),
    verifyIsOn: async () => ipcRenderer.invoke('ping'),
    getOpponentInfo: async () => ipcRenderer.invoke('getOpponentInfo'),
    ping: async () => ipcRenderer.invoke('ping'),
    showCardListWindow: () => ipcRenderer.invoke('showCardListWindow')
});