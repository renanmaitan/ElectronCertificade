const { ipcRenderer } = require('electron');


//ELEMENTS
const fileNameInput = document.getElementById('fileNameInput');
const fileNameLabel = document.getElementById('fileNameLabel');
const btnFileName = document.getElementById('btnFileName');
const ligaDesliga = document.getElementById('liga-desliga'); //checkbox

//EVENTS
btnFileName.addEventListener('click', () => {
    ipcRenderer.send('fileNameTemplate', fileNameInput.value);
    fileNameInput.value = '';
});
ligaDesliga.addEventListener('click', () => {
    ipcRenderer.send('withTelAndEmail', ligaDesliga.checked);
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
