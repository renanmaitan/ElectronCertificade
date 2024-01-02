const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

function getTemplateName () {
    const fileNameTemplateFolder = path.join(__dirname, '..', '..', 'templates', 'fileNameTemplate', 'fileNameTemplate.txt');
    const fileNameTemplate = fs.readFileSync(fileNameTemplateFolder, 'utf8');
    return fileNameTemplate;
}

function loadFiles(mainWindow) {
    const wordTemplateFolder = path.join(__dirname, '..', '..', 'templates', 'wordTemplate');
    ensureDirectoryExists(wordTemplateFolder);
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

    const pptxTemplateFolder = path.join(__dirname, '..', '..', 'templates', 'pptxTemplate');
    ensureDirectoryExists(pptxTemplateFolder);
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

    const fileNameTemplateFolder = path.join(__dirname, '..', '..', 'templates', 'fileNameTemplate');
    ensureDirectoryExists(fileNameTemplateFolder);
    const fileNameFiles = fs.readdirSync(fileNameTemplateFolder);
    const fileNameTxtFiles = fileNameFiles.filter(file => path.extname(file).toLowerCase() === '.txt');
    if (fileNameTxtFiles.length === 1) {
        const fileNameTxtFile = fileNameTxtFiles[0];
        const fileNameTxtFilePath = path.join(fileNameTemplateFolder, fileNameTxtFile);
        const fileNameTxtFileContent = fs.readFileSync(fileNameTxtFilePath, 'utf8');
        mainWindow.webContents.send('fileNameTemplate', fileNameTxtFileContent);
    } else if (fileNameTxtFiles.length > 1) {
        fileNameTxtFiles.forEach(fileNameTxtFile => {
            const fileNameTxtFilePath = path.join(fileNameTemplateFolder, fileNameTxtFile);
            fs.unlinkSync(fileNameTxtFilePath);
        });
    } else {
        // create with the default name (Certificado - {nome})
        const defaultFileName = 'Certificado - {nome}';
        createFile('fileNameTemplate.txt', defaultFileName, 'fileNameTemplate');
        mainWindow.webContents.send('fileNameTemplate', defaultFileName);
    }
}

function rewriteFile(filePath, folderTargetName, mainWindow) {
    const folderTarget = path.join(__dirname, '..', '..', 'templates', folderTargetName);
    ensureDirectoryExists(folderTarget);
    const filesInFolder = fs.readdirSync(folderTarget);
    filesInFolder.forEach(file => {
        const filePathTarget = path.join(folderTarget, file);
        fs.unlinkSync(filePathTarget);
    });
    fs.copyFileSync(filePath, path.join(folderTarget, path.basename(filePath)));
    mainWindow.webContents.send(folderTargetName, filePath);
}

function createFile(fileName, fileContent, folderTargetName) {
    const folderTarget = path.join(__dirname, '..', '..', 'templates', folderTargetName);
    ensureDirectoryExists(folderTarget);
    const filePath = path.join(folderTarget, fileName);
    fs.writeFileSync(filePath, fileContent);
}


module.exports = { loadFiles, rewriteFile, createFile, getTemplateName };