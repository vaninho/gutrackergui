const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('guApp', {
    windowClose: (args) => ipcRenderer.invoke('windowClose', args),
    windowMinimize: (args) => ipcRenderer.invoke('windowMinimize', args),
    openDonatePage: () => { ipcRenderer.invoke('openDonatePage') },
    getDeck: async () => ipcRenderer.invoke('getDeck'),
    removeCardsPlayed: async (deck) => ipcRenderer.invoke('removeCardsPlayed',deck),
    getOpponentInfo: async () => ipcRenderer.invoke('getOpponentInfo'),
    showCardListWindow: () => ipcRenderer.invoke('showCardListWindow'),
    ping: () => ipcRenderer.invoke('ping'),
    ipcRendererOn: (fn) => ipcRenderer.on('message', (event, arg) => fn(arg)),
    copyToClipBoard: (args) => ipcRenderer.invoke('copyToClipBoard', args),
    openDebugWindow: () => ipcRenderer.invoke('openDebugWindow')
});