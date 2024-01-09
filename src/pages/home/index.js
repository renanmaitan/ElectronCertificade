const { ipcRenderer } = require('electron');

let withTelAndEmail = false;

//ELEMENTS
const btnList = document.getElementById('btnList');
const name = document.getElementById('name');
const cpfInput = document.getElementById('cpf');
const birthDateInput = document.getElementById('birthdate');
const phoneInput = document.getElementById('phone');
const emailInput = document.getElementById('email');
const btnAdd = document.getElementById('btnAdd');
const alert = document.getElementById('alert');
const names = document.getElementById('names');
const btnAddMany = document.getElementById('btnAddMany');
const alertMany = document.getElementById('alertMany');
const btnWord = document.getElementById('btnWord');
const btnPptx = document.getElementById('btnPptx');
const btnTable = document.getElementById('btnTable');
const btnOptions = document.getElementById('btnOptions');
const btnShowWordFiles = document.getElementById('btnShowWordFiles');
const btnShowPptxFiles = document.getElementById('btnShowPptxFiles');
const btnShowPdfFromWordFiles = document.getElementById('btnShowPdfFromWordFiles');
const btnShowPdfFromPptxFiles = document.getElementById('btnShowPdfFromPptxFiles');
const btnShowTableFiles = document.getElementById('btnShowTableFiles');
const example = document.getElementById('example');
const emailTitle = document.getElementById('emailTitle');
const phoneTitle = document.getElementById('phoneTitle');
const btnUppercase = document.getElementById('btnUppercase');
const btnLowercase = document.getElementById('btnLowercase');
const birthDateTitle = document.getElementById('birthDateTitle');

//MAKS INPUTS
cpfInput.addEventListener('blur', () => {
    cpfInput.maxLength = 14;
    cpfInput.value = cpfInput.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
});
birthDateInput.addEventListener('blur', () => {
    birthDateInput.maxLength = 10;
    birthDateInput.value = birthDateInput.value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
});
phoneInput.addEventListener('blur', () => {
    phoneInput.maxLength = 15;
    phoneInput.value = phoneInput.value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
});
cpfInput.addEventListener('input', () => {
    cpfInput.value = cpfInput.value.replace(/\D/g, '');
});
birthDateInput.addEventListener('input', () => {
    birthDateInput.value = birthDateInput.value.replace(/\D/g, '');
});
phoneInput.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, '');
});
cpfInput.addEventListener('focus', () => {
    cpfInput.value = cpfInput.value.replace(/\D/g, '');
    cpfInput.maxLength = 11;
});
birthDateInput.addEventListener('focus', () => {
    birthDateInput.value = birthDateInput.value.replace(/\D/g, '');
    birthDateInput.maxLength = 8;
});
phoneInput.addEventListener('focus', () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, '');
    phoneInput.maxLength = 11;
});


//FUNCTIONS
function switchWithTelAndEmail() {
    if (withTelAndEmail) {
        example.innerHTML = '*Ordem: Nome CPF DataNascimento Telefone Email<br>*Separe os itens por quebra de linha (ENTER)'
        emailTitle.classList.remove('hidden');
        phoneTitle.classList.remove('hidden');
        emailInput.classList.remove('hidden');
        phoneInput.classList.remove('hidden');
        btnTable.classList.remove('hidden');
        btnShowTableFiles.classList.remove('hidden');
        birthDateInput.classList.remove('hidden');
        birthDateTitle.classList.remove('hidden');
    }
    else {
        example.innerHTML = '*Ordem: Nome CPF<br>*Separe os itens por quebra de linha (ENTER)'
        emailTitle.classList.add('hidden');
        phoneTitle.classList.add('hidden');
        emailInput.classList.add('hidden');
        phoneInput.classList.add('hidden');
        btnTable.classList.add('hidden');
        btnShowTableFiles.classList.add('hidden');
        birthDateInput.classList.add('hidden');
        birthDateTitle.classList.add('hidden');
    }
}
function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}
function validatePhone(phone) {
    const re = /^\d{2} \d{5}-\d{4}$/;
    return re.test(phone);
}
function validateCpf(strCPF) {
    var sum;
    var rest;
    sum = 0;
    if (strCPF == "00000000000") return false;

    for (i = 1; i <= 9; i++) sum = sum + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;

    if ((rest == 10) || (rest == 11)) rest = 0;
    if (rest != parseInt(strCPF.substring(9, 10))) return false;

    sum = 0;
    for (i = 1; i <= 10; i++) sum = sum + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;

    if ((rest == 10) || (rest == 11)) rest = 0;
    if (rest != parseInt(strCPF.substring(10, 11))) return false;
    return true;
}
function validateBirthDate(birthDate) {
    const re = /\d{2}\/\d{2}\/\d{4}/;
    return re.test(birthDate);
}
function validate(name, cpf, birthDate, phone, email) {
    if (name === '' || cpf === '') {
        return "Preencha todos os campos obrigatórios";
    }
    if (!validateCpf(cpf.replace(/\D/g, ''))) {
        return "CPF inválido: " + cpf;
    }
    if (withTelAndEmail) {
        if (phone === '' || email === '' || birthDate === '') {
            return "Preencha todos os campos obrigatórios";
        }
        if (!validateBirthDate(birthDate)) {
            return "Formato de data de nascimento inválido (DD/MM/AAAA): " + birthDate;
        }
        if (!validatePhone(phone)) {
            return "Telefone inválido: " + phone;
        }
        if (!validateEmail(email)) {
            return "Email inválido: " + email;
        }
    }
    return true;
}


