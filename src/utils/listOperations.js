const { getWithTelAndEmail } = require('./fileOperations');

const withTelAndEmail = getWithTelAndEmail();

let list = [];

function addToList(name, cpf, birthDate, tel = '', email = '') {
    const index = list.findIndex(item => item.cpf === cpf);
    if (index > -1) {
        return {
            status: 409,
            message: 'Esse CPF já está cadastrado'
        }
    }
    if (name && cpf && birthDate) {
        list.push({
            name: name,
            cpf: cpf,
            birthDate: birthDate,
            email: email,
            tel: tel
        });
        return {
            status: 200,
            message: 'Adicionado com sucesso'
        }
    } else {
        return {
            status: 400,
            message: 'Erro de formatação'
        }
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
        const index = list.findIndex(item => item.cpf === itemToRemove.cpf);
        if (index > -1) {
            list.splice(index, 1);
        }
    });
}

function updateItemFromList(oldItem, name, cpf, birthDate,  tel = '', email = '') {
    if (name && cpf && birthDate) {
        const index = list.findIndex(item => item.cpf === oldItem.cpf);
        if (index > -1) {
            list[index] = {
                name: name,
                cpf: cpf,
                birthDate: birthDate,
                email: email,
                tel: tel
            };
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function addFromPaste(pastedText) {
    const lines = pastedText.split('\n');
    const tempList = [];
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine) {
            const parts = trimmedLine.split(' ').filter(part => part.trim() !== '');
            const email = withTelAndEmail ? parts.pop() : '';
            const finalTel = withTelAndEmail ? parts.pop() : '';
            const tel = withTelAndEmail ? ('('+parts.pop()+')' + ' ' + finalTel) : '';
            const birthDate = parts.pop();
            const cpf = parts.pop();
            const name = parts.join(' ');
            if (!name || !cpf || !birthDate || (withTelAndEmail && (!email || !tel))) {
                return {
                    status: 400,
                    message: 'Erro de formatação na linha: ' + line
                }
            }
            const index = list.findIndex(item => item.cpf === cpf);
            if (index > -1) {
                return {
                    status: 409,
                    message: 'CPF já cadastrado. Linha: ' + line
                }
            }
            tempList.push({ name, cpf, birthDate, email, tel });
        }
    }
    list.push(...tempList);
    return {
        status: 200,
        message: 'Lista adicionada com sucesso'
    }
}

module.exports = { addToList, getList, clearList, removeItemsFromList, updateItemFromList, addFromPaste };