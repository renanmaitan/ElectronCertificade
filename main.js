const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');

const { loadFiles, rewriteFile, createFile, getTemplateName, getWithTelAndEmail } = require('./src/utils/fileOperations');
const { addToList, removeItemsFromList, updateItemFromList, clearList, addFromPaste, getList } = require('./src/utils/listOperations');
const createPptx = require('./src/utils/pptxCreate');
const createDocx = require('./src/utils/docxCreate');
const convertToPdf = require('./src/utils/convertToPdf');
const populateTable = require('./src/utils/docxTablePopulate');

const filesPath = __dirname;

// main window
let mainWindow = null;

async function createEditItemWindow(item) {
    const editItemWindow = new BrowserWindow({
        width: 400,
        height: 400,
        show: false,
        webPreferences: {
            nodeIntegration: true, // enable node integration
            contextIsolation: false, // enable ipcRenderer
            enableRemoteModule: true, // enable remote
        }
    });
    await editItemWindow.loadFile('src/pages/editItem/index.html');
    editItemWindow.webContents.send('item', item);
    editItemWindow.webContents.send('withTelAndEmail', getWithTelAndEmail());
    editItemWindow.show();
}


async function createListWindow() {
    const withTelAndEmail = getWithTelAndEmail();
    const listWindow = new BrowserWindow({
        width: 900,
        height: 500,
        show: false,
        webPreferences: {
            nodeIntegration: true, // enable node integration
            contextIsolation: false, // enable ipcRenderer
            enableRemoteModule: true // enable remote
        }
    });
    (withTelAndEmail && listWindow.maximize());
    await listWindow.loadFile('src/pages/list/index.html');
    ipcMain.on('reloadList', () => {
        if (listWindow && !listWindow.isDestroyed() && listWindow.webContents) {
            listWindow.webContents.reload();
        }
    });
    ipcMain.on('editItem', (event, message) => {
        createEditItemWindow(message);
    });
    listWindow.show();
}

async function createOptionsWindow() {
    const optionsWindow = new BrowserWindow({
        width: 400,
        height: 300,
        show: false,
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
    ipcMain.on('withTelAndEmail', (event, message) => {
        createFile('withTelAndEmail.txt', `${message}`, 'withTelAndEmail');
        if (optionsWindow && !optionsWindow.isDestroyed() && optionsWindow.webContents){
            optionsWindow.webContents.send('withTelAndEmail', message);
        }
        if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
            mainWindow.webContents.send('withTelAndEmail', message);
        }
    });
    optionsWindow.webContents.send('withTelAndEmail', getWithTelAndEmail());
    optionsWindow.show();
}


async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        show: false,
        webPreferences: {
            nodeIntegration: true, // enable node integration
            contextIsolation: false, // enable ipcRenderer
            enableRemoteModule: true // enable remote
        }
    });
    await mainWindow.loadFile('src/pages/home/index.html');
    loadFiles(mainWindow);
    mainWindow.webContents.send('withTelAndEmail', getWithTelAndEmail());
    //mainWindow.webContents.openDevTools();

    ipcMain.on('wordTemplate', (event, message) => {
        rewriteFile(message, 'wordTemplate', mainWindow);
    });

    ipcMain.on('pptxTemplate', (event, message) => {
        rewriteFile(message, 'pptxTemplate', mainWindow);
    });

    ipcMain.on('tableTemplate', (event, message) => {
        rewriteFile(message, 'tableTemplate', mainWindow);
    });

    ipcMain.on('showFiles', (event, message) => {
        if (message === 'word') {
            shell.openPath(path.join(filesPath, 'output', 'wordOutputs'));
        } else if (message === 'pptx') {
            shell.openPath(path.join(filesPath, 'output', 'pptxOutputs'));
        } else if (message === 'pdf_pptx') {
            shell.openPath(path.join(filesPath, 'output', 'pdfOutputs', 'fromPptx'));
        } else if (message === 'pdf_word') {
            shell.openPath(path.join(filesPath, 'output', 'pdfOutputs', 'fromWord'));
        } else if (message === 'table') {
            shell.openPath(path.join(filesPath, 'output', 'tableOutputs'));
        } 
        else {
            shell.openPath(path.join(filesPath, 'output'));
        }
    }); 

    ipcMain.on('createListWindow', (event, message) => {
        createListWindow();
    });

    ipcMain.on('createOptionsWindow', (event, message) => {
        createOptionsWindow();
    });

    ipcMain.on('addToList', (event, message) => {
        const result = addToList(message.name, message.cpf, message.birthDate, message.phone, message.email);
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
        console.log('Telefone: ' + message.phone + '\nEmail: ' + message.email);
        updateItemFromList(message.oldItem, message.name, message.cpf, message.birthDate, message.phone, message.email);
    });

    ipcMain.on('addFromPaste', (event, message) => {
        const result = addFromPaste(message);
        event.returnValue = result;
    });

    ipcMain.on('createTable', (event, message) => {
        populateTable(getList());
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
    ipcMain.on('getWithTelAndEmail', (event) => {
        event.returnValue = getWithTelAndEmail();
    });

    mainWindow.show();
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