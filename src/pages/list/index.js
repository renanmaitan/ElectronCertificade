const {ipcRenderer} = require('electron');
const lista = [];
let withTelAndEmail = false;

ipcRenderer.send('getList');

ipcRenderer.on('getListResponse', (event, message) => {
    lista.push(...message);
    displayData();
});

ipcRenderer.on('withTelAndEmail', (event, message) => {
    withTelAndEmail = message;
    displayData();
});

// Função para exibir os dados na tabela
function displayData() {
    console.log(withTelAndEmail);
    if (withTelAndEmail) {
        document.getElementById('telColumn').classList.remove('hidden');
        document.getElementById('emailColumn').classList.remove('hidden');
    } else {
        document.getElementById('telColumn').classList.add('hidden');
        document.getElementById('emailColumn').classList.add('hidden');
    }

    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // Limpa a tabela antes de adicionar os dados

    lista.forEach(item => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = item.name;
        row.insertCell().textContent = item.cpf;
        row.insertCell().textContent = item.birthDate;
        row.insertCell().textContent = item.tel;
        row.insertCell().textContent = item.email;

        const actionsCell = row.insertCell();
        
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.addEventListener('click', () => editRow(item));
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.classList.add('deleteButton');
        deleteButton.addEventListener('click', () => deleteRow(item));
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

// Função para editar uma linha substitua por sua lógica de edição)
function editRow(item) {
    console.log(`Editar: ${item.nome}, CPF: ${item.cpf}, Nascimento: ${item.birthDate}`);
}

displayData();