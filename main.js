const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');

const { loadFiles, rewriteFile, createFile, getTemplateName } = require('./src/utils/fileOperations');
const { addToList, removeItemsFromList, updateItemFromList, clearList, addFromPaste, getList } = require('./src/utils/listOperations');
const createPptx = require('./src/utils/pptxCreate');
const createDocx = require('./src/utils/docxCreate');
const convertToPdf = require('./src/utils/convertToPdf');

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

async function createOptionsWindow() {
    const optionsWindow = new BrowserWindow({
        width: 400,
        height: 200,
        webPreferences: {
            nodeIntegration: true, // enable node integration
            contextIsolation: false, // enable ipcRenderer
            enableRemoteModule: true // enable remote
        }
    });
    await optionsWindow.loadFile('src/pages/options/index.html');
    optionsWindow.webContents.send('fileNameTemplate', getTemplateName());

    ipcMain.on('fileNameTemplate', (event, message) => {
        createFile('fileNameTemplate.txt', message, 'fileNameTemplate');
        optionsWindow.webContents.send('fileNameTemplate', message);
    });
}


async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 850,
        height: 700,
        webPreferences: {
            nodeIntegration: true, // enable node integration
            contextIsolation: false, // enable ipcRenderer
            enableRemoteModule: true // enable remote
        }
    });
    await mainWindow.loadFile('src/pages/home/index.html');
    loadFiles(mainWindow);
    //mainWindow.webContents.openDevTools();

    ipcMain.on('wordTemplate', (event, message) => {
        rewriteFile(message, 'wordTemplate', mainWindow);
    });

    ipcMain.on('pptxTemplate', (event, message) => {
        rewriteFile(message, 'pptxTemplate', mainWindow);
    });

    ipcMain.on('showFiles', (event, message) => {
        if (message === 'word') {
            shell.openPath(path.join(__dirname, 'output', 'wordOutputs'));
        } else if (message === 'pptx') {
            shell.openPath(path.join(__dirname, 'output', 'pptxOutputs'));
        } else if (message === 'pdf_pptx') {
            shell.openPath(path.join(__dirname, 'output', 'pdfOutputs', 'fromPptx'));
        } else if (message === 'pdf_word') {
            shell.openPath(path.join(__dirname, 'output', 'pdfOutputs', 'fromWord'));
        } else {
            shell.openPath(path.join(__dirname, 'output'));
        }
    }); 

    ipcMain.on('createListWindow', (event, message) => {
        createListWindow();
    });

    ipcMain.on('createOptionsWindow', (event, message) => {
        createOptionsWindow();
    });

    ipcMain.on('addToList', (event, message) => {
        const result = addToList(message.name, message.cpf, message.birthDate);
        event.returnValue = result;
    });

    ipcMain.on('getList', (event, message) => {
        const result = getList();
        event.reply('getListResponse', result);
    });
    ipcMain.on('clearList', (event, message) => {
        clearList();
    });

    ipcMain.on('removeItemsFromList', (event, message) => {
        removeItemsFromList(message);
    });

    ipcMain.on('updateItemFromList', (event, message) => {
        updateItemFromList(message.item, message.name, message.cpf, message.birthDate);
    });

    ipcMain.on('addFromPaste', (event, message) => {
        const result = addFromPaste(message);
        event.returnValue = result;
    });

    ipcMain.on('createDocx', (event, message) => {
        const templateName = getTemplateName();
        const list = getList();
        if (!list.length) {
            dialog.showMessageBox(mainWindow, {
                title: 'Alerta',
                type: 'warning',
                message: 'Nenhum certificado gerado! A lista está vazia.',
                buttons: ['OK']
            });
            return;
        }
        list.forEach(item => {
            const docxPath = createDocx(item.name, item.cpf, templateName);
            const pdfPath = `../../output/pdfOutputs/fromWord/${item.name}.pdf`;
            convertToPdf(docxPath, pdfPath, 'docx');
        });
    });

    ipcMain.on('createPptx', (event, message) => {
        const templateName = getTemplateName();
        const list = getList();
        if (!list.length) {
            dialog.showMessageBox(mainWindow, {
                title: 'Alerta',
                type: 'warning',
                message: 'Nenhum certificado gerado! A lista está vazia.',
                buttons: ['OK']
            });
            return;
        }
        list.forEach(item => {
            const pptxPath = createPptx(item.name, item.cpf, templateName);
            const pdfPath = `../../output/pdfOutputs/fromPptx/${item.name}.pdf`;
            convertToPdf(pptxPath, pdfPath, 'pptx');
        });
    });
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