const { ipcRenderer } = require('electron');

//ELEMENTS
const wordTemplateFile = document.getElementById('wordTemplate');
const pptxTemplateFile = document.getElementById('pptxTemplate');
const wordLabel = document.getElementById('wordLabel');
const pptxLabel = document.getElementById('pptxLabel');
const btnList = document.getElementById('btnList');
const btnClear = document.getElementById('btnClear');


function handleChangeWordTemplate(path) {
    ipcRenderer.send('wordTemplate', path);
}

function handleChangePptxTemplate(path) {
    ipcRenderer.send('pptxTemplate', path);
}

//EVENTS
wordTemplateFile.addEventListener('change', (event) => {
    handleChangeWordTemplate(event.target.files[0].path);
});
pptxTemplateFile.addEventListener('change', (event) => {
    handleChangePptxTemplate(event.target.files[0].path);
});
btnList.addEventListener('click', () => {
    ipcRenderer.send('createListWindow');
});
btnClear.addEventListener('click', () => {
    ipcRenderer.send('clearList');
});

ipcRenderer.on('test', (event, message) => {
    console.log(message);
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