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

function getMonthName(month) {
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return monthNames[month - 1];
}

function ensureRecursiveDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return;
    }
    fs.mkdirSync(dirname, { recursive: true });
}

function populateTable(data, variables) {
    //variables = {date: '01/01/2020', hour: '00:00', company: 'Company', address: 'Address'}
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
        const itemCopy = {...item};
        (uppercasedTable && (itemCopy.name = itemCopy.name.toUpperCase()));
        Object.keys(itemCopy).forEach(key => {
            const translatedToPortugueseKey = key.replace('birthDate', 'data').replace('name', 'nome');
            renderObj = {
                ...renderObj,
                [translatedToPortugueseKey + (index+1)]: itemCopy[key]
            }
        })
    });
    Object.keys(variables).forEach(key => {
        const translatedToPortugueseKey = key.replace('date', 'data').replace('hour', 'carga-horaria').replace('company', 'empresa').replace('address', 'endereco');
        renderObj = {
            ...renderObj,
            [translatedToPortugueseKey]: variables[key]
        }
    })
    const dateSplit = variables.date.split('/');
    const day = dateSplit[0];
    const month = dateSplit[1];
    const year = dateSplit[2];
    const monthName = getMonthName(month);
    renderObj = {
        ...renderObj,
        'data-mes-extenso': `${day} de ${monthName} de ${year}`
    }
    doc.render(renderObj);
    const buf = doc.getZip().generate({type: 'nodebuffer'});
    const outputFilePath = path.join(outputsPath, 'tableOutputs', fileName);
    ensureRecursiveDirectoryExistence(outputFilePath);
    fs.writeFileSync(outputFilePath, buf);
}

module.exports = populateTable;