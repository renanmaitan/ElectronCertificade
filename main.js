const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const { loadFiles, rewriteFile, createFile, getTemplateName, getWithTelAndEmail, ensureDirectorys } = require('./src/utils/fileOperations');
const { addToList, removeItemsFromList, updateItemFromList, clearList, addFromPaste, getList } = require('./src/utils/listOperations');
const createPptx = require('./src/utils/pptxCreate');
const createDocx = require('./src/utils/docxCreate');
const convertToPdf = require('./src/utils/convertToPdf');
const populateTable = require('./src/utils/docxTablePopulate');

const documentsFolder = app.getPath('documents');
const filesPath = path.join(documentsFolder, 'ElectronCertificate');

// main window
let mainWindow = null;
let optionsWindow = null;

let listWindow;

function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

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
    if (listWindow && !listWindow.isDestroyed()) {
        listWindow.webContents.reload();
        listWindow.focus();
        return;
    }
    const withTelAndEmail = getWithTelAndEmail();
    listWindow = new BrowserWindow({
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
    listWindow.on('close', () => {
        listWindow.destroy();
    });
    listWindow.show();
}

async function createOptionsWindow() {
    optionsWindow = new BrowserWindow({
        width: 500,
        height: 520,
        show: false,
        webPreferences: {
            nodeIntegration: true, // enable node integration
            contextIsolation: false, // enable ipcRenderer
            enableRemoteModule: true // enable remote
        }
    });
    await optionsWindow.loadFile('src/pages/options/index.html');
    loadFiles(optionsWindow);
    optionsWindow.webContents.send('fileNameTemplate', getTemplateName());
    ipcMain.on('withTelAndEmail', (event, message) => {
        createFile('withTelAndEmail.txt', `${message}`, 'withTelAndEmail');
        if (optionsWindow && !optionsWindow.isDestroyed() && optionsWindow.webContents) {
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
    ensureDirectorys();
    mainWindow.webContents.send('withTelAndEmail', getWithTelAndEmail());

    ipcMain.on('wordTemplate', (event, message) => {
        rewriteFile(message, 'wordTemplate', event);
    });

    ipcMain.on('pptxTemplate', (event, message) => {
        rewriteFile(message, 'pptxTemplate', event);
    });

    ipcMain.on('tableTemplate', (event, message) => {
        rewriteFile(message, 'tableTemplate', event);
    });
    ipcMain.on('fileNameTemplate', (event, message) => {
        if (message !== '') {
            createFile('fileNameTemplate.txt', message, 'fileNameTemplate');
            event.reply('fileNameTemplate', message);
        } else {
            dialog.showMessageBox(optionsWindow, {
                title: 'Alerta',
                type: 'warning',
                message: 'Nome do arquivo não pode ser vazio!',
                buttons: ['OK']
            });
        }
    });

    ipcMain.on('showFiles', (event, message) => {
        let dirPath;
        if (message === 'word') {
            dirPath = path.join(filesPath, 'output', 'wordOutputs');
        } else if (message === 'pptx') {
            dirPath = path.join(filesPath, 'output', 'pptxOutputs');
        } else if (message === 'pdf_pptx') {
            dirPath = path.join(filesPath, 'output', 'pdfOutputs', 'fromPptx');
        } else if (message === 'pdf_word') {
            dirPath = path.join(filesPath, 'output', 'pdfOutputs', 'fromWord');
        } else if (message === 'table') {
            dirPath = path.join(filesPath, 'output', 'tableOutputs');
        }
        else {
            dirPath = path.join(filesPath, 'output');
        }
        ensureDirectoryExists(dirPath);
        shell.openPath(dirPath);
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
        if (listWindow && !listWindow.isDestroyed()) {
            listWindow.webContents.reload();
        }
    });

    ipcMain.on('updateItemFromList', (event, message) => {
        updateItemFromList(message.oldItem, message.name, message.cpf, message.birthDate, message.phone, message.email);
        if (listWindow && !listWindow.isDestroyed()) {
            listWindow.webContents.reload();
        }
    });

    ipcMain.on('editItem', (event, message) => {
        createEditItemWindow(message);
    });

    ipcMain.on('addFromPaste', (event, message) => {
        const result = addFromPaste(message);
        event.returnValue = result;
    });

    ipcMain.on('createTable', (event, message) => {
        const status = populateTable(getList());
        if (status === 404) {
            dialog.showMessageBox(mainWindow, {
                title: 'Modelo de tabela não encontrado',
                type: 'error',
                message: 'Nenhuma tabela gerada! Verifique o modelo de tabela nas configurações.',
                buttons: ['OK']
            });
            return;
        }
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
            if (docxPath === 404) {
                dialog.showMessageBox(mainWindow, {
                    title: 'Modelo de certificado não encontrado',
                    type: 'error',
                    message: 'Nenhum certificado gerado! Verifique o modelo de certificados nas configurações.',
                    buttons: ['OK']
                });
                return;
            }
            const pdfPath = `/output/pdfOutputs/fromWord/${item.name}.pdf`;
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
            if (pptxPath === 404) {
                dialog.showMessageBox(mainWindow, {
                    title: 'Modelo de certificado não encontrado',
                    type: 'error',
                    message: 'Nenhum certificado gerado! Verifique o modelo de certificados nas configurações.',
                    buttons: ['OK']
                });
                return;
            }
            const pdfPath = `/output/pdfOutputs/fromPptx/${item.name}.pdf`;
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