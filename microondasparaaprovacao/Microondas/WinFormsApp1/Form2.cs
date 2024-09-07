using Microsoft.VisualBasic.ApplicationServices;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;

using WinFormsApp1.Models;

namespace WinFormsApp1
{
    public partial class Form2 : Form
    {
        public Form2()
        {
            InitializeComponent();
        }

        public static string caminho = "C:\\Users\\PC\\Desktop\\Nova pasta (2)\\Microondas\\Microondas\\WinFormsApp1\\ProgramasSalvos.json";

        private void btn_save_Click(object sender, EventArgs e)
        {
            if(validaCampos())
            {
                int id = 0;
                int tempo = Int32.Parse(tempoInput.Text);
                string alimento = AlimentoInput.Text;
                int potencia = Int32.Parse(PotenciaInput.Text);
                char strAquecimento = StringAquecimentoInput.Text.ToCharArray()[0];
                string instrucoes = InstrucoesInput.Text.Length == 0 ? "" : InstrucoesInput.Text;

                SalvarDadosJson(new ProgramasPadroes(id, alimento, tempo, potencia, instrucoes, strAquecimento), caminho);
                MessageBox.Show("programa salvo com sucesso!");

                this.Close();
            }

        }

        public bool validaCampos()
        {
            if( tempoInput.Text.Length == 0 ||
                AlimentoInput.Text.Length == 0 ||
                PotenciaInput.Text.Length == 0 ||
                StringAquecimentoInput.Text.Length == 0)
            {
                MessageBox.Show("Insira todos os campos");
                return false;
            }else
            {
                return true; ;
            }
        }

        public void SalvarDadosJson(ProgramasPadroes dados, string caminhoArquivo)
        {
            List<ProgramasPadroes> ProgramasJaCriados = listarTodos(caminhoArquivo);

            ProgramasJaCriados.Add(dados);

            using (StreamWriter streamWriter = new StreamWriter(caminhoArquivo))
            {
                foreach (var objeto in ProgramasJaCriados)
                {
                    string jsonString = JsonSerializer.Serialize(objeto);
                    streamWriter.WriteLine(jsonString);
                }
            }
        }

        public List<ProgramasPadroes> listarTodos(string caminhoArquivo)
        {
            List<ProgramasPadroes> programasCustom = new List<ProgramasPadroes>();

            if (File.Exists(caminhoArquivo))
            {
                using (StreamReader streamReader = new StreamReader(caminhoArquivo))
                {
                    string linha;
                    while ((linha = streamReader.ReadLine()) != null)
                    {
                        programasCustom.Add(JsonSerializer.Deserialize<ProgramasPadroes>(linha));
                    }
                }
            }
            return programasCustom;
        }
    }
}