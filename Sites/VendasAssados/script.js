// --- CONFIGURAÇÕES GERAIS ---
const PRECO_KG_FRANGO = 28.00; 
const PRECO_KG_COSTELA = 50.00; 
const USUARIO_ADM = "ADM";
const SENHA_ADM = "1234";

// Variáveis globais para modais (declaradas aqui para escopo global no script)
let currentModalConfirmCallback = null;
let currentModalCancelCallback = null;
let currentPromptModalConfirmCallback = null;
let currentPromptModalCancelCallback = null;

// --- LÓGICA DE AUTENTICAÇÃO E INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split("/").pop() || "index.html"; // Garante que haja um valor

    // Proteção de Rotas e Redirecionamento
    if (currentPage !== "index.html" && !sessionStorage.getItem('loggedIn')) {
        window.location.href = 'index.html';
        return; // Impede a execução do resto do script se redirecionar
    }
    if ((currentPage === "index.html" || currentPage === "") && sessionStorage.getItem('loggedIn')) {
        window.location.href = 'dashboard.html';
        return; // Impede a execução do resto do script se redirecionar
    }

    // Elementos comuns a várias páginas (modais, logout)
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }

    // Modais - Botões de confirmação/cancelamento
    const modalConfirmBtn = document.getElementById('modalConfirm');
    const modalCancelBtn = document.getElementById('modalCancel');
    const promptModalConfirmBtn = document.getElementById('promptModalConfirm');
    const promptModalCancelBtn = document.getElementById('promptModalCancel');
    const editVendaConfirmBtn = document.getElementById('editVendaConfirmBtn');
    const editVendaCancelBtn = document.getElementById('editVendaCancelBtn');

    if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', () => {
        if (currentModalConfirmCallback) currentModalConfirmCallback();
        closeConfirmationModal();
    });
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', () => {
        if (currentModalCancelCallback) currentModalCancelCallback();
        closeConfirmationModal();
    });
    if (promptModalConfirmBtn) promptModalConfirmBtn.addEventListener('click', () => {
        const promptModalInput = document.getElementById('promptModalInput');
        const promptModalError = document.getElementById('promptModalError');
        const value = parseFloat(promptModalInput.value);
        if (isNaN(value) || value <= 0) {
            if(promptModalError) promptModalError.style.display = 'block';
            return;
        }
        if(promptModalError) promptModalError.style.display = 'none';
        if (currentPromptModalConfirmCallback) currentPromptModalConfirmCallback(value);
        closePromptModal();
    });
    if (promptModalCancelBtn) promptModalCancelBtn.addEventListener('click', () => {
        if (currentPromptModalCancelCallback) currentPromptModalCancelCallback();
        closePromptModal();
    });
    
    // Modal de Edição de Venda
    const editVendaItemSelect = document.getElementById('editVendaItemSelect');
    const editVendaPesoInput = document.getElementById('editVendaPesoInput');
    if (editVendaItemSelect) editVendaItemSelect.addEventListener('change', calcularNovoValorEdicaoVenda);
    if (editVendaPesoInput) editVendaPesoInput.addEventListener('input', calcularNovoValorEdicaoVenda);
    
    if (editVendaConfirmBtn) editVendaConfirmBtn.addEventListener('click', () => {
        const editVendaIdInput = document.getElementById('editVendaIdInput');
        const editVendaModalError = document.getElementById('editVendaModalError');
        if (!editVendaIdInput || !editVendaModalError) return;

        const id = parseInt(editVendaIdInput.value);
        const novoItem = editVendaItemSelect.value;
        const novoPeso = parseFloat(editVendaPesoInput.value);

        if (isNaN(novoPeso) || novoPeso <= 0) {
            editVendaModalError.textContent = "Peso inválido.";
            editVendaModalError.style.display = 'block';
            return;
        }
        editVendaModalError.style.display = 'none';
        salvarEdicaoVenda(id, novoItem, novoPeso);
    });

    if (editVendaCancelBtn) editVendaCancelBtn.addEventListener('click', () => {
        const editVendaModalElem = document.getElementById('editVendaModal');
        if(editVendaModalElem) editVendaModalElem.style.display = 'none';
    });


    // Inicializa a lógica específica da página atual
    initializePageSpecificLogic(currentPage);
});

