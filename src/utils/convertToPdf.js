const { exec } = require('child_process');
const path = require('path');

const { app } = require('electron');

const documentsFolder = app.getPath('documents');
const appDocsFolder = path.join(documentsFolder, 'ElectronCertificate');
const appPath = app.getAppPath();

function executeCommand(command) {
    return new Promise((resolve, reject) => {
        const process = exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error}`);
            } else {
                resolve(stdout);
            }
        });

        process.on('exit', (code) => {
            resolve(`Child exited with code ${code}`);
        });
    });
}

async function convertToPdf(inputFile, outputFile, type, progressWindow, length, count) {
    inputFile = path.join(appDocsFolder, inputFile);
    outputFile = path.join(appDocsFolder, outputFile);
    const libreofficePath = path.join(appPath, '..', 'libreoffice', 'program', 'soffice.exe');
    const command = `${libreofficePath} --headless --convert-to pdf --outdir "${outputFile}" "${inputFile}"`;
    try {
        await executeCommand(command);
        progressWindow.webContents.send('progress', count / length * 100);
    } catch (error) {
        console.error(error);
    }
}

module.exports = convertToPdf;