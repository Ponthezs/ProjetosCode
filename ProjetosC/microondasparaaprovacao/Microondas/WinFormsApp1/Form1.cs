using System.Timers;
using WinFormsApp1.Models;

namespace WinFormsApp1
{
    public partial class Form1 : Form
    {
        private System.Timers.Timer timer, limp;
        public List<ProgramasPadroes> programasPadroes { get; set; } = new List<ProgramasPadroes>();

        // Construtor da classe Form1
        public Form1()
        {
            // Inicialização do timer principal que controla o aquecimento
            timer = new System.Timers.Timer();
            timer.Interval = 1000; // Define o intervalo do timer para 1 segundo
            timer.Elapsed += timerChama; // Define o método que será chamado a cada intervalo

            // Inicialização do timer de limpeza
            limp = new System.Timers.Timer();
            limp.Interval = 1000; // Define o intervalo para 1 segundo
            limp.Elapsed += limpeza; // Define o método que será chamado para limpar os campos
            limp.AutoReset = false; // Garante que o timer só execute uma vez

            // Inicialização dos Programas Padrões
            programasPadroes.Add(new ProgramasPadroes(1, "Pipoca", 3, 7,
                "Observar o barulho de estouros do milho, caso houver um intervalo de mais de 10 segundos entre um estouro e outro, interrompa o aquecimento.", 'p'));
            programasPadroes.Add(new ProgramasPadroes(2, "Leite", 5, 5,
                "Cuidado com aquecimento de líquidos, o choque térmico aliado ao movimento do recipiente pode causar fervura imediata causando risco de queimaduras.", 'l'));
            programasPadroes.Add(new ProgramasPadroes(3, "Carnes de boi", 14, 4,
                "Interrompa o processo na metade e vire o conteúdo com a parte de baixo para cima para o descongelamento uniforme.", 'c'));
            programasPadroes.Add(new ProgramasPadroes(4, "Frango", 8, 7,
                "Interrompa o processo na metade e vire o conteúdo com a parte de baixo para cima para o descongelamento uniforme.", 'f'));
            programasPadroes.Add(new ProgramasPadroes(6, "Feijão", 8, 9,
                "Deixe o recipiente destampado e, em casos de plástico, cuidado ao retirar o recipiente, pois o mesmo pode perder resistência em altas temperaturas.", 'b'));

            InitializeComponent(); // Inicializa os componentes do formulário
        }

        // Variáveis e propriedades usadas ao longo da aplicação
        public int tempoS = 0; // Tempo em segundos do aquecimento
        public int potenciaM = 10; // Potência do aquecimento
        public int contador = 0; // Contador para controlar o progresso do aquecimento
        public bool parado = false; // Flag para indicar se o aquecimento foi pausado
        public char stringAquecimento = '.'; // Caracter usado na string informativa
        public bool init = true; // Flag para verificar se o aquecimento foi iniciado

        // Método que valida o tempo de aquecimento
        public bool validaTempo(int tempo)
        {
            if (tempo > 120 || tempo < 1)
            {
                MessageBox.Show("O tempo deve ser menor que 2 minutos e no mínimo 1 segundo");
                return false;
            }
            return true;
        }

        // Método que limpa os campos da interface
        public void limpaCampos()
        {
            if (displayResult.InvokeRequired)
            {
                // Chama o método na thread correta
                displayResult.Invoke(new Action(limpaCampos));
            }
            else
            {
                displayResult.Text = "";
                displayMain.Text = "";
                power.Text = "";
                powerResult.Text = "";
                stringInformativa.Text = "";
                tempoS = 0;
                potenciaM = 10;
                contador = 0;
                stringAquecimento = '.';
                init = true;
            }
        }


        // Método que valida a potência informada
        public bool validaPotencia(int potencia)
        {
            return potencia >= 0 && potencia <= 10;
        }

        // Método que inicia o aquecimento rápido (30 segundos, potência 10)
        public void inicioRapido()
        {
            tempoS = 30;
            displayResult.Text = "00:30";
            powerResult.Text = potenciaM.ToString();
            parado = false;
            timer.Start();
        }

