const { ipcRenderer } = require('electron');

const fileNameTemplate = ipcRenderer.sendSync('getFileNameTemplate');
const withTelAndEmail = ipcRenderer.sendSync('getWithTelAndEmail');
const uppercasedTable = ipcRenderer.sendSync('getUppercasedTable');
const filesNames = ipcRenderer.sendSync('getFilesNames');

//ELEMENTS
const fileNameInput = document.getElementById('fileNameInput');
const fileNameLabel = document.getElementById('fileNameLabel');
const btnFileName = document.getElementById('btnFileName');
const ligaDesliga = document.getElementById('liga-desliga'); //checkbox
const ligaDesligaMaiusculo = document.getElementById('liga-desliga-maiusculo'); //checkbox
const wordLabel = document.getElementById('wordLabel');
const wordTemplateFile = document.getElementById('wordTemplate');
const pptxLabel = document.getElementById('pptxLabel');
const pptxTemplateFile = document.getElementById('pptxTemplate');
const tableLabel = document.getElementById('tableLabel');
const tableTemplateFile = document.getElementById('tableTemplate');
const btnSetVar = document.getElementById('btnSetVar');

//FUNCTIONS
function handleChangeWordTemplate(path) {
    ipcRenderer.send('wordTemplate', path);
}
function handleChangePptxTemplate(path) {
    ipcRenderer.send('pptxTemplate', path);
}
function handleChangeTableTemplate(path) {
    ipcRenderer.send('tableTemplate', path);
}

//EVENTS
btnSetVar.addEventListener('click', () => { //redirect to setVar page
    location.href = '../setVar/index.html';
});
tableTemplateFile.addEventListener('change', (event) => {
    handleChangeTableTemplate(event.target.files[0].path);
});
pptxTemplateFile.addEventListener('change', (event) => {
    handleChangePptxTemplate(event.target.files[0].path);
});
wordTemplateFile.addEventListener('change', (event) => {
    handleChangeWordTemplate(event.target.files[0].path);
});
btnFileName.addEventListener('click', () => {
    ipcRenderer.send('fileNameTemplate', fileNameInput.value);
    fileNameInput.value = '';
});
ligaDesliga.addEventListener('click', () => {
    ipcRenderer.send('withTelAndEmail', ligaDesliga.checked);
});
ligaDesligaMaiusculo.addEventListener('click', () => {
    ipcRenderer.send('uppercasedTable', ligaDesligaMaiusculo.checked);
});
ipcRenderer.on('fileNameTemplate', (event, message) => {
    if (message !== '') {
        fileNameLabel.innerHTML = message;
    }
});
ipcRenderer.on('withTelAndEmail', (event, message) => {
    if (message) {
        ligaDesliga.checked = true;
    } else {
        ligaDesliga.checked = false;
    }
});
ipcRenderer.on('uppercasedTable', (event, message) => {
    if (message) {
        ligaDesligaMaiusculo.checked = true;
    } else {
        ligaDesligaMaiusculo.checked = false;
    }
});
ipcRenderer.on('wordTemplate', (event, message) => {
    //message is the path of the file
    const fileName = message.split('\\').pop();
    if (message === '') {
        wordLabel.innerHTML = 'Selecione um arquivo';
    }
    else {
        wordLabel.innerHTML = fileName;
    }
});
ipcRenderer.on('pptxTemplate', (event, message) => {
    const fileName = message.split('\\').pop();
    if (message === '') {
        pptxLabel.innerHTML = 'Selecione um arquivo';
    }
    else {
        pptxLabel.innerHTML = fileName;
    }
});
ipcRenderer.on('tableTemplate', (event, message) => {
    const fileName = message.split('\\').pop();
    if (message === '') {
        tableLabel.innerHTML = 'Selecione um arquivo';
    }
    else {
        tableLabel.innerHTML = fileName;
    }
});

//INITIALIZE
fileNameLabel.innerHTML = fileNameTemplate;
ligaDesliga.checked = withTelAndEmail;
ligaDesligaMaiusculo.checked = uppercasedTable;
wordLabel.innerHTML = filesNames.docxFileName !== '' ? filesNames.docxFileName : 'Selecione um arquivo';
pptxLabel.innerHTML = filesNames.pptxFileName !== '' ? filesNames.pptxFileName : 'Selecione um arquivo';
tableLabel.innerHTML = filesNames.tableDocxFileName !== '' ? filesNames.tableDocxFileName : 'Selecione um arquivo';