function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');

    if (!usernameInput || !passwordInput || !loginError) return; 

    const username = usernameInput.value;
    const password = passwordInput.value;
    
    loginError.textContent = ''; 

    if (username === USUARIO_ADM && password === SENHA_ADM) {
        sessionStorage.setItem('loggedIn', 'true');
        window.location.href = 'dashboard.html';
    } else {
        loginError.textContent = 'Usuário ou senha inválidos!';
    }
}

function handleLogout() {
    sessionStorage.removeItem('loggedIn');
    window.location.href = 'index.html';
}

function initializePageSpecificLogic(pageName) {
    // Adiciona a classe 'active' ao link de navegação correto
    document.querySelectorAll('header nav a.nav-button').forEach(link => {
        if (link.getAttribute('href') === pageName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    if (pageName === 'index.html' || pageName === '') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    } else if (pageName === 'agendamentos.html') {
        const formAgendamento = document.getElementById('formAgendamento');
        if (formAgendamento) {
            formAgendamento.addEventListener('submit', registrarAgendamento);
        }
        carregarAgendamentos();
    } else if (pageName === 'vendas.html') {
        const formVendaBalcao = document.getElementById('formVendaBalcao');
        const inputPesoVenda = document.getElementById('pesoVenda');
        const selectItemVenda = document.getElementById('itemVenda');

        if (formVendaBalcao) {
            formVendaBalcao.addEventListener('submit', registrarVendaBalcao);
        }
        if (inputPesoVenda) {
            inputPesoVenda.addEventListener('input', calcularValorTotalVenda);
        }
        if (selectItemVenda) {
            selectItemVenda.addEventListener('change', calcularValorTotalVenda);
        }
        
        // Preencher preços e carregar dados
        const precoKgFrangoDisplay = document.getElementById('precoKgFrangoDisplay');
        const precoKgCostelaDisplay = document.getElementById('precoKgCostelaDisplay');
        if (precoKgFrangoDisplay) precoKgFrangoDisplay.textContent = PRECO_KG_FRANGO.toFixed(2);
        if (precoKgCostelaDisplay) precoKgCostelaDisplay.textContent = PRECO_KG_COSTELA.toFixed(2);
        
        carregarVendasHoje();
        calcularValorTotalVenda(); 
    } else if (pageName === 'relatorios.html') {
        const gerarRelatorioButton = document.getElementById('gerarRelatorioButton');
        const mesRelatorioInput = document.getElementById('mesRelatorio');
        
        if (mesRelatorioInput && !mesRelatorioInput.value) { 
            const hoje = new Date();
            const ano = hoje.getFullYear();
            const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
            mesRelatorioInput.value = `${ano}-${mes}`;
        }

        if (gerarRelatorioButton) {
            gerarRelatorioButton.addEventListener('click', exibirRelatorioMensal);
        }
        exibirRelatorioMensal(); 
    }
    // Nenhuma lógica específica para dashboard.html além do que já está no HTML/CSS
}

// --- FUNÇÕES AUXILIARES DE DADOS (localStorage) ---
function getData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Erro ao ler do localStorage:", e);
        return [];
    }
}

function setData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error("Erro ao salvar no localStorage:", e);
    }
}

// --- MODAL FUNCTIONS ---
function showConfirmationModal(message, confirmCallback, cancelCallback, isDeleteOperation = false) {
    const modal = document.getElementById('confirmationModal');
    const messageText = document.getElementById('modalMessageText');
    const confirmBtn = document.getElementById('modalConfirm');

    if (!modal || !messageText || !confirmBtn) return;

    messageText.textContent = message;
    currentModalConfirmCallback = confirmCallback;
    currentModalCancelCallback = cancelCallback;
    
    if (isDeleteOperation) {
        confirmBtn.classList.add('modal-delete-button');
        confirmBtn.classList.remove('modal-confirm-button');
        confirmBtn.textContent = "Excluir";
    } else {
        confirmBtn.classList.add('modal-confirm-button');
        confirmBtn.classList.remove('modal-delete-button');
        confirmBtn.textContent = "Confirmar";
    }
    modal.style.display = 'flex';
}

function closeConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) modal.style.display = 'none';
    currentModalConfirmCallback = null;
    currentModalCancelCallback = null;
}