        // Método que inicia o aquecimento com tempo e potência definidos
        public void IniciarAquecimento(int tempo, int potencia)
        {
            if (!validaTempo(tempo)) return;

            tempoS = tempo;
            displayResult.Text = SegundosParaMinutos(tempoS);
            displayMain.Text = "";

            if (validaPotencia(potencia))
            {
                potenciaM = potencia;
            }
            else
            {
                potenciaM = 10; // Valor padrão caso a potência seja inválida
                MessageBox.Show("A potência informada é inválida. Usando potência padrão de 10.");
            }
            powerResult.Text = potenciaM.ToString();
            timer.Start();
            parado = false;
        }

        // Método que cria a string informativa de aquecimento
        public void criaStringInformativa()
        {
            if (InvokeRequired)
            {
                Invoke(new Action(criaStringInformativa)); // Garante que a operação seja feita na thread da UI
            }
            else
            {
                // Aqui você pode apenas manter o progresso visual sem repetir constantemente
                string informativa = $"Aquecendo... Tempo restante: {SegundosParaMinutos(tempoS)}";
                stringInformativa.Text = informativa;

                if (tempoS <= 0)
                {
                    stringInformativa.Text = "Aquecimento concluído";
                    limp.Start(); // Inicia o timer de limpeza
                    timer.Stop(); // Para o timer de aquecimento
                }
            }
        }


        // Método chamado pelo timer principal a cada segundo
        private void timerChama(object sender, ElapsedEventArgs e)
        {
            if (tempoS > 0)
            {
                tempoS--; // Decrementa o tempo restante

                // Garante que a atualização dos controles seja feita na thread da UI
                if (displayResult.InvokeRequired)
                {
                    displayResult.Invoke(new Action(() =>
                    {
                        displayResult.Text = SegundosParaMinutos(tempoS); // Atualiza o display com o tempo restante
                        criaStringInformativa(); // Atualiza a string informativa
                    }));
                }
                else
                {
                    displayResult.Text = SegundosParaMinutos(tempoS); // Atualiza o display com o tempo restante
                    criaStringInformativa(); // Atualiza a string informativa
                }
            }
            else
            {
                timer.Stop(); // Para o timer quando o tempo acabar

                if (displayResult.InvokeRequired)
                {
                    displayResult.Invoke(new Action(() =>
                    {
                        stringInformativa.Text = "Aquecimento concluído";
                    }));
                }
                else
                {
                    stringInformativa.Text = "Aquecimento concluído";
                }
                limp.Start(); // Inicia o timer de limpeza
            }
        }



        // Método chamado pelo timer de limpeza
        private void limpeza(object sender, ElapsedEventArgs e)
        {
            limpaCampos(); // Limpa os campos da interface
        }

        // Converte minutos para segundos
        public int minutosParaSegundos(int tempo)
        {
            return tempo * 60;
        }

        // Converte segundos para o formato de minutos e segundos (MM:SS)
        public string SegundosParaMinutos(int tempo)
        {
            int minutos = tempo / 60;
            int segundosRestantes = tempo % 60;
            return $"{minutos:D2}:{segundosRestantes:D2}";
        }

        // Evento de clique no botão de início rápido ou aquecimento
        private void InitAquecimento_Click(object sender, EventArgs e)
        {
            if (init)
            {
                stringAquecimento = '.';
                if (parado)
                {
                    timer.Start();
                    parado = false;
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(displayMain.Text))
                    {
                        MessageBox.Show("Quando o tempo não é definido, o início rápido é iniciado");
                        inicioRapido(); // Inicia o aquecimento rápido se o tempo não foi definido
                    }
                    else
                    {
                        int tempo = Int32.Parse(displayMain.Text);
                        int pot = string.IsNullOrWhiteSpace(power.Text) ? 10 : Int32.Parse(power.Text);
                        potenciaM = pot;
                        if (string.IsNullOrWhiteSpace(power.Text))
                        {
                            MessageBox.Show("Em caso de potência não informada, será inserido em tela o valor 10 como padrão");
                        }
                        IniciarAquecimento(tempo, pot);
                    }
                }
            }
        }

        // Evento de clique no botão de parar ou cancelar
        private void pararCancelar_Click(object sender, EventArgs e)
        {
            if (parado)
            {
                limpaCampos(); // Limpa os campos se o aquecimento já estiver pausado
                parado = false;
            }
            else
            {
                timer.Stop(); // Pausa o aquecimento
                parado = true;
                init = false;
            }
        }

