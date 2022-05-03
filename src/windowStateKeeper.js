const appConfig = require('electron-settings')

function windowStateKeeper(windowName) {
    let window, windowState;
    function setBounds() {
        // Restore from appConfig
        if (appConfig.hasSync(`windowState.${windowName}`)) {
            windowState = appConfig.getSync(`windowState.${windowName}`);
            return;
        }

        // Default cardList
        if (windowName === 'cardList') {
            windowState = {
                x: 0,
                y: 100,
                width: 250,
                height: 750,
            };
            return;
        }
        // Default
        windowState = {
            x: 0,
            y: 0,
            width: 500,
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

module.exports = { windowStateKeeper }