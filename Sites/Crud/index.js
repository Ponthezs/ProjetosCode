'use strict';

// ========== TEMA DARK MODE ==========
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton();
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton();
};

const updateThemeButton = () => {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    const button = document.getElementById('themeToggle');
    button.textContent = theme === 'light' ? '🌙' : '☀️';
};

// ========== FORMATAÇÃO E VALIDAÇÃO ==========
// Formatação de telefone
const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 11) return phone;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
};

// Validação de telefone
const isValidPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 11;
};

// Duplicata de email
const isEmailDuplicate = (email, currentIndex = null) => {
    const dbClient = readClient();
    return dbClient.some((client, index) => client.email === email && index !== currentIndex);
};

// Notificações
const showNotification = (message, type = 'success') => {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 3000);
};

const openModal = () => document.getElementById('modal').classList.add('active');

const closeModal = () => {
    clearFields();
    document.getElementById('modal').classList.remove('active');
}

const getLocalStorage = () => JSON.parse(localStorage.getItem('db_client')) ?? [];
const setLocalStorage = (dbClient) => localStorage.setItem("db_client", JSON.stringify(dbClient));

let currentSearch = '';
let sortConfig = { key: null, direction: 'asc' };

// ========== CRUD - Create, Read, Update, Delete ==========
const deleteClient = (index) => {
    const confirmed = confirm('Tem certeza que deseja deletar este cliente?');
    if (!confirmed) return;
    
    const dbClient = readClient();
    const deletedClient = dbClient[index];
    dbClient.splice(index, 1);
    setLocalStorage(dbClient);
    showNotification(`Cliente "${deletedClient.nome}" deletado com sucesso!`, 'success');
    updateStats();
    updateTable();
}

const updateClient = (index, client) => {
    const dbClient = readClient();
    dbClient[index] = client;
    setLocalStorage(dbClient);
    showNotification(`Cliente "${client.nome}" atualizado com sucesso!`, 'success');
    updateStats();
    updateTable();
}

const readClient = () => getLocalStorage();

const createClient = (client) => {
    const dbClient = getLocalStorage();
    dbClient.push(client);
    setLocalStorage(dbClient);
    showNotification(`Cliente "${client.nome}" cadastrado com sucesso!`, 'success');
    updateStats();
    updateTable();
}

const isValidFields = () => {
    if (!document.getElementById('form').reportValidity()) return false;
    
    const email = document.getElementById('email').value;
    const index = document.getElementById('nome').dataset.index;
    const currentIndex = index === 'new' ? null : parseInt(index);
    
    if (isEmailDuplicate(email, currentIndex)) {
        showNotification('Este email já está cadastrado!', 'error');
        return false;
    }
    
    return true;
};

// Interação com o layout
const clearFields = () => {
    const fields = document.querySelectorAll('.modal-field');
    fields.forEach(field => field.value = "");
    document.getElementById('nome').dataset.index = 'new';
}

const saveClient = () => {
    if (isValidFields()) {
        const client = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            celular: document.getElementById('celular').value,
            cidade: document.getElementById('cidade').value
        };
        const index = document.getElementById('nome').dataset.index;
        if (index === 'new') {
            createClient(client);
        } else {
            updateClient(index, client);
        }
        closeModal();
    }
}

