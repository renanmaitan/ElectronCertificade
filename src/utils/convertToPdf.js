const { exec } = require('child_process');
const path = require('path');

function convertToPdf(inputFile, outputFile, type) {
    inputFile = path.join(__dirname, inputFile);
    outputFile = path.join(__dirname, outputFile);
    const command = `"${__dirname}/../../convert/main.exe" "${inputFile}" "${outputFile}" "${type}"`;
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