        // Eventos de clique nos botões de 0 a 9 para inserir tempo
        private void BotaoZero_Click(object sender, EventArgs e)
        {
            displayMain.Text += "0";
        }

        private void ButtonUm_Click(object sender, EventArgs e)
        {
            displayMain.Text += "1";
        }

        private void ButtonDois_Click(object sender, EventArgs e)
        {
            displayMain.Text += "2";
        }

        private void ButtonTrez_Click(object sender, EventArgs e)
        {
            displayMain.Text += "3";
        }

        private void ButtonQuatro_Click(object sender, EventArgs e)
        {
            displayMain.Text += "4";
        }

        private void ButtonCinco_Click(object sender, EventArgs e)
        {
            displayMain.Text += "5";
        }

        private void ButtonSeis_Click(object sender, EventArgs e)
        {
            displayMain.Text += "6";
        }

        private void ButtonSete_Click(object sender, EventArgs e)
        {
            displayMain.Text += "7";
        }

        private void ButtonOito_Click(object sender, EventArgs e)
        {
            displayMain.Text += "8";
        }

        private void ButtonNove_Click(object sender, EventArgs e)
        {
            displayMain.Text += "9";
        }

        // Cria botões para os programas padrões (pré-definidos)
        private void CriarBotoesProgramas()
        {
            foreach (var programa in programasPadroes)
            {
                Button novoBotao = new Button
                {
                    Text = $"{programa.Nome}\n Potência: {programa.Potencia}\n Tempo: {programa.Tempo}\n\n{programa.Instrucoes}",
                    Tag = programa,
                    Dock = DockStyle.Left,
                    Size = new Size(120, 80)
                };
                novoBotao.Click += botaoPrograma_Click;

                Padroes.Controls.Add(novoBotao); // Adiciona o botão ao painel de padrões
            }
        }

        // Evento chamado quando o formulário é carregado
        private void Form1_Load(object sender, EventArgs e)
        {
            CriarBotoesProgramas(); // Cria botões para os programas padrões
            criaBotoesCustom(); // Cria botões personalizados
        }

        // Evento de clique em um botão de programa padrão
        private void botaoPrograma_Click(object sender, EventArgs e)
        {
            limpaCampos(); // Limpa os campos antes de iniciar o programa
            init = false;
            if (sender is Button botao && botao.Tag is ProgramasPadroes programa)
            {
                tempoS = minutosParaSegundos(programa.Tempo); // Converte o tempo para segundos
                potenciaM = programa.Potencia; // Define a potência
                powerResult.Text = potenciaM.ToString();
                displayResult.Text = SegundosParaMinutos(tempoS);
                stringAquecimento = programa.stringAquecimento; // Define o caractere de aquecimento
                timer.Start(); // Inicia o aquecimento
            }
        }

        // Evento de clique no botão de cadastro de novo programa
        private void CadastraNovo_Click(object sender, EventArgs e)
        {
            Form2 abrirForm = new Form2();
            abrirForm.ShowDialog(); // Abre o formulário de cadastro de novo programa
        }

        // Cria botões personalizados a partir dos programas salvos
        public void criaBotoesCustom()
        {
            Form2 salvos = new Form2();
            List<ProgramasPadroes> novosBotoes = salvos.listarTodos(Form2.caminho); // Lista os programas salvos
            CriarBotoesCustom(novosBotoes); // Cria os botões a partir desses programas
        }

        // Cria os botões personalizados
        private void CriarBotoesCustom(List<ProgramasPadroes> novosBotoes)
        {
            foreach (var programa in novosBotoes)
            {
                Button novoBotao = new Button
                {
                    Text = $"{programa.Nome}\n Potência: {programa.Potencia}\n Tempo: {programa.Tempo}\n\n{programa.Instrucoes}",
                    Tag = programa,
                    Dock = DockStyle.Right,
                    Font = new Font(DefaultFont, FontStyle.Italic),
                    Size = new Size(120, 80)
                };
                novoBotao.Click += botaoPrograma_Click;

                panelCustom.Controls.Add(novoBotao); // Adiciona o botão ao painel customizado
            }
        }
    }
}
