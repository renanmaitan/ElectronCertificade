const { ipcRenderer } = require('electron');

//ELEMENTS
const dateInput = document.getElementById('dateInput');
const hourInput = document.getElementById('hourInput');
const companyInput = document.getElementById('companyInput');
const addressInput = document.getElementById('addressInput');
const btnSave = document.getElementById('btnSave');

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