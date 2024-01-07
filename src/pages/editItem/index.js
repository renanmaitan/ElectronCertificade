const { ipcRenderer } = require('electron');

//ELEMENTS
const name = document.getElementById('name');
const cpf = document.getElementById('cpf');
const birthDate = document.getElementById('birthDate');
const phone = document.getElementById('phone');
const email = document.getElementById('email');
const btnSave = document.getElementById('btnSave');

ipcRenderer.on('item', (event, message) => {
    document.title = 'Editar ' + message.name.split(' ')[0];
    name.value = message.name;
    cpf.value = message.cpf;
    birthDate.value = message.birthDate;
    phone.value = message.tel;
    email.value = message.email;
    btnSave.removeEventListener('click', () => {});
    btnSave.addEventListener('click', () => {
        ipcRenderer.send('updateItemFromList', {
            oldItem: message,
            name: name.value,
            cpf: cpf.value,
            birthDate: birthDate.value,
            phone: phone.value,
            email: email.value
        });
        window.close();
    });
});

ipcRenderer.on('withTelAndEmail', (event, message) => {
    if (message) {
        phone.classList.remove('hidden');
        email.classList.remove('hidden');       
    }
});