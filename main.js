const { app, BrowserWindow, Menu, ipcMain } = require('electron');

const { loadFiles, rewriteFile } = require('./src/utils/fileOperations');
const { addToList, removeItensFromList, updateItemFromList, clearList, addFromPaste } = require('./src/utils/listOperations');
const createPPTX = require('./src/utils/pptxCreate');
const createDocx = require('./src/utils/docxCreate');

// main window
let mainWindow = null;

async function createListWindow() {
    const listWindow = new BrowserWindow({
        width: 900,
        height: 500,
        webPreferences: {
            nodeIntegration: true, // enable node integration
            contextIsolation: false, // enable ipcRenderer
            enableRemoteModule: true // enable remote
        }
    });
    await listWindow.loadFile('src/pages/list/index.html');
}


async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true, // enable node integration
            contextIsolation: false, // enable ipcRenderer
            enableRemoteModule: true // enable remote
        }
    });
    await mainWindow.loadFile('src/pages/home/index.html');
    console.log(loadFiles(mainWindow));

    ipcMain.on('wordTemplate', (event, message) => {
        rewriteFile(message, 'wordTemplate', mainWindow);
    });

    ipcMain.on('pptxTemplate', (event, message) => {
        rewriteFile(message, 'pptxTemplate', mainWindow);
    });

    ipcMain.on('createListWindow', (event, message) => {
        createListWindow();
    });

    ipcMain.on('addToList', (event, message) => {
        const result = addToList(message.name, message.cpf, message.birthDate);
        event.returnValue = result;
    });

    ipcMain.on('getList', (event, message) => {
        event.returnValue = getList();
    });

    ipcMain.on('clearList', (event, message) => {
        clearList();
    });

    ipcMain.on('removeItensFromList', (event, message) => {
        removeItensFromList(message);
    });

    ipcMain.on('updateItemFromList', (event, message) => {
        updateItemFromList(message.item, message.name, message.cpf, message.birthDate);
    });

    ipcMain.on('addFromPaste', (event, message) => {
        const result = addFromPaste(message);
        event.returnValue = result;
    });

    ipcMain.on('createPPTX', (event, message) => {
        createPPTX(message.name, message.cpf);
    });

    ipcMain.on('createDocx', (event, message) => {
        createDocx(message.name, message.cpf);
    });

    //test
    createDocx('Renan Antonioli Maitan', '123.456.789-03', 'Certificado - {nome}');
}

// menu
Menu.setApplicationMenu(null);

// create window when app is ready
app.whenReady().then(createWindow);

// activate
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});