function showPromptModal(message, initialValue = '', confirmCallback, cancelCallback) {
    const modal = document.getElementById('promptModal');
    const messageText = document.getElementById('promptModalMessageText');
    const input = document.getElementById('promptModalInput');
    const errorText = document.getElementById('promptModalError');

    if (!modal || !messageText || !input || !errorText) return;

    messageText.textContent = message;
    input.value = initialValue;
    errorText.style.display = 'none';
    
    currentPromptModalConfirmCallback = confirmCallback;
    currentPromptModalCancelCallback = cancelCallback;
    modal.style.display = 'flex';
    input.focus();
}

function closePromptModal() {
    const modal = document.getElementById('promptModal');
    const input = document.getElementById('promptModalInput');
    if (modal) modal.style.display = 'none';
    if (input) input.value = ''; 
    currentPromptModalConfirmCallback = null;
    currentPromptModalCancelCallback = null;
}

// --- LÓGICA DE AGENDAMENTOS ---
function registrarAgendamento(event) {
    event.preventDefault();
    const nomeInput = document.getElementById('clienteNome');
    const itemInput = document.getElementById('itemAgendado');
    const quantidadeInput = document.getElementById('quantidadeAgendada');
    const dataRetiradaInput = document.getElementById('dataRetirada');
    const contatoInput = document.getElementById('contatoCliente');

    const nome = nomeInput.value.trim();
    const item = itemInput.value;
    const quantidade = quantidadeInput.value.trim();
    const dataRetirada = dataRetiradaInput.value;
    const contato = contatoInput.value.trim();

    if (!nome || !item || !quantidade || !dataRetirada) {
        alert("Por favor, preencha todos os campos obrigatórios do agendamento.");
        return;
    }

    const agendamento = {
        id: Date.now(),
        nome, item, quantidade, dataRetirada, contato,
        status: 'pendente' 
    };

    const agendamentos = getData('agendamentos');
    agendamentos.push(agendamento);
    setData('agendamentos', agendamentos);

    alert('Agendamento registrado com sucesso!');
    document.getElementById('formAgendamento').reset();
    carregarAgendamentos();
}

function carregarAgendamentos() {
    const listaAgendamentosDiv = document.getElementById('listaAgendamentos');
    if (!listaAgendamentosDiv) return;

    const agendamentos = getData('agendamentos').filter(ag => ag.status === 'pendente');
    listaAgendamentosDiv.innerHTML = ''; 

    if (agendamentos.length === 0) {
        listaAgendamentosDiv.innerHTML = '<p>Nenhum agendamento pendente.</p>';
        return;
    }

    agendamentos.sort((a, b) => new Date(a.dataRetirada) - new Date(b.dataRetirada)); 
    
    const deleteIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>`;
    const checkIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/></svg>`;

    agendamentos.forEach(ag => {
        const div = document.createElement('div');
        div.className = 'item-card'; 
        div.innerHTML = `
            <p><strong>Cliente:</strong> ${escapeHTML(ag.nome)}</p>
            <p><strong>Item:</strong> ${escapeHTML(ag.item)}</p>
            <p><strong>Qtde Prevista:</strong> ${escapeHTML(ag.quantidade)}</p>
            <p><strong>Retirada:</strong> ${new Date(ag.dataRetirada).toLocaleString('pt-BR')}</p>
            <p><strong>Contato:</strong> ${escapeHTML(ag.contato) || 'Não informado'}</p>
            <button class="action-button button-vendido" onclick="confirmarMarcarAgendamentoComoVendido(${ag.id})">${checkIconSVG} Marcar Vendido</button>
            <button class="action-button button-delete" onclick="confirmarExclusaoAgendamento(${ag.id})">${deleteIconSVG} Excluir</button>
        `;
        listaAgendamentosDiv.appendChild(div);
    });
}

function confirmarMarcarAgendamentoComoVendido(id) {
    const agendamento = getData('agendamentos').find(ag => ag.id === id);
    if (!agendamento) return;
    showPromptModal(
        `Informe o PESO REAL (kg) para ${escapeHTML(agendamento.item)} de ${escapeHTML(agendamento.nome)}:`, '', 
        (pesoReal) => marcarAgendamentoComoVendidoEfetivamente(id, pesoReal)
    );
}

