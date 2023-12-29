let list = [];

function addToList(name, cpf, birthDate) {
    if (name && cpf && birthDate) {
        list.push({
            name: name,
            cpf: cpf,
            birthDate: birthDate
        });
        return true;
    } else {
        return false;
    }
}

function getList() {
    return list;
}

function clearList() {
    list = [];
}

function removeItensFromList(itens) {
    itens.forEach(item => {
        const index = list.indexOf(item);
        if (index > -1) {
            list.splice(index, 1);
        }
    });
}

function updateItemFromList(item, name, cpf, birthDate) {
    const index = list.indexOf(item);
    if (index > -1) {
        list[index].name = name;
        list[index].cpf = cpf;
        list[index].birthDate = birthDate;
    }
}

function addFromPaste(pastedText) {
    const lines = pastedText.split('\n');
    for (const line of lines) {
        const trimmedLine = line.trim().replace(/ {2,}/g, ' '); 
        if (trimmedLine) {
            const parts = trimmedLine.split(' ');
            if (parts.length !== 3) {
                return 400;
            }
            
            const birthDate = parts.pop();
            const cpf = parts.pop();
            const name = parts.join(' ');

            list.push({ "name": name, "cpf": cpf, "birthDate": birthDate });
        }
    }
}

module.exports = { addToList, getList, clearList, removeItensFromList, updateItemFromList, addFromPaste };