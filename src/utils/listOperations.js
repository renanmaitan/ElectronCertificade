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
function removeItemsFromList(items) {
    if (!Array.isArray(items)) {
        items = [items];
    }
    items.forEach(itemToRemove => {
        const index = list.findIndex(item => {
            return (
                item.name === itemToRemove.name &&
                item.cpf === itemToRemove.cpf &&
                item.birthDate === itemToRemove.birthDate
            );
        });
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
    const tempList = [];
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine) {
            const parts = trimmedLine.split(' ').filter(part => part.trim() !== '');
            const birthDate = parts.pop();
            const cpf = parts.pop();
            const name = parts.join(' ');
            if (!name || !cpf || !birthDate) {
                return {
                    status: 400,
                    message: 'Erro de formatação na linha: ' + line
                }
            }
            tempList.push({ name, cpf, birthDate });
        }
    }
    list.push(...tempList);
    return {
        status: 200,
        message: 'Lista adicionada com sucesso'
    }
}

module.exports = { addToList, getList, clearList, removeItemsFromList, updateItemFromList, addFromPaste };