const createRow = (client, index) => {
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td data-label="Nome">${escapeHtml(client.nome)}</td>
        <td data-label="E-mail">${escapeHtml(client.email)}</td>
        <td data-label="Celular">${escapeHtml(client.celular)}</td>
        <td data-label="Cidade">${escapeHtml(client.cidade)}</td>
        <td class="actions">
            <button type="button" class="button green" id="edit-${index}" title="Editar">✏️</button>
            <button type="button" class="button red" id="delete-${index}" title="Deletar">🗑️</button>
        </td>
    `;
    document.querySelector('#tbClient>tbody').appendChild(newRow);
}

// Escape para evitar XSS
const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

const clearTable = () => {
    const rows = document.querySelectorAll('#tbClient>tbody tr');
    rows.forEach(row => row.parentNode.removeChild(row));
}

const searchClients = (query) => {
    const dbClient = readClient();
    currentSearch = query.toLowerCase();
    clearTable();
    
    const filtered = dbClient.filter((client, index) => {
        const match = 
            client.nome.toLowerCase().includes(currentSearch) ||
            client.email.toLowerCase().includes(currentSearch) ||
            client.celular.includes(currentSearch);
        
        if (match) createRow(client, index);
        return match;
    });
    
    if (query && filtered.length === 0) {
        document.getElementById('emptyState').style.display = 'block';
        document.getElementById('tbClient').style.display = 'none';
    } else {
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('tbClient').style.display = 'table';
    }
}

const clearSearch = () => {
    document.getElementById('searchInput').value = '';
    updateTable();
}

const updateTable = () => {
    const dbClient = readClient();
    clearTable();
    
    if (dbClient.length === 0) {
        document.getElementById('noRecords').style.display = 'block';
        document.getElementById('tbClient').style.display = 'none';
    } else {
        document.getElementById('noRecords').style.display = 'none';
        document.getElementById('tbClient').style.display = 'table';
        
        let sortedData = [...dbClient];
        
        if (sortConfig.key) {
            sortedData.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];
                
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }
                
                if (sortConfig.direction === 'asc') {
                    return aValue > bValue ? 1 : -1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });
        }
        
        sortedData.forEach((client, index) => {
            createRow(client, index);
        });
    }
}

const sortTable = (key) => {
    if (sortConfig.key === key) {
        sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
        sortConfig.key = key;
        sortConfig.direction = 'asc';
    }
    updateTable();
}

// ========== ESTATÍSTICAS ==========
const updateStats = () => {
    const dbClient = readClient();
    const statsContainer = document.getElementById('statsContainer');
    
    if (dbClient.length === 0) {
        statsContainer.style.display = 'none';
    } else {
        statsContainer.style.display = 'flex';
        document.getElementById('totalClients').textContent = dbClient.length;
        document.getElementById('lastUpdate').textContent = new Date().toLocaleString('pt-BR');
    }
}

// ========== IMPORTAÇÃO E EXPORTAÇÃO ==========
const exportToCSV = () => {
    const dbClient = readClient();
    if (dbClient.length === 0) {
        showNotification('Nenhum cliente para exportar!', 'warning');
        return;
    }
    
    let csv = 'Nome,Email,Celular,Cidade\n';
    dbClient.forEach(client => {
        csv += `"${client.nome}","${client.email}","${client.celular}","${client.cidade}"\n`;
    });
    
    downloadFile(csv, 'clientes.csv', 'text/csv');
    showNotification('Dados exportados com sucesso!', 'success');
}

const exportToJSON = () => {
    const dbClient = readClient();
    if (dbClient.length === 0) {
        showNotification('Nenhum cliente para exportar!', 'warning');
        return;
    }
    
    const json = JSON.stringify(dbClient, null, 2);
    downloadFile(json, 'clientes.json', 'application/json');
    showNotification('Dados exportados em JSON!', 'success');
}

const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target.result;
            let data = [];
            
            if (file.name.endsWith('.json')) {
                data = JSON.parse(content);
            } else if (file.name.endsWith('.csv')) {
                data = parseCSV(content);
            } else {
                showNotification('Formato inválido! Use JSON ou CSV.', 'error');
                return;
            }
            
            if (!Array.isArray(data) || data.length === 0) {
                showNotification('Arquivo vazio ou inválido!', 'error');
                return;
            }
            
            const confirmed = confirm(`Deseja importar ${data.length} cliente(s)? Isto substituirá os dados atuais.`);
            if (confirmed) {
                setLocalStorage(data);
                updateStats();
                updateTable();
                showNotification(`${data.length} cliente(s) importado(s) com sucesso!`, 'success');
            }
        } catch (error) {
            showNotification('Erro ao importar arquivo: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

const parseCSV = (content) => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length === 4) {
            data.push({
                nome: values[0],
                email: values[1],
                celular: values[2],
                cidade: values[3]
            });
        }
    }
    
    return data;
}

const fillFields = (client, index) => {
    document.getElementById('nome').value = client.nome;
    document.getElementById('email').value = client.email;
    document.getElementById('celular').value = client.celular;
    document.getElementById('cidade').value = client.cidade;
    document.getElementById('nome').dataset.index = index;
}

const editClient = (index) => {
    const client = readClient()[index];
    fillFields(client, index);
    openModal();
}

const editDelete = (event) => {
    if (event.target.type === "button") {
        const [action, index] = event.target.id.split('-');

        if (action === 'edit') {
            editClient(index);
        } else if (action === 'delete') {
            deleteClient(index);
        }
    }
}

// Format phone input in real-time
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    // Cancelar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('modal').classList.contains('active')) {
            closeModal();
        }
    });

    // Busca em tempo real
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchClients(e.target.value);
    });

    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Export
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    
    // Import
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importData);

    updateStats();
    updateTable();
});

// Eventos
document.getElementById('cadastrarCliente').addEventListener('click', openModal);

document.getElementById('modalClose').addEventListener('click', closeModal);

document.getElementById('salvar').addEventListener('click', saveClient);

document.getElementById('cancelar').addEventListener('click', closeModal);

document.querySelector('#tbClient>tbody').addEventListener('click', editDelete);
