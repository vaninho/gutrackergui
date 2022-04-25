const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('guApp', {
    mainWindowClose: (args) => ipcRenderer.invoke('mainWindowClose', args),
    mainWindowMinimize: (args) => ipcRenderer.invoke('mainWindowMinimize', args),
    openDonatePage: () => { ipcRenderer.invoke('openDonatePage') },
    openCardListWindow: () => { ipcRenderer.invoke('openCardListWindow') }
});