const { ipcRenderer } = require('electron');

//ELEMENTS
const dateInput = document.getElementById('dateInput');
const hourInput = document.getElementById('hourInput');
const companyInput = document.getElementById('companyInput');
const addressInput = document.getElementById('addressInput');
const btnSave = document.getElementById('btnSave');

//MASKS
dateInput.addEventListener('blur', () => {
    dateInput.maxLength = 10;
    dateInput.value = dateInput.value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
});
dateInput.addEventListener('input', () => {
    dateInput.value = dateInput.value.replace(/\D/g, '');
});
dateInput.addEventListener('focus', () => {
    dateInput.value = dateInput.value.replace(/\D/g, '');
    dateInput.maxLength = 8;
});

//EVENTS
btnSave.addEventListener('click', () => {
    ipcRenderer.send('setVar', {
        date: dateInput.value,
        hour: hourInput.value,
        company: companyInput.value,
        address: addressInput.value
    });
});

const variables = ipcRenderer.sendSync('getVariables');
dateInput.value = variables.date;
hourInput.value = variables.hour;
companyInput.value = variables.company;
addressInput.value = variables.address;