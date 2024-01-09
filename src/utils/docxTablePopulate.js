// Get a existing table and populate it with data
// Data should be = [{key: value, key: value, key: value, key: value, key: value], [{key: value, key: value, key: value, key: value, key: value], ...]

const DocxTemplater = require('docxtemplater');
const PizZip = require('pizzip');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { getUppercasedTable } = require('./fileOperations');

const documentsFolder = app.getPath('documents');
const appDocsFolder = path.join(documentsFolder, 'ElectronCertificate');
const outputsPath = path.join(appDocsFolder, 'output');
const docsPath = path.join(appDocsFolder, 'templates');

function ensureRecursiveDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return;
    }
    fs.mkdirSync(dirname, { recursive: true });
}

function populateTable(data) {
    const uppercasedTable = getUppercasedTable();
    const folderPath = path.join(docsPath, 'tableTemplate');
    const fileName = fs.readdirSync(folderPath)[0];
    if (!fileName) {
        return 404;
    }
    const zip = new PizZip(fs.readFileSync(path.join(folderPath, fileName)));
    const doc = new DocxTemplater(zip);
    let renderObj = {};
    data.forEach((item, index) => {
        (uppercasedTable && (item.name = item.name.toUpperCase()));
        Object.keys(item).forEach(key => {
            const translatedToPortugueseKey = key.replace('birthDate', 'data').replace('name', 'nome');
            renderObj = {
                ...renderObj,
                [translatedToPortugueseKey + (index+1)]: item[key]
            }
        })
    });
    doc.render(renderObj);
    const buf = doc.getZip().generate({type: 'nodebuffer'});
    const outputFilePath = path.join(outputsPath, 'tableOutputs', fileName);
    ensureRecursiveDirectoryExistence(outputFilePath);
    fs.writeFileSync(outputFilePath, buf);
}

module.exports = populateTable;