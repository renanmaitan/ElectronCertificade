const { exec } = require('child_process');
const path = require('path');

const { app } = require('electron');

const documentsFolder = app.getPath('documents');
const appDocsFolder = path.join(documentsFolder, 'ElectronCertificate');
const appPath = app.getAppPath();

function convertToPdf(inputFile, outputFile, type) {
    inputFile = path.join(appDocsFolder, inputFile);
    outputFile = path.join(appDocsFolder, outputFile);
    const converterPath = path.join(appPath,'..', 'converter.exe');
    const command = `"${converterPath}" "${inputFile}" "${outputFile}" "${type}"`;
    const process = exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
        } else {
            console.log(`stdout: ${stdout}`);
        }
    });

    process.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
    });
}

module.exports = convertToPdf;