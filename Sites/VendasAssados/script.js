// --- CONFIGURAÇÕES GERAIS ---
const PRECO_KG_FRANGO = 28.00; 
const PRECO_KG_COSTELA = 50.00; 
const USUARIO_ADM = "ADM";
const SENHA_ADM = "1234";

// --- SISTEMA DE NOTIFICAÇÕES TOAST ---
function mostrarNotificacao(mensagem, tipo = 'success') {
    const container = document.getElementById('notificacaoContainer');
    if (!container) {
        const div = document.createElement('div');
        div.id = 'notificacaoContainer';
        div.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(div);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: linear-gradient(135deg, ${
            tipo === 'success' ? '#51cf66 0%, #40c057 100%' :
            tipo === 'error' ? '#ff6b6b 0%, #ff5252 100%' :
            tipo === 'warning' ? '#ffa94d 0%, #ff922b 100%' :
            '#4ecdc4 0%, #3db5a9 100%'
        });
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        font-weight: 600;
        font-size: 14px;
        animation: slideInRight 0.3s ease-out;
        pointer-events: auto;
        cursor: default;
        max-width: 400px;
        word-wrap: break-word;
        min-height: 50px;
        display: flex;
        align-items: center;
    `;

    toast.textContent = mensagem;
    document.getElementById('notificacaoContainer').appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- ANIMAÇÕES PARA NOTIFICAÇÃO ---
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(400px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(400px);
        }
    }
`;
document.head.appendChild(style);

// Produtos padrão (usados na inicialização se não houver produtos personalizados)
const PRODUTOS_PADRAO = [
    { id: 1, nome: 'Frango', preco: PRECO_KG_FRANGO, tipo: 'kg' },
    { id: 2, nome: 'Costela', preco: PRECO_KG_COSTELA, tipo: 'kg' }
];

// Variáveis globais para modais (declaradas aqui para escopo global no script)
let currentModalConfirmCallback = null;
let currentModalCancelCallback = null;
let currentPromptModalConfirmCallback = null;
let currentPromptModalCancelCallback = null;

// --- LÓGICA DE AUTENTICAÇÃO E INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar produtos na primeira execução
    inicializarProdutos();
    
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
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const promptModalConfirmBtn = document.getElementById('promptModalConfirm');
    const promptModalCancelBtn = document.getElementById('promptModalCancel');
    const promptCloseBtn = document.getElementById('promptCloseBtn');
    const editVendaConfirmBtn = document.getElementById('editVendaConfirmBtn');
    const editVendaCancelBtn = document.getElementById('editVendaCancelBtn');
    const editVendaCloseBtn = document.getElementById('editVendaCloseBtn');

    if (modalConfirmBtn) modalConfirmBtn.addEventListener('click', () => {
        if (currentModalConfirmCallback) currentModalConfirmCallback();
        closeConfirmationModal();
    });
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', () => {
        if (currentModalCancelCallback) currentModalCancelCallback();
        closeConfirmationModal();
    });
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeConfirmationModal);

    if (promptModalConfirmBtn) promptModalConfirmBtn.addEventListener('click', () => {
        const promptModalInput = document.getElementById('promptModalInput');
        const promptModalError = document.getElementById('promptModalError');
        const value = parseFloat(promptModalInput.value);
        if (isNaN(value) || value <= 0) {
            if(promptModalError) {
                promptModalError.classList.add('show');
                promptModalError.style.display = 'block';
            }
            return;
        }
        if(promptModalError) {
            promptModalError.classList.remove('show');
            promptModalError.style.display = 'none';
        }
        if (currentPromptModalConfirmCallback) currentPromptModalConfirmCallback(value);
        closePromptModal();
    });
    if (promptModalCancelBtn) promptModalCancelBtn.addEventListener('click', () => {
        if (currentPromptModalCancelCallback) currentPromptModalCancelCallback();
        closePromptModal();
    });
    if (promptCloseBtn) promptCloseBtn.addEventListener('click', closePromptModal);
    
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
        const btnAdicionarItem = document.getElementById('btnAdicionarItem');
        
        if (formAgendamento) {
            formAgendamento.addEventListener('submit', registrarAgendamento);
        }
        if (btnAdicionarItem) {
            btnAdicionarItem.addEventListener('click', adicionarItemAgendamento);
        }
        
        // Permitir Enter no input de quantidade para adicionar item
        const novaQuantidade = document.getElementById('novaQuantidade');
        if (novaQuantidade) {
            novaQuantidade.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    adicionarItemAgendamento();
                }
            });
        }
        
        atualizarSelectProdutos();
        atualizarVisualizacaoItensAgendamento();
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
        
        atualizarSelectProdutos();
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
    } else if (pageName === 'configuracoes.html') {
        initializeConfiguracoes();
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

// --- FUNÇÕES DE GERENCIAMENTO DE PRODUTOS ---
function inicializarProdutos() {
    let produtos = getData('produtos');
    if (produtos.length === 0) {
        setData('produtos', PRODUTOS_PADRAO);
        return PRODUTOS_PADRAO;
    }
    return produtos;
}

function obterProdutos() {
    let produtos = getData('produtos');
    if (produtos.length === 0) {
        produtos = inicializarProdutos();
    }
    return produtos;
}

function adicionarProduto(nome, preco, tipo = 'kg') {
    const produtos = obterProdutos();
    const novoId = Math.max(...produtos.map(p => p.id), 0) + 1;
    const novoProduto = {
        id: novoId,
        nome: nome.trim(),
        preco: parseFloat(preco),
        tipo: tipo || 'kg'
    };
    produtos.push(novoProduto);
    setData('produtos', produtos);
    return novoProduto;
}

function atualizarProduto(id, nome, preco, tipo = 'kg') {
    let produtos = obterProdutos();
    const index = produtos.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    produtos[index].nome = nome.trim();
    produtos[index].preco = parseFloat(preco);
    produtos[index].tipo = tipo || 'kg';
    setData('produtos', produtos);
    return true;
}

function removerProduto(id) {
    let produtos = obterProdutos();
    produtos = produtos.filter(p => p.id !== id);
    setData('produtos', produtos);
}

function obterProdutoPorNome(nome) {
    const produtos = obterProdutos();
    return produtos.find(p => p.nome.toLowerCase() === nome.toLowerCase());
}

function obterPrecoKgPorItem(item) {
    const produto = obterProdutoPorNome(item);
    return produto ? produto.preco : 0;
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

// --- VARIÁVEIS PARA CONTROLE DE ITENS EM AGENDAMENTOS ---
let itensAgendamentoTemp = [];

function adicionarItemAgendamento() {
    const itemSelect = document.getElementById('novoItem');
    const quantidadeInput = document.getElementById('novaQuantidade');
    
    const item = itemSelect.value.trim();
    const quantidade = quantidadeInput.value.trim();
    
    if (!item) {
        mostrarNotificacao('Por favor, selecione um item.', 'error');
        return;
    }
    
    if (!quantidade) {
        mostrarNotificacao('Por favor, informe uma quantidade válida.', 'error');
        return;
    }
    
    const produtos = obterProdutos();
    const produto = produtos.find(p => p.nome === item);
    
    if (!produto) {
        mostrarNotificacao('Produto não encontrado.', 'error');
        return;
    }
    
    // Adicionar à lista temporária
    itensAgendamentoTemp.push({
        item: item,
        quantidade: quantidade,
        tipo: produto.tipo
    });
    
    // Limpar inputs
    itemSelect.value = '';
    quantidadeInput.value = '';
    
    // Atualizar visualização
    atualizarVisualizacaoItensAgendamento();
    itemSelect.focus();
}

function removerItemAgendamento(index) {
    itensAgendamentoTemp.splice(index, 1);
    atualizarVisualizacaoItensAgendamento();
}

function atualizarVisualizacaoItensAgendamento() {
    const containerItens = document.getElementById('itensAgendamento');
    if (!containerItens) return;
    
    if (itensAgendamentoTemp.length === 0) {
        containerItens.innerHTML = '<p style="color: #999; font-style: italic;">Nenhum item adicionado ainda...</p>';
        return;
    }
    
    containerItens.innerHTML = itensAgendamentoTemp.map((item, index) => {
        const produtos = obterProdutos();
        const produto = produtos.find(p => p.nome === item.item);
        const emoji = produto ? (produto.tipo === 'kg' ? '⚖️' : '💵') : '📦';
        const label = produto ? (produto.tipo === 'kg' ? 'kg' : 'unidades') : '';
        
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f5f5f5; border-radius: 3px; margin-bottom: 8px;">
                <span><strong>${item.item}</strong> - ${item.quantidade} ${label} ${emoji}</span>
                <button type="button" class="action-button button-delete" onclick="removerItemAgendamento(${index})" style="padding: 5px 10px; font-size: 12px;">
                    ✕ Remover
                </button>
            </div>
        `;
    }).join('');
}

// --- LÓGICA DE AGENDAMENTOS ---
function registrarAgendamento(event) {
    event.preventDefault();
    const nomeInput = document.getElementById('clienteNome');
    const dataRetiradaInput = document.getElementById('dataRetirada');
    const contatoInput = document.getElementById('contatoCliente');

    const nome = nomeInput.value.trim();
    const dataRetirada = dataRetiradaInput.value;
    const contato = contatoInput.value.trim();

    // Validações aprimoradas
    if (!nome || nome.length < 3) {
        mostrarNotificacao("Por favor, informe um nome válido (mínimo 3 caracteres).", 'error');
        nomeInput.focus();
        return;
    }

    if (itensAgendamentoTemp.length === 0) {
        mostrarNotificacao("Por favor, adicione pelo menos um item ao agendamento.", 'error');
        return;
    }

    if (!dataRetirada) {
        mostrarNotificacao("Por favor, selecione uma data/hora de retirada.", 'error');
        dataRetiradaInput.focus();
        return;
    }

    // Validar se a data não é no passado
    const dataSelecionada = new Date(dataRetirada);
    const agora = new Date();
    if (dataSelecionada < agora) {
        mostrarNotificacao("A data de retirada não pode ser no passado.", 'error');
        dataRetiradaInput.focus();
        return;
    }

    const agendamento = {
        id: Date.now(),
        nome,
        itens: JSON.parse(JSON.stringify(itensAgendamentoTemp)), // Cópia profunda
        dataRetirada,
        contato,
        status: 'pendente',
        dataCriacao: new Date().toISOString()
    };

    const agendamentos = getData('agendamentos');
    agendamentos.push(agendamento);
    setData('agendamentos', agendamentos);

    mostrarNotificacao('✓ Agendamento registrado com sucesso!', 'success');
    document.getElementById('formAgendamento').reset();
    itensAgendamentoTemp = [];
    atualizarVisualizacaoItensAgendamento();
    carregarAgendamentos();
}

function carregarAgendamentos() {
    const listaAgendamentosDiv = document.getElementById('listaAgendamentos');
    const countAgendamentos = document.getElementById('countAgendamentos');
    if (!listaAgendamentosDiv) return;

    const agendamentos = getData('agendamentos').filter(ag => ag.status === 'pendente');
    listaAgendamentosDiv.innerHTML = '';

    // Atualizar badge de contagem
    if (countAgendamentos) {
        countAgendamentos.textContent = agendamentos.length;
    }

    if (agendamentos.length === 0) {
        listaAgendamentosDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 40px 0;">📭 Nenhum agendamento pendente.</p>';
        return;
    }

    agendamentos.sort((a, b) => new Date(a.dataRetirada) - new Date(b.dataRetirada)); 
    
    const deleteIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>`;
    const checkIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/></svg>`;

    agendamentos.forEach(ag => {
        const div = document.createElement('div');
        div.className = 'item-card';
        
        const dataFormatada = new Date(ag.dataRetirada).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Compatibilidade com agendamentos antigos (um único item)
        let itensHtml = '';
        if (ag.itens && Array.isArray(ag.itens)) {
            // Novo formato: múltiplos itens
            itensHtml = ag.itens.map(item => {
                const emoji = item.tipo === 'kg' ? '⚖️' : '💵';
                const label = item.tipo === 'kg' ? 'kg' : 'unidades';
                return `<li>• ${escapeHTML(item.item)}: ${escapeHTML(item.quantidade)} ${label} ${emoji}</li>`;
            }).join('');
        } else if (ag.item) {
            // Formato antigo: um único item (compatibilidade)
            const itemEmoji = ag.item === 'frango' ? '🍗' : '🍖';
            itensHtml = `<li>${itemEmoji} ${escapeHTML(ag.item)}: ${escapeHTML(ag.quantidade)}</li>`;
        }
        
        div.innerHTML = `
            <p><strong>👤 Cliente:</strong> <span>${escapeHTML(ag.nome)}</span></p>
            <p><strong>📦 Itens:</strong></p>
            <ul style="margin: 5px 0 10px 20px; padding: 0;">${itensHtml}</ul>
            <p><strong>📅 Retirada:</strong> <span>${dataFormatada}</span></p>
            <p><strong>📞 Contato:</strong> <span>${escapeHTML(ag.contato) || '✗ Não informado'}</span></p>
            <button class="action-button button-vendido" onclick="confirmarMarcarAgendamentoComoVendido(${ag.id})" title="Confirmar venda deste agendamento">${checkIconSVG} Confirmar Venda</button>
            <button class="action-button button-delete" onclick="confirmarExclusaoAgendamento(${ag.id})" title="Excluir este agendamento">${deleteIconSVG} Excluir</button>
        `;
        listaAgendamentosDiv.appendChild(div);
    });
}

function confirmarMarcarAgendamentoComoVendido(id) {
    const agendamento = getData('agendamentos').find(ag => ag.id === id);
    if (!agendamento) return;
    
    // Compatibilidade: se é formato antigo, converter para novo
    let itens = agendamento.itens && Array.isArray(agendamento.itens) ? agendamento.itens : 
                (agendamento.item ? [{ item: agendamento.item, quantidade: agendamento.quantidade, tipo: 'kg' }] : []);
    
    if (itens.length === 0) {
        mostrarNotificacao('Nenhum item encontrado neste agendamento.', 'error');
        return;
    }
    
    // Abrir modal para confirmar itens e suas quantidades
    abrirModalConfirmacaoVenda(id, itens);
}

function abrirModalConfirmacaoVenda(agendamentoId, itens) {
    const produtos = obterProdutos();
    
    // Criar HTML para cada item
    let itensHtml = itens.map((item, index) => {
        const produto = produtos.find(p => p.nome === item.item);
        const tipo = produto ? produto.tipo : 'kg';
        const label = tipo === 'kg' ? 'kg' : 'unidades';
        const emoji = tipo === 'kg' ? '⚖️' : '💵';
        
        return `
            <div style="padding: 10px; background: #f5f5f5; border-radius: 5px; margin-bottom: 10px;">
                <label style="display: block; margin-bottom: 5px;"><strong>${item.item}</strong> (${label}) ${emoji}</label>
                <input type="number" id="confirmaQtd_${index}" step="0.01" min="0.01" 
                       value="${item.quantidade}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 3px;">
            </div>
        `;
    }).join('');
    
    const modal = document.getElementById('confirmationModal');
    const modalMessage = document.getElementById('modalMessageText');
    
    modalMessage.innerHTML = `<strong>Confirme as quantidades de venda:</strong><br>${itensHtml}`;
    
    // Limpar listeners anteriores
    const confirmBtn = document.getElementById('modalConfirm');
    const cancelBtn = document.getElementById('modalCancel');
    
    confirmBtn.onclick = () => {
        // Coletar valores dos inputs
        const quantidades = {};
        itens.forEach((item, index) => {
            const valor = parseFloat(document.getElementById(`confirmaQtd_${index}`).value);
            if (isNaN(valor) || valor <= 0) {
                mostrarNotificacao(`Quantidade inválida para ${item.item}`, 'error');
                return;
            }
            quantidades[item.item] = valor;
        });
        
        // Fechar modal e processar venda
        modal.style.display = 'none';
        marcarAgendamentoComoVendidoEfetivamente(agendamentoId, itens, quantidades);
    };
    
    cancelBtn.onclick = () => {
        modal.style.display = 'none';
    };
    
    modal.style.display = 'flex';
}

function marcarAgendamentoComoVendidoEfetivamente(id, itens, quantidades) {
    let agendamentos = getData('agendamentos');
    const agendamentoIndex = agendamentos.findIndex(ag => ag.id === id);
    if (agendamentoIndex === -1) return;

    const agendamento = agendamentos[agendamentoIndex];
    const produtos = obterProdutos();
    let valorVendaTotal = 0;
    const vendas = getData('vendas');
    let descricaoVenda = [];
    
    // Processar cada item
    itens.forEach(item => {
        const produto = produtos.find(p => p.nome === item.item);
        const tipo = produto ? produto.tipo : 'kg';
        const preco = obterPrecoKgPorItem(item.item);
        const quantidade = quantidades[item.item] || item.quantidade;
        
        const valorItem = quantidade * preco;
        valorVendaTotal += valorItem;
        
        const label = tipo === 'kg' ? 'kg' : 'unidades';
        descricaoVenda.push(`${item.item}: ${parseFloat(quantidade).toFixed(2)} ${label}`);
        
        // Registrar venda individual de cada item
        const venda = {
            id: Date.now() + Math.random(), 
            data: new Date().toISOString(), 
            tipo: 'agendamento_confirmado',
            item: item.item, 
            peso: tipo === 'kg' ? quantidade : null,
            quantidade: tipo === 'kg' ? null : quantidade,
            quantidadeTipo: tipo === 'kg' ? 'kg' : tipo,
            valor: valorItem,
            cliente: agendamento.nome, 
            agendamentoId: id
        };
        vendas.push(venda);
    });
    
    setData('vendas', vendas);

    agendamento.status = 'vendido';
    agendamento.quantidadesFinais = quantidades;
    agendamento.valorFinal = valorVendaTotal; 
    setData('agendamentos', agendamentos);
    
    mostrarNotificacao(`✓ Venda registrada! Total: R$ ${valorVendaTotal.toFixed(2)}`, 'success');
    carregarAgendamentos(); 
    carregarVendasHoje();
    
    // Atualizar outras visualizações se estiverem ativas
    const currentPage = window.location.pathname.split("/").pop();
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
    mostrarNotificacao('✓ Agendamento excluído com sucesso!', 'success');
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
        mostrarNotificacao("Por favor, preencha os detalhes da venda corretamente.", 'error');
        return;
    }
    const venda = {
        id: Date.now(), data: new Date().toISOString(), tipo: 'balcao',
        item, peso, valor
    };
    const vendas = getData('vendas');
    vendas.push(venda);
    setData('vendas', vendas);

    mostrarNotificacao(`✓ Venda registrada! ${escapeHTML(item)} - ${peso.toFixed(2)}kg - R$ ${valor.toFixed(2)}`, 'success');
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
        const quantidadeText = venda.peso ? `${venda.peso.toFixed(2)} kg` : `${venda.quantidade.toFixed(2)} ${venda.quantidadeTipo || 'un'}`;
        div.innerHTML = `
            <p><strong>Data/Hora:</strong> ${new Date(venda.data).toLocaleString('pt-BR')}</p>
            <p><strong>Item:</strong> ${escapeHTML(venda.item)}</p>
            <p><strong>Quantidade:</strong> ${quantidadeText}</p>
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
        const quantidadeText = venda.peso ? `${venda.peso.toFixed(2)} kg` : `${venda.quantidade.toFixed(2)} ${venda.quantidadeTipo || 'un'}`;
        div.innerHTML = `
            <p><strong>Data:</strong> ${new Date(venda.data).toLocaleDateString('pt-BR')}</p>
            <p><strong>Item:</strong> ${escapeHTML(venda.item)}</p>
            <p><strong>Quantidade:</strong> ${quantidadeText}</p>
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
        mostrarNotificacao("Venda não encontrada!", 'error');
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
    editVendaPesoInput.value = venda.peso ? venda.peso.toFixed(2) : (venda.quantidade ? venda.quantidade.toFixed(2) : '0');
    editVendaPesoInput.placeholder = venda.peso ? 'kg' : (venda.quantidadeTipo || 'unidades');
    
    calcularNovoValorEdicaoVenda(); 
    editVendaModalError.style.display = 'none'; 
    editVendaModalElem.style.display = 'flex';
    editVendaPesoInput.focus();
}

function salvarEdicaoVenda(id, novoItem, novoPeso) {
    let vendas = getData('vendas');
    const vendaIndex = vendas.findIndex(v => v.id === id);
    const editVendaModalElem = document.getElementById('editVendaModal');
    const venda = vendas[vendaIndex];

    if (vendaIndex === -1) {
        mostrarNotificacao('Erro: Venda não encontrada para edição.', 'error');
        if(editVendaModalElem) editVendaModalElem.style.display = 'none';
        return;
    }
    
    let novoValor;
    if (venda.tipo === 'agendamento_confirmado') {
        // Para agendamentos, precisa buscar o preço do produto
        const produto = obterProdutoPorNome(novoItem);
        if (produto) {
            novoValor = novoPeso * produto.preco;
        } else {
            novoValor = venda.valor; // Manter valor anterior se não encontrar
        }
        vendas[vendaIndex].quantidade = novoPeso;
    } else {
        // Para vendas de balcão, usa preço por kg
        const precoKg = novoItem === 'frango' ? PRECO_KG_FRANGO : PRECO_KG_COSTELA;
        novoValor = novoPeso * precoKg;
        vendas[vendaIndex].peso = novoPeso;
    }

    vendas[vendaIndex].item = novoItem;
    vendas[vendaIndex].valor = novoValor;
    setData('vendas', vendas);
    mostrarNotificacao('✓ Venda atualizada com sucesso!', 'success');
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
    mostrarNotificacao('✓ Venda excluída com sucesso!', 'success');
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

// --- LÓGICA DE CONFIGURAÇÕES ---
function initializeConfiguracoes() {
    // Formulário de novo produto
    const formNovoProduto = document.getElementById('formNovoProduto');
    if (formNovoProduto) formNovoProduto.addEventListener('submit', registrarNovoProduto);

    // Event listener para atualizar label do novo produto
    const novoProdutoTipo = document.getElementById('novoProdutoTipo');
    if (novoProdutoTipo) novoProdutoTipo.addEventListener('change', atualizarLabelNovoProduto);

    // Botões de ação
    const exportDadosBtn = document.getElementById('exportDadosBtn');
    const limparDadosBtn = document.getElementById('limparDadosBtn');
    const importDadosBtn = document.getElementById('importDadosBtn');

    if (exportDadosBtn) exportDadosBtn.addEventListener('click', exportarDados);
    if (limparDadosBtn) limparDadosBtn.addEventListener('click', () => {
        showConfirmationModal("⚠️ ATENÇÃO: Isso vai APAGAR TODOS os dados do sistema. Tem certeza?", limparTodosDados, null, true);
    });
    if (importDadosBtn) importDadosBtn.addEventListener('click', importarDados);

    // Modal de edição de produto
    const editProdutoConfirmBtn = document.getElementById('editProdutoConfirmBtn');
    const editProdutoCancelBtn = document.getElementById('editProdutoCancelBtn');
    const editProdutoCloseBtn = document.getElementById('editProdutoCloseBtn');
    const editProdutoTipo = document.getElementById('editProdutoTipoInput');

    if (editProdutoConfirmBtn) editProdutoConfirmBtn.addEventListener('click', salvarEdicaoProduto);
    if (editProdutoCancelBtn) editProdutoCancelBtn.addEventListener('click', () => {
        const modal = document.getElementById('editProdutoModal');
        if (modal) modal.style.display = 'none';
    });
    if (editProdutoCloseBtn) editProdutoCloseBtn.addEventListener('click', () => {
        const modal = document.getElementById('editProdutoModal');
        if (modal) modal.style.display = 'none';
    });
    if (editProdutoTipo) editProdutoTipo.addEventListener('change', atualizarLabelEdicaoProduto);

    carregarListaProdutos();
    carregarEdicaoPrecosRapida();
    atualizarInformacoesSistema();
}

function registrarNovoProduto(event) {
    event.preventDefault();
    const nomeInput = document.getElementById('novoProdutoNome');
    const tipoInput = document.getElementById('novoProdutoTipo');
    const precoInput = document.getElementById('novoProdutoPreco');

    const nome = nomeInput.value.trim();
    const tipo = tipoInput.value;
    const preco = parseFloat(precoInput.value);

    // Validações
    if (!nome || nome.length < 2) {
        mostrarNotificacao('Por favor, informe um nome válido (mínimo 2 caracteres).', 'error');
        nomeInput.focus();
        return;
    }

    if (!tipo) {
        mostrarNotificacao('Por favor, selecione o tipo de produto.', 'error');
        tipoInput.focus();
        return;
    }

    if (isNaN(preco) || preco <= 0) {
        mostrarNotificacao('Por favor, informe um preço válido.', 'error');
        precoInput.focus();
        return;
    }

    // Verificar se produto já existe
    const produtoExistente = obterProdutoPorNome(nome);
    if (produtoExistente) {
        mostrarNotificacao(`⚠️ Produto "${nome}" já existe.`, 'warning');
        nomeInput.focus();
        return;
    }

    adicionarProduto(nome, preco, tipo);
    mostrarNotificacao(`✓ Produto "${nome}" adicionado!`, 'success');
    document.getElementById('formNovoProduto').reset();
    carregarListaProdutos();
    carregarEdicaoPrecosRapida();
    atualizarInformacoesSistema();
}

function carregarListaProdutos() {
    const listaProdutosDiv = document.getElementById('listaProdutos');
    if (!listaProdutosDiv) return;

    const produtos = obterProdutos();
    listaProdutosDiv.innerHTML = '';

    if (produtos.length === 0) {
        listaProdutosDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">📭 Nenhum produto cadastrado.</p>';
        return;
    }

    const deleteIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/></svg>`;
    const editIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.813z"/></svg>`;

    produtos.forEach(produto => {
        const div = document.createElement('div');
        div.className = 'product-card';
        const tipoLabel = produto.tipo === 'kg' ? '(por kg)' : '(valor fixo)';
        const tipoEmoji = produto.tipo === 'kg' ? '⚖️' : '💵';
        div.innerHTML = `
            <div class="product-card-header">
                <div class="product-card-name">📦 ${escapeHTML(produto.nome)}</div>
                <div class="product-card-price">R$ ${produto.preco.toFixed(2)} <span style="font-size: 0.85em; color: #666;">${tipoEmoji} ${tipoLabel}</span></div>
            </div>
            <div class="product-card-actions">
                <button class="action-button" onclick="abrirModalEdicaoProduto(${produto.id})" style="background-color: #0779e4;">${editIconSVG} Editar</button>
                <button class="action-button button-delete" onclick="confirmarExclusaoProduto(${produto.id})">${deleteIconSVG} Remover</button>
            </div>
        `;
        listaProdutosDiv.appendChild(div);
    });
}

function carregarEdicaoPrecosRapida() {
    const edicaoPrecosDiv = document.getElementById('edicaoPrecosRapida');
    if (!edicaoPrecosDiv) return;

    const produtos = obterProdutos();
    edicaoPrecosDiv.innerHTML = '';

    if (produtos.length === 0) {
        edicaoPrecosDiv.innerHTML = '<p style="text-align: center; color: #999;">Nenhum produto cadastrado.</p>';
        return;
    }

    produtos.forEach(produto => {
        const div = document.createElement('div');
        div.className = 'price-card';
        const tipoLabel = produto.tipo === 'kg' ? '/kg' : '/un';
        div.innerHTML = `
            <label>📦 ${escapeHTML(produto.nome)} <span style="font-size: 0.85em; color: #999;">(${produto.tipo === 'kg' ? '⚖️ kg' : '💵 fixo'})</span></label>
            <input type="number" id="precoRapido_${produto.id}" value="${produto.preco.toFixed(2)}" step="0.01" min="0.01" onchange="atualizarPrecoRapido(${produto.id}, this.value)">
        `;
        edicaoPrecosDiv.appendChild(div);
    });
}

function atualizarPrecoRapido(id, novoPreco) {
    const preco = parseFloat(novoPreco);
    if (isNaN(preco) || preco <= 0) {
        mostrarNotificacao('Preço inválido.', 'error');
        return;
    }
    const produtos = obterProdutos();
    const index = produtos.findIndex(p => p.id === id);
    if (index === -1) return;
    produtos[index].preco = preco;
    setData('produtos', produtos);
    mostrarNotificacao(`✓ Preço atualizado para R$ ${preco.toFixed(2)}/kg`, 'success');
}

function abrirModalEdicaoProduto(id) {
    const produtos = obterProdutos();
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;

    const modal = document.getElementById('editProdutoModal');
    const idInput = document.getElementById('editProdutoIdInput');
    const nomeInput = document.getElementById('editProdutoNomeInput');
    const tipoInput = document.getElementById('editProdutoTipoInput');
    const precoInput = document.getElementById('editProdutoPrecoInput');
    const errorMsg = document.getElementById('editProdutoModalError');

    if (!modal || !idInput || !nomeInput || !tipoInput || !precoInput) return;

    idInput.value = produto.id;
    nomeInput.value = produto.nome;
    tipoInput.value = produto.tipo || 'kg';
    precoInput.value = produto.preco.toFixed(2);
    if (errorMsg) errorMsg.style.display = 'none';

    atualizarLabelEdicaoProduto();
    modal.style.display = 'flex';
    nomeInput.focus();
}

function atualizarLabelEdicaoProduto() {
    const tipoInput = document.getElementById('editProdutoTipoInput');
    const labelInfo = document.getElementById('editProdutoPrecoInfo');
    if (!tipoInput || !labelInfo) return;
    
    if (tipoInput.value === 'kg') {
        labelInfo.textContent = 'R$ por kg';
    } else {
        labelInfo.textContent = 'R$ por unidade';
    }
}

function atualizarLabelNovoProduto() {
    const tipoInput = document.getElementById('novoProdutoTipo');
    const labelInfo = document.getElementById('novoProdutoPrecoInfo');
    if (!tipoInput || !labelInfo) return;
    
    if (tipoInput.value === 'kg') {
        labelInfo.textContent = 'R$ por kg';
    } else {
        labelInfo.textContent = 'R$ por unidade';
    }
}

function salvarEdicaoProduto() {
    const idInput = document.getElementById('editProdutoIdInput');
    const nomeInput = document.getElementById('editProdutoNomeInput');
    const tipoInput = document.getElementById('editProdutoTipoInput');
    const precoInput = document.getElementById('editProdutoPrecoInput');
    const errorMsg = document.getElementById('editProdutoModalError');

    const id = parseInt(idInput.value);
    const nome = nomeInput.value.trim();
    const tipo = tipoInput.value;
    const preco = parseFloat(precoInput.value);

    if (!nome || nome.length < 2) {
        if (errorMsg) {
            errorMsg.textContent = 'Nome inválido.';
            errorMsg.style.display = 'block';
        }
        return;
    }

    if (!tipo) {
        if (errorMsg) {
            errorMsg.textContent = 'Selecione um tipo.';
            errorMsg.style.display = 'block';
        }
        return;
    }

    if (isNaN(preco) || preco <= 0) {
        if (errorMsg) {
            errorMsg.textContent = 'Preço inválido.';
            errorMsg.style.display = 'block';
        }
        return;
    }

    const produtos = obterProdutos();
    if (produtos.find(p => p.id !== id && p.nome.toLowerCase() === nome.toLowerCase())) {
        if (errorMsg) errorMsg.textContent = `Produto com esse nome já existe.`;
        if (errorMsg) errorMsg.style.display = 'block';
        return;
    }

    atualizarProduto(id, nome, preco, tipo);
    const modal = document.getElementById('editProdutoModal');
    if (modal) modal.style.display = 'none';
    mostrarNotificacao(`✓ Produto atualizado!`, 'success');
    carregarListaProdutos();
    carregarEdicaoPrecosRapida();
    atualizarSelectProdutos();
    atualizarInformacoesSistema();
}

function confirmarExclusaoProduto(id) {
    const produtos = obterProdutos();
    const produto = produtos.find(p => p.id === id);
    if (!produto) return;
    showConfirmationModal(`Tem certeza que deseja remover "${escapeHTML(produto.nome)}"?`, () => excluirProdutoEfetivamente(id), null, true);
}

function excluirProdutoEfetivamente(id) {
    removerProduto(id);
    mostrarNotificacao('✓ Produto removido!', 'success');
    carregarListaProdutos();
    carregarEdicaoPrecosRapida();
    atualizarInformacoesSistema();
}

function atualizarInformacoesSistema() {
    const countProdutos = document.getElementById('countProdutos');
    const countAgendamentos = document.getElementById('countAgendamentos');
    const countVendas = document.getElementById('countVendas');
    const storageUsed = document.getElementById('storageUsed');

    if (countProdutos) countProdutos.textContent = obterProdutos().length;
    if (countAgendamentos) countAgendamentos.textContent = getData('agendamentos').length;
    if (countVendas) countVendas.textContent = getData('vendas').length;

    if (storageUsed) {
        const totalStorage = Object.keys(localStorage).reduce((total, key) => total + localStorage[key].length, 0);
        storageUsed.textContent = ((totalStorage / 1024).toFixed(2)) + ' KB';
    }
}

function exportarDados() {
    const dados = {
        produtos: obterProdutos(),
        agendamentos: getData('agendamentos'),
        vendas: getData('vendas'),
        dataExportacao: new Date().toISOString()
    };

    const dataStr = JSON.stringify(dados, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `vendas-assados-backup-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    mostrarNotificacao('✓ Dados exportados com sucesso!', 'success');
}

function importarDados() {
    const fileInput = document.getElementById('importFile');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        mostrarNotificacao('Selecione um arquivo para importar.', 'error');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
        try {
            const dados = JSON.parse(e.target.result);
            if (!dados.produtos || !Array.isArray(dados.produtos)) {
                mostrarNotificacao('Arquivo inválido.', 'error');
                return;
            }
            setData('produtos', dados.produtos);
            if (dados.agendamentos) setData('agendamentos', dados.agendamentos);
            if (dados.vendas) setData('vendas', dados.vendas);

            mostrarNotificacao('✓ Dados importados com sucesso!', 'success');
            fileInput.value = '';
            carregarListaProdutos();
            carregarEdicaoPrecosRapida();
            atualizarInformacoesSistema();
        } catch (erro) {
            mostrarNotificacao('Erro ao importar: ' + erro.message, 'error');
        }
    };
    reader.readAsText(file);
}

function limparTodosDados() {
    localStorage.clear();
    inicializarProdutos();
    mostrarNotificacao('✓ Dados limpos. Produtos padrão restaurados.', 'success');
    location.reload();
}

// --- FUNÇÃO PARA POPULAR SELECTS DINAMICAMENTE ---
function atualizarSelectProdutos() {
    const produtos = obterProdutos();
    
    // Atualizar select em agendamentos - novo formato (múltiplos itens)
    const selectNovoItem = document.getElementById('novoItem');
    if (selectNovoItem) {
        const valorAtual = selectNovoItem.value;
        selectNovoItem.innerHTML = '<option value="">-- Selecione um item --</option>';
        produtos.forEach(prod => {
            const emoji = prod.tipo === 'kg' ? '⚖️' : '💵';
            const label = prod.tipo === 'kg' ? '/kg' : '/un';
            const option = document.createElement('option');
            option.value = prod.nome;
            option.textContent = `${prod.nome} ${emoji} (R$ ${prod.preco.toFixed(2)}${label})`;
            selectNovoItem.appendChild(option);
        });
        if (valorAtual) selectNovoItem.value = valorAtual;
    }

    // Atualizar select em vendas
    const selectVendas = document.getElementById('itemVenda');
    if (selectVendas) {
        const valorAtual = selectVendas.value;
        selectVendas.innerHTML = '';
        produtos.forEach(prod => {
            const option = document.createElement('option');
            option.value = prod.nome.toLowerCase();
            option.textContent = `${prod.nome} (R$ ${prod.preco.toFixed(2)}/kg)`;
            selectVendas.appendChild(option);
        });
        if (valorAtual) selectVendas.value = valorAtual;
    }

    // Atualizar select em modal de edição
    const selectEdicao = document.getElementById('editVendaItemSelect');
    if (selectEdicao) {
        const valorAtual = selectEdicao.value;
        selectEdicao.innerHTML = '';
        produtos.forEach(prod => {
            const option = document.createElement('option');
            option.value = prod.nome.toLowerCase();
            option.textContent = prod.nome;
            selectEdicao.appendChild(option);
        });
        if (valorAtual) selectEdicao.value = valorAtual;
    }
}
