// PizZip is required because docx/pptx/xlsx files are all zipped files, and
// the PizZip library allows us to load the file in memory
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const fs = require("fs");
const path = require("path");

const { app } = require('electron');

const documentsFolder = app.getPath('documents');
const appDocsFolder = path.join(documentsFolder, 'ElectronCertificate');

function ensureRecursiveDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return;
    }
    fs.mkdirSync(dirname, { recursive: true });
}

const createDocx = (item, handledFileName) => {
    // Load the docx file as binary content
    const folderPath = path.join(appDocsFolder, "/templates/wordTemplate");
    //get the file tha has any name
    const filePath = fs.readdirSync(folderPath)[0];
    if (!filePath) {
        return 404;
    }
    const content = fs.readFileSync(
        path.join(appDocsFolder, `/templates/wordTemplate/${filePath}`),
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

    // Render the document (Replace {first_name} by John, {last_name} by Doe, ...)
    doc.render({
        nome: item.name,
        cpf: item.cpf,
    });

    // Get the zip document and generate it as a nodebuffer
    const buf = doc.getZip().generate({
        type: "nodebuffer",
        // compression: DEFLATE adds a compression step.
        // For a 50MB output document, expect 500ms additional CPU time
        compression: "DEFLATE",
    });
    // buf is a nodejs Buffer, you can either write it to a
    // file or res.send it with express for example.
    
    const outPutPath = `/output/wordOutputs/${handledFileName}.docx`;
    ensureRecursiveDirectoryExistence(path.join(appDocsFolder, outPutPath));
    fs.writeFileSync(path.join(appDocsFolder, outPutPath), buf);
    return outPutPath;
}

module.exports = createDocx;