const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const documentsFolder = app.getPath('documents');
const appDocsFolder = path.join(documentsFolder, 'ElectronCertificate');

const templatesPath = path.join(appDocsFolder, 'templates');

function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

function getTemplateName () {
    const fileNameTemplateFolder = path.join(templatesPath, 'fileNameTemplate', 'fileNameTemplate.txt');
    const fileNameTemplate = fs.readFileSync(fileNameTemplateFolder, 'utf8');
    return fileNameTemplate;
}

function ensureDirectorys() {
    const wordTemplateFolder = path.join(templatesPath, 'wordTemplate');
    ensureDirectoryExists(wordTemplateFolder);
    const pptxTemplateFolder = path.join(templatesPath, 'pptxTemplate');
    ensureDirectoryExists(pptxTemplateFolder);
    const tableTemplateFolder = path.join(templatesPath, 'tableTemplate');
    ensureDirectoryExists(tableTemplateFolder);

    const fileNameTemplateFolder = path.join(templatesPath, 'fileNameTemplate');
    ensureDirectoryExists(fileNameTemplateFolder);
    const fileNameFiles = fs.readdirSync(fileNameTemplateFolder);
    const fileNameTxtFiles = fileNameFiles.filter(file => path.extname(file).toLowerCase() === '.txt');
    if (fileNameTxtFiles.length !== 1) {
        if (fileNameTxtFiles.length > 1) {
        fileNameTxtFiles.forEach(fileNameTxtFile => {
            const fileNameTxtFilePath = path.join(fileNameTemplateFolder, fileNameTxtFile);
            fs.unlinkSync(fileNameTxtFilePath);
        });
        } else {
            // create with the default name (Certificado - {nome})
            const defaultFileName = 'Certificado - {nome}';
            createFile('fileNameTemplate.txt', defaultFileName, 'fileNameTemplate');
        }
    }
}

function loadFiles(mainWindow) {
    const wordTemplateFolder = path.join(templatesPath, 'wordTemplate');
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

    const pptxTemplateFolder = path.join(templatesPath, 'pptxTemplate');
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

    const tableTemplateFolder = path.join(templatesPath, 'tableTemplate');
    const tableFiles = fs.readdirSync(tableTemplateFolder);
    const tableDocxFiles = tableFiles.filter(file => path.extname(file).toLowerCase() === '.docx');
    if (tableDocxFiles.length === 1) {
        const tableDocxFile = tableDocxFiles[0];
        const tableDocxFilePath = path.join(tableTemplateFolder, tableDocxFile);
        mainWindow.webContents.send('tableTemplate', tableDocxFilePath);
    } else if (tableDocxFiles.length > 1) {
        tableDocxFiles.forEach(tableDocxFile => {
            const tableDocxFilePath = path.join(tableTemplateFolder, tableDocxFile);
            fs.unlinkSync(tableDocxFilePath);
        });
    } else {
        mainWindow.webContents.send('tableTemplate', '');
    }
}

function rewriteFile(filePath, folderTargetName, event) {
    const folderTarget = path.join(templatesPath, folderTargetName);
    ensureDirectoryExists(folderTarget);
    const filesInFolder = fs.readdirSync(folderTarget);
    filesInFolder.forEach(file => {
        const filePathTarget = path.join(folderTarget, file);
        fs.unlinkSync(filePathTarget);
    });
    fs.copyFileSync(filePath, path.join(folderTarget, path.basename(filePath)));
    event.reply(folderTargetName, filePath);
}

function createFile(fileName, fileContent, folderTargetName) {
    const folderTarget = path.join(templatesPath, folderTargetName);
    ensureDirectoryExists(folderTarget);
    const filePath = path.join(folderTarget, fileName);
    fs.writeFileSync(filePath, fileContent);
}

function getWithTelAndEmail() {
    const withTelAndEmailFolder = path.join(templatesPath, 'withTelAndEmail');
    ensureDirectoryExists(withTelAndEmailFolder);
    const withTelAndEmailFile = path.join(withTelAndEmailFolder, 'withTelAndEmail.txt');
    if (!fs.existsSync(withTelAndEmailFile)) {
        fs.writeFileSync(withTelAndEmailFile, 'false');
    }
    const withTelAndEmail = fs.readFileSync(withTelAndEmailFile, 'utf8');
    return withTelAndEmail === 'true';
}

function getUppercasedTable() {
    const uppercasedTableFolder = path.join(templatesPath, 'uppercasedTable');
    ensureDirectoryExists(uppercasedTableFolder);
    const uppercasedTableFile = path.join(uppercasedTableFolder, 'uppercasedTable.txt');
    if (!fs.existsSync(uppercasedTableFile)) {
        fs.writeFileSync(uppercasedTableFile, 'true');
    }
    const uppercasedTable = fs.readFileSync(uppercasedTableFile, 'utf8');
    return uppercasedTable === 'true';
}

module.exports = { loadFiles, rewriteFile, createFile, getTemplateName, getWithTelAndEmail, ensureDirectorys, getUppercasedTable };