//EVENTS
btnUppercase.addEventListener('click', () => { //UPPERCASE NAMES, but not email
    names.value = names.value.split('\n').map(line => {
        const lineSplit = line.split(' ');
        let email;
        if (withTelAndEmail) {
            email = lineSplit.pop();
        }
        const rest = lineSplit.join(' ').toUpperCase();
        return rest + (withTelAndEmail ? ' ' + email : '')
    }).join('\n');
});
btnLowercase.addEventListener('click', () => { //LOWERCASE NAMES, but not email
    //the first letter of each word will be uppercased
    //if "do", "da", "dos", "das", "de" is the last word, it will be lowercased
    names.value = names.value.split('\n').map(line => {
        const lineSplit = line.split(' ');
        let email;
        if (withTelAndEmail) {
            email = lineSplit.pop();
        }
        const rest = lineSplit.map(word => {
            const lowercasedWord = word.toLowerCase();
            if (lowercasedWord === 'do' || lowercasedWord === 'da' || lowercasedWord === 'dos' || lowercasedWord === 'das' || lowercasedWord === 'de') {
                return lowercasedWord
            } else {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
        }).join(' ');
        return rest + (withTelAndEmail ? ' ' + email : '')
    }).join('\n');
});
btnShowWordFiles.addEventListener('click', () => {
    ipcRenderer.send('showFiles', 'word');
});
btnShowPptxFiles.addEventListener('click', () => {
    ipcRenderer.send('showFiles', 'pptx');
});
btnShowPdfFromWordFiles.addEventListener('click', () => {
    ipcRenderer.send('showFiles', 'pdf_word');
});
btnShowPdfFromPptxFiles.addEventListener('click', () => {
    ipcRenderer.send('showFiles', 'pdf_pptx');
});
btnShowTableFiles.addEventListener('click', () => {
    ipcRenderer.send('showFiles', 'table');
});
btnOptions.addEventListener('click', () => {
    ipcRenderer.send('createOptionsWindow');
});
btnWord.addEventListener('click', () => {
    ipcRenderer.send('createDocx');
});
btnPptx.addEventListener('click', () => {
    ipcRenderer.send('createPptx');
});
btnTable.addEventListener('click', () => {
    ipcRenderer.send('createTable');
});

btnList.addEventListener('click', () => {
    ipcRenderer.send('createListWindow');
});
btnAdd.addEventListener('click', () => {
    const status = validate(name.value, cpfInput.value, birthDateInput.value, phoneInput.value.replace('(', '').replace(')', ''), emailInput.value);
    if (status === true) {
        const result = ipcRenderer.sendSync('addToList', { name: name.value, cpf: cpfInput.value, birthDate: birthDateInput.value, phone: phoneInput.value.replace('(', '').replace(')', ''), email: emailInput.value });
        if (result.status === 200) {
            name.value = '';
            cpfInput.value = '';
            birthDateInput.value = '';
            phoneInput.value = '';
            emailInput.value = '';
            alert.classList.add('hidden');
        }
        else {
            alert.classList.remove('hidden');
            alert.innerHTML = '*' + result.message;
        }
    }
    else {
        alert.classList.remove('hidden');
        alert.innerHTML = '*' + status;
    }
});
btnAddMany.addEventListener('click', () => {
    console.log(withTelAndEmail)
    let status = true;
    let isBreak = false;
    names.value = names.value.replace(/ +(?= )/g, '').trim();
    names.value = names.value.split('\n').map(line => {
        line = line.trim();
        const copyLine = line;
        if (isBreak) return line;
        const lineSplit = line.split(' ');
        let email, phone, birthDate;
        if (withTelAndEmail) {
            email = lineSplit.pop();
            const finalPhone = lineSplit.pop();
            if (finalPhone.length === 11) {
                phone = finalPhone.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '$1 $2-$3');
            } else {
                phone = (lineSplit.pop() + ' ' + finalPhone).replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '$1 $2-$3');
            }
            birthDate = lineSplit.pop().replace(/\D/g, '').replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
        }
        const cpf = lineSplit.pop().replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        const name = lineSplit.join(' ');
        console.log(name, cpf, birthDate, phone, email)
        status = validate(name, cpf, birthDate, phone, email);
        if (status !== true) {
            isBreak = true;
            return copyLine;
        }
        return name + ' ' + cpf + ' ' + (withTelAndEmail ? birthDate + ' ' + phone + ' ' + email : '')
    }).join('\n');
    if (status && !isBreak) {
        const result = ipcRenderer.sendSync('addFromPaste', names.value);
        if (result.status === 200) {
            names.value = '';
            alertMany.classList.add('hidden');
        }
        else {
            alertMany.classList.remove('hidden');
            alertMany.innerHTML = '*' + result.message;
        }
    } else {
        alertMany.classList.remove('hidden');
        alertMany.innerHTML = '*' + status;
    }
});
ipcRenderer.on('withTelAndEmail', (event, message) => {
    withTelAndEmail = message;
    switchWithTelAndEmail();
});