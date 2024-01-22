const { ipcRenderer } = require('electron');

//ELEMENTS
const name = document.getElementById('name');
const cpf = document.getElementById('cpf');
const birthDate = document.getElementById('birthDate');
const phone = document.getElementById('phone');
const email = document.getElementById('email');
const btnSave = document.getElementById('btnSave');

//MAKS
//MAKS INPUTS
cpf.addEventListener('blur', () => {
    cpf.maxLength = 14;
    cpf.value = cpf.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
});
birthDate.addEventListener('blur', () => {
    birthDate.maxLength = 10;
    birthDate.value = birthDate.value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
});
phone.addEventListener('blur', () => {
    phone.maxLength = 15;
    phone.value = phone.value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
});
cpf.addEventListener('input', () => {
    cpf.value = cpf.value.replace(/\D/g, '');
});
birthDate.addEventListener('input', () => {
    birthDate.value = birthDate.value.replace(/\D/g, '');
});
phone.addEventListener('input', () => {
    phone.value = phone.value.replace(/\D/g, '');
});
cpf.addEventListener('focus', () => {
    cpf.value = cpf.value.replace(/\D/g, '');
    cpf.maxLength = 11;
});
birthDate.addEventListener('focus', () => {
    birthDate.value = birthDate.value.replace(/\D/g, '');
    birthDate.maxLength = 8;
});
phone.addEventListener('focus', () => {
    phone.value = phone.value.replace(/\D/g, '');
    phone.maxLength = 11;
});

ipcRenderer.on('item', (event, message) => {
    document.title = 'Editar ' + message.name.split(' ')[0];
    name.value = message.name;
    cpf.value = message.cpf;
    birthDate.value = message.birthDate;
    phone.value = '('+ message.tel.split(' ')[0] +') '+ message.tel.split(' ')[1];
    email.value = message.email;
    btnSave.removeEventListener('click', () => {});
    btnSave.addEventListener('click', () => {
        ipcRenderer.send('updateItemFromList', {
            oldItem: message,
            name: name.value,
            cpf: cpf.value,
            birthDate: birthDate.value,
            phone: phone.value.replace('(', '').replace(')', ''),
            email: email.value
        });
        window.close();
    });
});

ipcRenderer.on('withTelAndEmail', (event, message) => {
    if (message) {
        phone.classList.remove('hidden');
        email.classList.remove('hidden');
        birthDate.classList.remove('hidden');     
    }
});