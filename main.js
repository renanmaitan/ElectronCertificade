const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

// main window
let mainWindow = null;

// load files
function loadFiles(){
    const wordTemplateFolder = path.join(__dirname, 'wordTemplate');
    if (!fs.existsSync(wordTemplateFolder)) {
        fs.mkdirSync(wordTemplateFolder);
    }
    const wordFiles = fs.readdirSync(wordTemplateFolder);
    const docxFiles = wordFiles.filter(file => path.extname(file).toLowerCase() === '.docx');
    if (docxFiles.length === 1) {
        const docxFile = docxFiles[0];
        const docxFilePath = path.join(wordTemplateFolder, docxFile);
        mainWindow.webContents.send('wordTemplate', docxFilePath);
    } else if (docxFiles.length > 1) {
        docxFiles.forEach(docxFile => {
            const docxFilePath = path.join(wordTemplateFolder, docxFile);
            fs.unlinkSync(docxFilePath);
        });
    } else {
        mainWindow.webContents.send('wordTemplate', '');
    }

    const pptxTemplateFolder = path.join(__dirname, 'pptxTemplate');
    if (!fs.existsSync(pptxTemplateFolder)) {
        fs.mkdirSync(pptxTemplateFolder);
    }
    const pptFiles = fs.readdirSync(pptxTemplateFolder);
    const pptxFiles = pptFiles.filter(file => path.extname(file).toLowerCase() === '.pptx');
    if (pptxFiles.length === 1) {
        const pptxFile = pptxFiles[0];
        const pptxFilePath = path.join(pptxTemplateFolder, pptxFile);
        mainWindow.webContents.send('pptxTemplate', pptxFilePath);
    } else if (pptxFiles.length > 1) {
        pptxFiles.forEach(pptxFile => {
            const pptxFilePath = path.join(pptxTemplateFolder, pptxFile);
            fs.unlinkSync(pptxFilePath);
        });
    } else {
        mainWindow.webContents.send('pptxTemplate', '');
    }
}

function rewriteFile(filePath, folderTargetName) {
    const folderTarget = path.join(__dirname, folderTargetName);
    const filesInFolder = fs.readdirSync(folderTarget);
    filesInFolder.forEach(file => {
        const filePathTarget = path.join(folderTarget, file);
        fs.unlinkSync(filePathTarget);
    });
    fs.copyFileSync(filePath, path.join(folderTarget, path.basename(filePath)));
    mainWindow.webContents.send(folderTargetName, filePath);
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
    loadFiles()

    ipcMain.on('wordTemplate', (event, message) => {
        rewriteFile(message, 'wordTemplate');
    });

    ipcMain.on('pptxTemplate', (event, message) => {
        rewriteFile(message, 'pptxTemplate');
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
