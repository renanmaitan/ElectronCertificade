const { ipcRenderer } = require('electron');
const lista = [];
ipcRenderer.send('getList');
let withTelAndEmail = ipcRenderer.sendSync('getWithTelAndEmail');

//ELEMENTS
const reloadIcon = document.getElementById('reloadIcon');
const realodContainer = document.getElementById('reloadContainer');
const realodingContainer = document.getElementById('reloadingContainer');
const tableBody = document.getElementById('tableBody');
const btnClear = document.getElementById('btnClear');

let handleClick = (event) => {
    const target = event.target;
    if (target.classList.contains('editButton')) {
        const item = JSON.parse(target.closest('tr').dataset.item);
        editRow(item);
    } else if (target.classList.contains('deleteButton')) {
        const item = JSON.parse(target.closest('tr').dataset.item);
        deleteRow(item);
    }
}
tableBody.addEventListener('click', handleClick);

//EVENTS
btnClear.addEventListener('click', () => {
    ipcRenderer.send('clearList');
});
reloadIcon.addEventListener('click', () => {
    realodContainer.classList.add('hidden');
    realodingContainer.classList.remove('hidden');
    ipcRenderer.send('reloadList');
});

ipcRenderer.on('getListResponse', (event, message) => {
    lista.push(...message);
    realodContainer.classList.remove('hidden');
    realodingContainer.classList.add('hidden');
    displayData();
});

// Função para exibir os dados na tabela
function displayData() {
    if (withTelAndEmail) {
        document.getElementById('telColumn').classList.remove('hidden');
        document.getElementById('emailColumn').classList.remove('hidden');
    } else {
        document.getElementById('telColumn').classList.add('hidden');
        document.getElementById('emailColumn').classList.add('hidden');
    }
    tableBody.innerHTML = ''; // Limpa a tabela antes de adicionar os dados
    console.log(lista);
    lista.forEach(item => {
        const row = tableBody.insertRow();
        row.dataset.item = JSON.stringify(item);
        row.insertCell().textContent = item.name;
        row.insertCell().textContent = item.cpf;
        row.insertCell().textContent = item.birthDate;
        (withTelAndEmail ? row.insertCell().textContent = item.tel : null);
        (withTelAndEmail ? row.insertCell().textContent = item.email : null);

        const actionsCell = row.insertCell();

        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.classList.add('editButton');
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.classList.add('deleteButton');
        actionsCell.appendChild(deleteButton);
    });
}

// Função para excluir uma linha
function deleteRow(item) {
    const index = lista.indexOf(item);
    if (index !== -1) {
        lista.splice(index, 1);
        displayData();
    }
    ipcRenderer.send('removeItemsFromList', item);
}

// Função para editar uma linha)
function editRow(item) {
    ipcRenderer.send('editItem', item);
}