const { ipcRenderer } = require('electron');

let withTelAndEmail = false;

//ELEMENTS
const wordTemplateFile = document.getElementById('wordTemplate');
const pptxTemplateFile = document.getElementById('pptxTemplate');
const tableTemplateFile = document.getElementById('tableTemplate');

const wordLabel = document.getElementById('wordLabel');
const pptxLabel = document.getElementById('pptxLabel');
const tableLabel = document.getElementById('tableLabel');
const btnList = document.getElementById('btnList');
const btnClear = document.getElementById('btnClear');
const name = document.getElementById('name');
const cpfInput = document.getElementById('cpf');
const birthDateInput = document.getElementById('birthdate');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const btnAdd = document.getElementById('btnAdd');
const alert = document.getElementById('alert');
const names = document.getElementById('names');
const btnAddMany = document.getElementById('btnAddMany');
const alertMany = document.getElementById('alertMany');
const btnWord = document.getElementById('btnWord');
const btnPptx = document.getElementById('btnPptx');
const btnTable = document.getElementById('btnTable');
const btnOptions = document.getElementById('btnOptions');
const btnShowWordFiles = document.getElementById('btnShowWordFiles');
const btnShowPptxFiles = document.getElementById('btnShowPptxFiles');
const btnShowPdfFromWordFiles = document.getElementById('btnShowPdfFromWordFiles');
const btnShowPdfFromPptxFiles = document.getElementById('btnShowPdfFromPptxFiles');
const btnShowTableFiles = document.getElementById('btnShowTableFiles');
const example = document.getElementById('example');
const emailTitle = document.getElementById('emailTitle');
const phoneTitle = document.getElementById('phoneTitle');
const tableContainer = document.getElementById('tableContainer');

//MAKS INPUTS
cpfInput.addEventListener('blur', () => {
    cpfInput.maxLength = 14;
    cpfInput.value = cpfInput.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
});
birthDateInput.addEventListener('blur', () => {
    birthDateInput.maxLength = 10;
    birthDateInput.value = birthDateInput.value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
});
phoneInput.addEventListener('blur', () => {
    phoneInput.maxLength = 15;
    phoneInput.value = phoneInput.value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
});
cpfInput.addEventListener('input', () => {
    cpfInput.value = cpfInput.value.replace(/\D/g, '');
});
birthDateInput.addEventListener('input', () => {
    birthDateInput.value = birthDateInput.value.replace(/\D/g, '');
});
phoneInput.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, '');
});
cpfInput.addEventListener('focus', () => {
    cpfInput.maxLength = 11;
});
birthDateInput.addEventListener('focus', () => {
    birthDateInput.maxLength = 8;
});
phoneInput.addEventListener('focus', () => {
    phoneInput.maxLength = 11;
});


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
function switchWithTelAndEmail() {
    if (withTelAndEmail) {
        example.innerHTML = '*Modelo: Nome CPF DD/MM/AAAA<br>*Exemplo: João da Silva 123.456.789-10 01/01/2000 (14) 99999-1111 joaodasilva@email.com<br>*Separe os itens por quebra de linha (ENTER)'
        emailTitle.classList.remove('hidden');
        phoneTitle.classList.remove('hidden');
        emailInput.classList.remove('hidden');
        phoneInput.classList.remove('hidden');
        tableContainer.classList.remove('hidden');
        btnShowTableFiles.classList.remove('hidden');
    }
    else {
        example.innerHTML = '*Modelo: Nome CPF DD/MM/AAAA<br>*Exemplo: João da Silva 123.456.789-10 01/01/2000<br>*Separe os itens por quebra de linha (ENTER)'
        emailTitle.classList.add('hidden');
        phoneTitle.classList.add('hidden');
        emailInput.classList.add('hidden');
        phoneInput.classList.add('hidden');
        tableContainer.classList.add('hidden');
        btnShowTableFiles.classList.add('hidden');
    }
}

//EVENTS
btnShowWordFiles.addEventListener('click', () => {
    ipcRenderer.send('showFiles', 'word');
});
btnShowPptxFiles.addEventListener('click', () => {
    ipcRenderer.send('showFiles', 'pptx');
});
btnShowPdfFromWordFiles.addEventListener('click', () => {
    ipcRenderer.send('showFiles', 'pdf_word');
});
btnShowPdfFromPptxFiles.addEventListener('click', () => {
    ipcRenderer.send('showFiles', 'pdf_pptx');
});
btnShowTableFiles.addEventListener('click', () => {
    ipcRenderer.send('showFiles', 'table');
});
btnOptions.addEventListener('click', () => {
    ipcRenderer.send('createOptionsWindow');
});
btnWord.addEventListener('click', () => {
    ipcRenderer.send('createDocx');
});
btnPptx.addEventListener('click', () => {
    ipcRenderer.send('createPptx');
});
btnTable.addEventListener('click', () => {
    ipcRenderer.send('createTable');
});
wordTemplateFile.addEventListener('change', (event) => {
    handleChangeWordTemplate(event.target.files[0].path);
});
pptxTemplateFile.addEventListener('change', (event) => {
    handleChangePptxTemplate(event.target.files[0].path);
});
tableTemplateFile.addEventListener('change', (event) => {
    handleChangeTableTemplate(event.target.files[0].path);
});
btnList.addEventListener('click', () => {
    ipcRenderer.send('createListWindow');
});
btnClear.addEventListener('click', () => {
    ipcRenderer.send('clearList');
});
btnAdd.addEventListener('click', () => {
    const result = ipcRenderer.sendSync('addToList', { name: name.value, cpf: cpfInput.value, birthDate: birthDateInput.value, phone: phoneInput.value, email: emailInput.value });
    if (result) {
        name.value = '';
        cpfInput.value = '';
        birthDateInput.value = '';
        phoneInput.value = '';
        emailInput.value = '';
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
        alertMany.innerHTML = '*' + result.message;
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

ipcRenderer.on('withTelAndEmail', (event, message) => {
    withTelAndEmail = message;
    switchWithTelAndEmail();
});