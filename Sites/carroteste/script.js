class Carro {
    constructor(marca, modelo, ano, cor) {
        this.marca = marca;
        this.modelo = modelo;
        this.ano = ano;
        this.cor = cor;
        this.ligado = false;
    }

    ligar() {
        if (this.ligado) {
            return 'O carro já está ligado.';
        } else {
            this.ligado = true;
            return 'O carro está ligado.';
        }
    }

    desligar() {
        if (this.ligado) {
            this.ligado = false;
            return 'O carro está desligado.';
        } else {
            return 'O carro já está desligado.';
        }
    }

    exibirInformacoes() {
        return {
            marca: this.marca,
            modelo: this.modelo,
            ano: this.ano,
            cor: this.cor,
            status: this.ligado ? 'Ligado' : 'Desligado'
        };
    }
}

// Cria uma instância do carro
const meuCarro = new Carro('Toyota', 'Corolla', 2022, 'Preto');

// Atualiza as informações na página
function atualizarInformacoes() {
    const info = meuCarro.exibirInformacoes();
    document.getElementById('marca').textContent = info.marca;
    document.getElementById('modelo').textContent = info.modelo;
    document.getElementById('ano').textContent = info.ano;
    document.getElementById('cor').textContent = info.cor;
    document.getElementById('status').textContent = info.status;
}

// Adiciona os eventos aos botões
document.getElementById('ligar-btn').addEventListener('click', () => {
    alert(meuCarro.ligar());
    atualizarInformacoes();
});

document.getElementById('desligar-btn').addEventListener('click', () => {
    alert(meuCarro.desligar());
    atualizarInformacoes();
});

// Inicializa a página com as informações do carro
atualizarInformacoes();
