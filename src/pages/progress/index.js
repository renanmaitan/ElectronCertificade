const { ipcRenderer } = require('electron');

const progressBar = document.getElementsByClassName('progress-bar')[0];
const title = document.getElementsByClassName('title')[0];

let operationType;
let dots = '.';

ipcRenderer.on('progress', (event, value) => {
    progress(value);
});
ipcRenderer.on('operationType', (event, value) => {
    operationType = value;
    title.innerHTML = 'Gerando documentos '+value+' e convertendo para pdf...';
});

const dotsLoading = setInterval(() => {
    progressBar.setAttribute('data-label', 'Carregando' + dots);
    if (dots.length > 3) {
        dots = '.';
    } else {
        dots += '.';
    }
}, 500);

function progress(value) {
    progressBar.style.setProperty('--width', value);
    if (value >= 100) {
        clearInterval(dotsLoading);
        title.innerHTML = 'Concluído!';
        progressBar.setAttribute('data-label', 'Concluído!');
        progressBar.style.setProperty('--width', value);
        ipcRenderer.send('progress-finished', operationType);
    }
}