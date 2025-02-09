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
            // Inicializa��o do timer principal que controla o aquecimento
            timer = new System.Timers.Timer();
            timer.Interval = 1000; // Define o intervalo do timer para 1 segundo
            timer.Elapsed += timerChama; // Define o m�todo que ser� chamado a cada intervalo

            // Inicializa��o do timer de limpeza
            limp = new System.Timers.Timer();
            limp.Interval = 1000; // Define o intervalo para 1 segundo
            limp.Elapsed += limpeza; // Define o m�todo que ser� chamado para limpar os campos
            limp.AutoReset = false; // Garante que o timer s� execute uma vez

            // Inicializa��o dos Programas Padr�es
            programasPadroes.Add(new ProgramasPadroes(1, "Pipoca", 3, 7,
                "Observar o barulho de estouros do milho, caso houver um intervalo de mais de 10 segundos entre um estouro e outro, interrompa o aquecimento.", 'p'));
            programasPadroes.Add(new ProgramasPadroes(2, "Leite", 5, 5,
                "Cuidado com aquecimento de l�quidos, o choque t�rmico aliado ao movimento do recipiente pode causar fervura imediata causando risco de queimaduras.", 'l'));
            programasPadroes.Add(new ProgramasPadroes(3, "Carnes de boi", 14, 4,
                "Interrompa o processo na metade e vire o conte�do com a parte de baixo para cima para o descongelamento uniforme.", 'c'));
            programasPadroes.Add(new ProgramasPadroes(4, "Frango", 8, 7,
                "Interrompa o processo na metade e vire o conte�do com a parte de baixo para cima para o descongelamento uniforme.", 'f'));
            programasPadroes.Add(new ProgramasPadroes(6, "Feij�o", 8, 9,
                "Deixe o recipiente destampado e, em casos de pl�stico, cuidado ao retirar o recipiente, pois o mesmo pode perder resist�ncia em altas temperaturas.", 'b'));

            InitializeComponent(); // Inicializa os componentes do formul�rio
        }

        // Vari�veis e propriedades usadas ao longo da aplica��o
        public int tempoS = 0; // Tempo em segundos do aquecimento
        public int potenciaM = 10; // Pot�ncia do aquecimento
        public int contador = 0; // Contador para controlar o progresso do aquecimento
        public bool parado = false; // Flag para indicar se o aquecimento foi pausado
        public char stringAquecimento = '.'; // Caracter usado na string informativa
        public bool init = true; // Flag para verificar se o aquecimento foi iniciado

        // M�todo que valida o tempo de aquecimento
        public bool validaTempo(int tempo)
        {
            if (tempo > 120 || tempo < 1)
            {
                MessageBox.Show("O tempo deve ser menor que 2 minutos e no m�nimo 1 segundo");
                return false;
            }
            return true;
        }

        // M�todo que limpa os campos da interface
        public void limpaCampos()
        {
            if (displayResult.InvokeRequired)
            {
                // Chama o m�todo na thread correta
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


        // M�todo que valida a pot�ncia informada
        public bool validaPotencia(int potencia)
        {
            return potencia >= 0 && potencia <= 10;
        }

        // M�todo que inicia o aquecimento r�pido (30 segundos, pot�ncia 10)
        public void inicioRapido()
        {
            tempoS = 30;
            displayResult.Text = "00:30";
            powerResult.Text = potenciaM.ToString();
            parado = false;
            timer.Start();
        }

        // M�todo que inicia o aquecimento com tempo e pot�ncia definidos
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
                potenciaM = 10; // Valor padr�o caso a pot�ncia seja inv�lida
                MessageBox.Show("A pot�ncia informada � inv�lida. Usando pot�ncia padr�o de 10.");
            }
            powerResult.Text = potenciaM.ToString();
            timer.Start();
            parado = false;
        }

        // M�todo que cria a string informativa de aquecimento
        public void criaStringInformativa()
        {
            if (InvokeRequired)
            {
                Invoke(new Action(criaStringInformativa)); // Garante que a opera��o seja feita na thread da UI
            }
            else
            {
                // Aqui voc� pode apenas manter o progresso visual sem repetir constantemente
                string informativa = $"Aquecendo... Tempo restante: {SegundosParaMinutos(tempoS)}";
                stringInformativa.Text = informativa;

                if (tempoS <= 0)
                {
                    stringInformativa.Text = "Aquecimento conclu�do";
                    limp.Start(); // Inicia o timer de limpeza
                    timer.Stop(); // Para o timer de aquecimento
                }
            }
        }


        // M�todo chamado pelo timer principal a cada segundo
        private void timerChama(object sender, ElapsedEventArgs e)
        {
            if (tempoS > 0)
            {
                tempoS--; // Decrementa o tempo restante

                // Garante que a atualiza��o dos controles seja feita na thread da UI
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
                        stringInformativa.Text = "Aquecimento conclu�do";
                    }));
                }
                else
                {
                    stringInformativa.Text = "Aquecimento conclu�do";
                }
                limp.Start(); // Inicia o timer de limpeza
            }
        }



        // M�todo chamado pelo timer de limpeza
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

        // Evento de clique no bot�o de in�cio r�pido ou aquecimento
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
                        MessageBox.Show("Quando o tempo n�o � definido, o in�cio r�pido � iniciado");
                        inicioRapido(); // Inicia o aquecimento r�pido se o tempo n�o foi definido
                    }
                    else
                    {
                        int tempo = Int32.Parse(displayMain.Text);
                        int pot = string.IsNullOrWhiteSpace(power.Text) ? 10 : Int32.Parse(power.Text);
                        potenciaM = pot;
                        if (string.IsNullOrWhiteSpace(power.Text))
                        {
                            MessageBox.Show("Em caso de pot�ncia n�o informada, ser� inserido em tela o valor 10 como padr�o");
                        }
                        IniciarAquecimento(tempo, pot);
                    }
                }
            }
        }

        // Evento de clique no bot�o de parar ou cancelar
        private void pararCancelar_Click(object sender, EventArgs e)
        {
            if (parado)
            {
                limpaCampos(); // Limpa os campos se o aquecimento j� estiver pausado
                parado = false;
            }
            else
            {
                timer.Stop(); // Pausa o aquecimento
                parado = true;
                init = false;
            }
        }

        // Eventos de clique nos bot�es de 0 a 9 para inserir tempo
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

        // Cria bot�es para os programas padr�es (pr�-definidos)
        private void CriarBotoesProgramas()
        {
            foreach (var programa in programasPadroes)
            {
                Button novoBotao = new Button
                {
                    Text = $"{programa.Nome}\n Pot�ncia: {programa.Potencia}\n Tempo: {programa.Tempo}\n\n{programa.Instrucoes}",
                    Tag = programa,
                    Dock = DockStyle.Left,
                    Size = new Size(120, 80)
                };
                novoBotao.Click += botaoPrograma_Click;

                Padroes.Controls.Add(novoBotao); // Adiciona o bot�o ao painel de padr�es
            }
        }

        // Evento chamado quando o formul�rio � carregado
        private void Form1_Load(object sender, EventArgs e)
        {
            CriarBotoesProgramas(); // Cria bot�es para os programas padr�es
            criaBotoesCustom(); // Cria bot�es personalizados
        }

        // Evento de clique em um bot�o de programa padr�o
        private void botaoPrograma_Click(object sender, EventArgs e)
        {
            limpaCampos(); // Limpa os campos antes de iniciar o programa
            init = false;
            if (sender is Button botao && botao.Tag is ProgramasPadroes programa)
            {
                tempoS = minutosParaSegundos(programa.Tempo); // Converte o tempo para segundos
                potenciaM = programa.Potencia; // Define a pot�ncia
                powerResult.Text = potenciaM.ToString();
                displayResult.Text = SegundosParaMinutos(tempoS);
                stringAquecimento = programa.stringAquecimento; // Define o caractere de aquecimento
                timer.Start(); // Inicia o aquecimento
            }
        }

        // Evento de clique no bot�o de cadastro de novo programa
        private void CadastraNovo_Click(object sender, EventArgs e)
        {
            Form2 abrirForm = new Form2();
            abrirForm.ShowDialog(); // Abre o formul�rio de cadastro de novo programa
        }

        // Cria bot�es personalizados a partir dos programas salvos
        public void criaBotoesCustom()
        {
            Form2 salvos = new Form2();
            List<ProgramasPadroes> novosBotoes = salvos.listarTodos(Form2.caminho); // Lista os programas salvos
            CriarBotoesCustom(novosBotoes); // Cria os bot�es a partir desses programas
        }

        // Cria os bot�es personalizados
        private void CriarBotoesCustom(List<ProgramasPadroes> novosBotoes)
        {
            foreach (var programa in novosBotoes)
            {
                Button novoBotao = new Button
                {
                    Text = $"{programa.Nome}\n Pot�ncia: {programa.Potencia}\n Tempo: {programa.Tempo}\n\n{programa.Instrucoes}",
                    Tag = programa,
                    Dock = DockStyle.Right,
                    Font = new Font(DefaultFont, FontStyle.Italic),
                    Size = new Size(120, 80)
                };
                novoBotao.Click += botaoPrograma_Click;

                panelCustom.Controls.Add(novoBotao); // Adiciona o bot�o ao painel customizado
            }
        }
    }
}
