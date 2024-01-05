const { ipcRenderer } = require('electron');


//ELEMENTS
const fileNameInput = document.getElementById('fileNameInput');
const fileNameLabel = document.getElementById('fileNameLabel');
const btnFileName = document.getElementById('btnFileName');

//EVENTS
btnFileName.addEventListener('click', () => {
    ipcRenderer.send('fileNameTemplate', fileNameInput.value);
    fileNameInput.value = '';
});
ipcRenderer.on('fileNameTemplate', (event, message) => {
    if (message !== '') {
        fileNameLabel.innerHTML = message;
    }
});