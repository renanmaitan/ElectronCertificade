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

function getTemplateName() {
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
            const defaultFileName = 'Certificado - {nome}';
            createFile('fileNameTemplate.txt', defaultFileName, 'fileNameTemplate');
        }
    }
}

function getFilesNames() {
    const wordTemplateFolder = path.join(templatesPath, 'wordTemplate');
    const wordFiles = fs.readdirSync(wordTemplateFolder);
    const docxFiles = wordFiles.filter(file => path.extname(file).toLowerCase() === '.docx');
    const docxFile = docxFiles[0];
    let docxFileName = '';
    if (docxFile) {
        const docxFilePath = path.join(wordTemplateFolder, docxFile);
        docxFileName = path.basename(docxFilePath);
    }

    const pptxTemplateFolder = path.join(templatesPath, 'pptxTemplate');
    const pptFiles = fs.readdirSync(pptxTemplateFolder);
    const pptxFiles = pptFiles.filter(file => path.extname(file).toLowerCase() === '.pptx');
    const pptxFile = pptxFiles[0];
    let pptxFileName = '';
    if (pptxFile) {
        const pptxFilePath = path.join(pptxTemplateFolder, pptxFile);
        pptxFileName = path.basename(pptxFilePath);
    }

    const tableTemplateFolder = path.join(templatesPath, 'tableTemplate');
    const tableFiles = fs.readdirSync(tableTemplateFolder);
    const tableDocxFiles = tableFiles.filter(file => path.extname(file).toLowerCase() === '.docx');
    const tableDocxFile = tableDocxFiles[0];
    let tableDocxFileName = '';
    if (tableDocxFile) {
        const tableDocxFilePath = path.join(tableTemplateFolder, tableDocxFile);
        tableDocxFileName = path.basename(tableDocxFilePath);
    }

    return { docxFileName, pptxFileName, tableDocxFileName };
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

function getVariables() {
    const varsFolder = path.join(templatesPath, 'variables');
    ensureDirectoryExists(varsFolder);
    const varsFile = path.join(varsFolder, 'variables.txt');
    if (!fs.existsSync(varsFile)) {
        fs.writeFileSync(varsFile, '{"date": "", "hour": "", "company": "", "address": ""}');
    }
    const vars = fs.readFileSync(varsFile, 'utf8');
    const jsonVars = JSON.parse(vars);
    return jsonVars;
}

function setVariables(vars) {
    const varsFolder = path.join(templatesPath, 'variables');
    ensureDirectoryExists(varsFolder);
    const varsFile = path.join(varsFolder, 'variables.txt');
    fs.writeFileSync(varsFile, JSON.stringify(vars));
}

module.exports = {
    rewriteFile,
    createFile,
    getTemplateName,
    getWithTelAndEmail,
    ensureDirectorys,
    getUppercasedTable,
    getVariables,
    setVariables,
    getFilesNames
};