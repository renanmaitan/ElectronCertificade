const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const { loadFiles, rewriteFile, createFile, getTemplateName, getWithTelAndEmail, ensureDirectorys, getUppercasedTable } = require('./src/utils/fileOperations');
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
let listWindow = null;
const progressWindows = {};

function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

async function createProgressWindow(operationType) {
    progressWindows[operationType] = new BrowserWindow({
        width: 350,
        height: 150,
        show: false,
        webPreferences: {
            nodeIntegration: true, // enable node integration
            contextIsolation: false, // enable ipcRenderer
            enableRemoteModule: true, // enable remote
        }
    });
    await progressWindows[operationType].loadFile('src/pages/progress/index.html');
    progressWindows[operationType].webContents.send('operationType', operationType);
    progressWindows[operationType].removeMenu();
    progressWindows[operationType].setClosable(false);
    progressWindows[operationType].setMinimizable(false);
    progressWindows[operationType].setMaximizable(false);
    progressWindows[operationType].show();
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
        height: 540,
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
    ipcMain.on('uppercasedTable', (event, message) => {
        createFile('uppercasedTable.txt', `${message}`, 'uppercasedTable');
        if (optionsWindow && !optionsWindow.isDestroyed() && optionsWindow.webContents) {
            optionsWindow.webContents.send('uppercasedTable', message);
        }
    });
    optionsWindow.webContents.send('uppercasedTable', getUppercasedTable());
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
        if (listWindow && !listWindow.isDestroyed()) {
            listWindow.webContents.reload();
        }
    });

    ipcMain.on('getList', (event, message) => {
        const result = getList();
        event.reply('getListResponse', result);
    });
    ipcMain.on('clearList', (event, message) => {
        clearList();
        if (listWindow && !listWindow.isDestroyed()) {
            listWindow.webContents.reload();
        }
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
        if (listWindow && !listWindow.isDestroyed()) {
            listWindow.webContents.reload();
        }
    });

    ipcMain.on('createTable', (event, message) => {
        const list = getList();
        if (!list.length) {
            dialog.showMessageBox(mainWindow, {
                title: 'Alerta',
                type: 'warning',
                message: 'Nenhum atestado gerado! A lista está vazia.',
                buttons: ['OK']
            });
            return;
        }
        const status = populateTable(list);
        if (status === 404) {
            dialog.showMessageBox(mainWindow, {
                title: 'Modelo de atestado não encontrado',
                type: 'error',
                message: 'Atestado não gerado! Verifique o modelo de atestado nas configurações.',
                buttons: ['OK']
            });
            return;
        }
        dialog.showMessageBox(mainWindow, {
            title: 'Sucesso',
            type: 'info',
            message: 'Atestado gerado com sucesso!',
            buttons: ['OK']
        });
    });

    ipcMain.on('createDocx', async (event, message) => {
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
        createProgressWindow('word');
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const handledFileName = templateName.replace('{nome}', item.name).replace('{cpf}', item.cpf);
            const docxPath = createDocx(item, handledFileName);
            if (docxPath === 404) {
                dialog.showMessageBox(mainWindow, {
                    title: 'Modelo de certificado não encontrado',
                    type: 'error',
                    message: 'Nenhum certificado gerado! Verifique o modelo de certificados nas configurações.',
                    buttons: ['OK']
                });
                progressWindows['word'].close();
                break;
            }
            const pdfPath = `/output/pdfOutputs/fromWord/${handledFileName}.pdf`;
            await convertToPdf(docxPath, pdfPath, 'docx', progressWindows['word'], list.length, i + 1);
        }
    });

    ipcMain.on('createPptx', async (event, message) => {
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
        createProgressWindow('powerpoint');
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            const handledFileName = templateName.replace('{nome}', item.name).replace('{cpf}', item.cpf);
            const pptxPath = createPptx(item, handledFileName);
            if (pptxPath === 404) {
                dialog.showMessageBox(mainWindow, {
                    title: 'Modelo de certificado não encontrado',
                    type: 'error',
                    message: 'Nenhum certificado gerado! Verifique o modelo de certificados nas configurações.',
                    buttons: ['OK']
                });
                progressWindows['powerpoint'].close();
                break;
            }
            const pdfPath = `/output/pdfOutputs/fromPptx/${handledFileName}.pdf`;
            await convertToPdf(pptxPath, pdfPath, 'pptx', progressWindows['powerpoint'], list.length, i + 1);
        }
    });
    ipcMain.on('getWithTelAndEmail', (event) => {
        event.returnValue = getWithTelAndEmail();
    });
    ipcMain.on('progress-finished', (event, operationType) => {
        if (progressWindows[operationType] && !progressWindows[operationType].isDestroyed()) {
            progressWindows[operationType].setClosable(true);
        }
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