function marcarAgendamentoComoVendidoEfetivamente(id, pesoReal) {
    let agendamentos = getData('agendamentos');
    const agendamentoIndex = agendamentos.findIndex(ag => ag.id === id);
    if (agendamentoIndex === -1) return;

    const agendamento = agendamentos[agendamentoIndex];
    const precoKg = agendamento.item === 'frango' ? PRECO_KG_FRANGO : PRECO_KG_COSTELA;
    const valorVenda = pesoReal * precoKg;

    const venda = {
        id: Date.now(), data: new Date().toISOString(), tipo: 'agendamento_confirmado',
        item: agendamento.item, peso: pesoReal, valor: valorVenda,
        cliente: agendamento.nome, agendamentoId: id
    };
    const vendas = getData('vendas');
    vendas.push(venda);
    setData('vendas', vendas);

    agendamento.status = 'vendido';
    agendamento.pesoReal = pesoReal; 
    agendamento.valorFinal = valorVenda; 
    setData('agendamentos', agendamentos);
    
    alert(`Venda registrada: ${escapeHTML(agendamento.item)} - ${pesoReal.toFixed(2)}kg - R$ ${valorVenda.toFixed(2)}.`);
    carregarAgendamentos(); 
    
    // Atualizar outras visualizações se estiverem ativas (verificando a página atual)
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage === 'vendas.html') carregarVendasHoje();
    if (currentPage === 'relatorios.html') exibirRelatorioMensal();
}

function confirmarExclusaoAgendamento(id) {
    showConfirmationModal(
        "Tem certeza que deseja excluir este agendamento?",
        () => excluirAgendamentoEfetivamente(id), null, true
    );
}

function excluirAgendamentoEfetivamente(id) {
    let agendamentos = getData('agendamentos');
    agendamentos = agendamentos.filter(ag => ag.id !== id);
    setData('agendamentos', agendamentos);
    alert('Agendamento excluído.');
    carregarAgendamentos();
}

// --- LÓGICA DE VENDAS ---
function calcularValorTotalVenda() {
    const spanValorTotal = document.getElementById('valorTotalVendaDisplay');
    const itemSelect = document.getElementById('itemVenda');
    const pesoInput = document.getElementById('pesoVenda');
    if (!spanValorTotal || !itemSelect || !pesoInput) return 0; 

    const item = itemSelect.value;
    const peso = parseFloat(pesoInput.value);
    if (!item || isNaN(peso) || peso <= 0) {
        spanValorTotal.textContent = '0.00';
        return 0;
    }
    const precoKg = item === 'frango' ? PRECO_KG_FRANGO : PRECO_KG_COSTELA;
    const valorTotal = peso * precoKg;
    spanValorTotal.textContent = valorTotal.toFixed(2);
    return valorTotal;
}

function registrarVendaBalcao(event) {
    event.preventDefault();
    const itemSelect = document.getElementById('itemVenda');
    const pesoInput = document.getElementById('pesoVenda');
    const item = itemSelect.value;
    const peso = parseFloat(pesoInput.value);
    const valor = calcularValorTotalVenda(); 

    if (!item || isNaN(peso) || peso <= 0 || valor <= 0) {
        alert("Por favor, preencha os detalhes da venda corretamente.");
        return;
    }
    const venda = {
        id: Date.now(), data: new Date().toISOString(), tipo: 'balcao',
        item, peso, valor
    };
    const vendas = getData('vendas');
    vendas.push(venda);
    setData('vendas', vendas);

    alert(`Venda registrada: ${escapeHTML(item)} - ${peso.toFixed(2)}kg - R$ ${valor.toFixed(2)}`);
    document.getElementById('formVendaBalcao').reset();
    if(document.getElementById('valorTotalVendaDisplay')) document.getElementById('valorTotalVendaDisplay').textContent = '0.00'; 
    carregarVendasHoje();
    if (window.location.pathname.includes('relatorios.html')) exibirRelatorioMensal();
}

