const { ipcRenderer } = require('electron');

//ELEMENTS
const wordTemplateFile = document.getElementById('wordTemplate');
const pptxTemplateFile = document.getElementById('pptxTemplate');

const wordLabel = document.getElementById('wordLabel');
const pptxLabel = document.getElementById('pptxLabel');
const btnList = document.getElementById('btnList');
const btnClear = document.getElementById('btnClear');
const birthDateInput = document.getElementById('birthdate');
const cpfInput = document.getElementById('cpf');
const btnAdd = document.getElementById('btnAdd');
const name = document.getElementById('name');
const cpf = document.getElementById('cpf');
const birthdate = document.getElementById('birthdate');
const alert = document.getElementById('alert');
const names = document.getElementById('names');
const btnAddMany = document.getElementById('btnAddMany');
const alertMany = document.getElementById('alertMany');
const btnWord = document.getElementById('btnWord');
const btnPptx = document.getElementById('btnPptx');
const btnOptions = document.getElementById('btnOptions');

//MAKS INPUTS
cpfInput.addEventListener('blur', () => {
    cpfInput.maxLength = 14;
    cpfInput.value = cpfInput.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
});
birthDateInput.addEventListener('blur', () => {
    birthDateInput.maxLength = 10;
    birthDateInput.value = birthDateInput.value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
});
cpfInput.addEventListener('input', () => {
    cpfInput.value = cpfInput.value.replace(/\D/g, '');
});
birthDateInput.addEventListener('input', () => {
    birthDateInput.value = birthDateInput.value.replace(/\D/g, '');
});
cpfInput.addEventListener('focus', () => {
    cpfInput.maxLength = 11;
});
birthDateInput.addEventListener('focus', () => {
    birthDateInput.maxLength = 8;
});

function handleChangeWordTemplate(path) {
    ipcRenderer.send('wordTemplate', path);
}

function handleChangePptxTemplate(path) {
    ipcRenderer.send('pptxTemplate', path);
}

//EVENTS
btnOptions.addEventListener('click', () => {
    ipcRenderer.send('createOptionsWindow');
});
btnWord.addEventListener('click', () => {
    ipcRenderer.send('createDocx');
});
btnPptx.addEventListener('click', () => {
    ipcRenderer.send('createPptx');
});
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
btnAdd.addEventListener('click', () => {
    const result = ipcRenderer.sendSync('addToList', { name: name.value, cpf: cpf.value, birthDate: birthdate.value });
    if (result) {
        name.value = '';
        cpf.value = '';
        birthdate.value = '';
        alert.classList.add('hidden');
    }
    else {
        alert.classList.remove('hidden');
    }
});
btnAddMany.addEventListener('click', () => {
    const result = ipcRenderer.sendSync('addFromPaste', names.value);
    if (result.status === 200) {
        names.value = '';
        alertMany.classList.add('hidden');
    }
    else {
        alertMany.classList.remove('hidden');
        alertMany.innerHTML = '*'+result.message;
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