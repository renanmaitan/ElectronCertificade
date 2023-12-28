const { app, BrowserWindow, Menu } = require('electron')

//main window
let mainWindow;
async function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
    })

    //load index.html
    await mainWindow.loadFile('src/pages/home/index.html')
}

//menu
Menu.setApplicationMenu(null);

//create window when app is ready
app.whenReady().then(createWindow);

//activate
app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});