function carregarVendasHoje() {
    const listaVendasDiv = document.getElementById('listaVendasHoje');
    if (!listaVendasDiv) return;

    const hojeISO = new Date().toISOString().slice(0, 10); 
    const todasVendas = getData('vendas');
    const vendasDeHoje = todasVendas.filter(venda => venda.data.startsWith(hojeISO));
    listaVendasDiv.innerHTML = '';

    if (vendasDeHoje.length === 0) {
        listaVendasDiv.innerHTML = '<p>Nenhuma venda registrada hoje.</p>';
        return;
    }
    vendasDeHoje.sort((a,b) => new Date(b.data) - new Date(a.data)); 

    const editIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.813z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/></svg>`;
    const deleteIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>`;

    vendasDeHoje.forEach(venda => {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
            <p><strong>Data/Hora:</strong> ${new Date(venda.data).toLocaleString('pt-BR')}</p>
            <p><strong>Item:</strong> ${escapeHTML(venda.item)}</p>
            <p><strong>Peso:</strong> ${venda.peso.toFixed(2)} kg</p>
            <p><strong>Valor:</strong> R$ ${venda.valor.toFixed(2)}</p>
            ${venda.tipo === 'agendamento_confirmado' ? `<p><em>(Agendamento - Cliente: ${escapeHTML(venda.cliente || 'N/A')})</em></p>` : ''}
            <div style="margin-top:10px;">
                <button class="action-button" onclick="abrirModalEdicaoVenda(${venda.id})">${editIconSVG} Editar</button>
                <button class="action-button button-delete" onclick="confirmarExclusaoVenda(${venda.id})">${deleteIconSVG} Excluir</button>
            </div>
        `;
        listaVendasDiv.appendChild(div);
    });
}

// --- LÓGICA DE RELATÓRIOS ---
function exibirRelatorioMensal() {
    const mesRelatorioInput = document.getElementById('mesRelatorio');
    const spanTotalVendasMes = document.getElementById('totalVendasMesDisplay');
    const listaVendasRelatorioDiv = document.getElementById('listaVendasRelatorio');
    if (!mesRelatorioInput || !spanTotalVendasMes || !listaVendasRelatorioDiv) return;
    
    const mesRelatorioValue = mesRelatorioInput.value; 
    if (!mesRelatorioValue) { 
         listaVendasRelatorioDiv.innerHTML = '<p>Selecione um mês e ano para gerar o relatório.</p>';
         spanTotalVendasMes.textContent = '0.00';
         return;
    }
    const [ano, mes] = mesRelatorioValue.split('-');
    const vendas = getData('vendas');
    let totalMes = 0;
    listaVendasRelatorioDiv.innerHTML = '';

    const vendasDoMes = vendas.filter(venda => {
        const dataVenda = new Date(venda.data);
        return dataVenda.getFullYear() === parseInt(ano) && (dataVenda.getMonth() + 1) === parseInt(mes);
    });
    vendasDoMes.sort((a,b) => new Date(a.data) - new Date(b.data)); 

    if (vendasDoMes.length === 0) {
        listaVendasRelatorioDiv.innerHTML = '<p>Nenhuma venda encontrada para este período.</p>';
        spanTotalVendasMes.textContent = '0.00';
        return;
    }
    vendasDoMes.forEach(venda => {
        totalMes += venda.valor;
        const div = document.createElement('div');
        div.className = 'item-card'; 
        div.innerHTML = `
            <p><strong>Data:</strong> ${new Date(venda.data).toLocaleDateString('pt-BR')}</p>
            <p><strong>Item:</strong> ${escapeHTML(venda.item)}</p>
            <p><strong>Peso:</strong> ${venda.peso.toFixed(2)} kg</p>
            <p><strong>Valor:</strong> R$ ${venda.valor.toFixed(2)}</p>
            ${venda.cliente ? `<p><strong>Cliente (Ag.):</strong> ${escapeHTML(venda.cliente)}</p>` : ''}
        `;
        listaVendasRelatorioDiv.appendChild(div);
    });
    spanTotalVendasMes.textContent = totalMes.toFixed(2);
}

// --- FUNÇÃO DE ESCAPE HTML ---
function escapeHTML(str) {
    if (typeof str !== 'string') {
         if (str === null || typeof str === 'undefined') return '';
         try { str = String(str); } catch (e) { return ''; }
    }
    return str.replace(/[&<>"']/g, match => ({'&': '&amp;','<': '&lt;','>': '&gt;','"': '&quot;',"'": '&#39;'})[match]);
}

// --- FUNÇÕES PARA EDITAR/EXCLUIR VENDAS ---
function calcularNovoValorEdicaoVenda() {
    const editVendaItemSelect = document.getElementById('editVendaItemSelect');
    const editVendaPesoInput = document.getElementById('editVendaPesoInput');
    const editVendaNovoValorDisplay = document.getElementById('editVendaNovoValorDisplay');
    if(!editVendaItemSelect || !editVendaPesoInput || !editVendaNovoValorDisplay) return 0;

    const item = editVendaItemSelect.value;
    const peso = parseFloat(editVendaPesoInput.value);
    if (!item || isNaN(peso) || peso <= 0) {
        editVendaNovoValorDisplay.textContent = '0.00';
        return 0;
    }
    const precoKg = item === 'frango' ? PRECO_KG_FRANGO : PRECO_KG_COSTELA;
    const valorTotal = peso * precoKg;
    editVendaNovoValorDisplay.textContent = valorTotal.toFixed(2);
    return valorTotal;
}

function abrirModalEdicaoVenda(id) {
    const vendas = getData('vendas');
    const venda = vendas.find(v => v.id === id);
    if (!venda) {
        alert("Venda não encontrada!");
        return;
    }
    const editVendaModalElem = document.getElementById('editVendaModal');
    const editVendaIdInput = document.getElementById('editVendaIdInput');
    const editVendaItemSelect = document.getElementById('editVendaItemSelect');
    const editVendaPesoInput = document.getElementById('editVendaPesoInput');
    const editVendaModalError = document.getElementById('editVendaModalError');

    if(!editVendaModalElem || !editVendaIdInput || !editVendaItemSelect || !editVendaPesoInput || !editVendaModalError) return;

    editVendaIdInput.value = venda.id;
    editVendaItemSelect.value = venda.item;
    editVendaPesoInput.value = venda.peso.toFixed(2);
    
    calcularNovoValorEdicaoVenda(); 
    editVendaModalError.style.display = 'none'; 
    editVendaModalElem.style.display = 'flex';
    editVendaPesoInput.focus();
}

function salvarEdicaoVenda(id, novoItem, novoPeso) {
    let vendas = getData('vendas');
    const vendaIndex = vendas.findIndex(v => v.id === id);
    const editVendaModalElem = document.getElementById('editVendaModal');

    if (vendaIndex === -1) {
        alert("Erro: Venda não encontrada para edição.");
        if(editVendaModalElem) editVendaModalElem.style.display = 'none';
        return;
    }
    const precoKg = novoItem === 'frango' ? PRECO_KG_FRANGO : PRECO_KG_COSTELA;
    const novoValor = novoPeso * precoKg;

    vendas[vendaIndex].item = novoItem;
    vendas[vendaIndex].peso = novoPeso;
    vendas[vendaIndex].valor = novoValor;
    setData('vendas', vendas);
    alert('Venda atualizada com sucesso!');
    if(editVendaModalElem) editVendaModalElem.style.display = 'none';
    carregarVendasHoje(); 
    if (window.location.pathname.includes('relatorios.html')) exibirRelatorioMensal();
}

function confirmarExclusaoVenda(id) {
    showConfirmationModal(
        "Tem certeza que deseja excluir esta venda?",
        () => excluirVendaEfetivamente(id), null, true
    );
}

function excluirVendaEfetivamente(id) {
    let vendas = getData('vendas');
    const vendaOriginal = vendas.find(v => v.id === id); 
    vendas = vendas.filter(v => v.id !== id);
    setData('vendas', vendas);
    alert('Venda excluída com sucesso!');
    carregarVendasHoje();

    if (vendaOriginal && vendaOriginal.tipo === 'agendamento_confirmado' && vendaOriginal.agendamentoId) {
        let agendamentos = getData('agendamentos');
        const agIndex = agendamentos.findIndex(ag => ag.id === vendaOriginal.agendamentoId);
        if (agIndex !== -1) {
            agendamentos[agIndex].status = 'pendente';
            delete agendamentos[agIndex].pesoReal; 
            delete agendamentos[agIndex].valorFinal;
            setData('agendamentos', agendamentos);
            if (window.location.pathname.includes('agendamentos.html')) carregarAgendamentos();
        }
    }
    if (window.location.pathname.includes('relatorios.html')) exibirRelatorioMensal();
}
