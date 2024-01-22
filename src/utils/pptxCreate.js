const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const fs = require("fs");
const path = require("path");

const { app } = require('electron');

const documentsFolder = app.getPath('documents');
const appDocsFolder = path.join(documentsFolder, 'ElectronCertificate');

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

const createPptx = (item, handledFileName, variables) => {
    // Load the pptx file as binary content
    const folderPath = path.join(appDocsFolder, "/templates/pptxTemplate");
    //get the file tha has any name
    const filePath = fs.readdirSync(folderPath)[0];
    if (!filePath) {
        return 404;
    }
    const content = fs.readFileSync(
        path.join(appDocsFolder, `/templates/pptxTemplate/${filePath}`),
        "binary"
    );

    // Unzip the content of the file
    const zip = new PizZip(content);

    // This will parse the template, and will throw an error if the template is
    // invalid, for example, if the template is "{user" (no closing tag)
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
    });
    let renderObj = {
        nome: item.name,
        cpf: item.cpf
    };
    Object.keys(variables).forEach(key => {
        const translatedToPortugueseKey = key.replace('date', 'data').replace('hour', 'carga-horária').replace('company', 'empresa').replace('address', 'endereço');
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
        'data-mês-extenso': `${day} de ${monthName} de ${year}`
    }
    // Render the document (Replace {first_name} by John, {last_name} by Doe, ...)
    doc.render(renderObj);

    // Get the zip document and generate it as a nodebuffer
    const buf = doc.getZip().generate({
        type: "nodebuffer",
        // compression: DEFLATE adds a compression step.
        // For a 50MB output document, expect 500ms additional CPU time
        compression: "DEFLATE",
    });

    // buf is a nodejs Buffer, you can either write it to a
    // file or res.send it with express for example.
    const outPutPath = `/output/pptxOutputs/${handledFileName}.pptx`;
    ensureRecursiveDirectoryExistence(path.join(appDocsFolder, outPutPath));
    fs.writeFileSync(path.join(appDocsFolder, outPutPath), buf);
    return outPutPath;
};

module.exports = createPptx;