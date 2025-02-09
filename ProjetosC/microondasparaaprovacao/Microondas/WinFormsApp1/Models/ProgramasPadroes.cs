using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WinFormsApp1.Models
{
    public class ProgramasPadroes
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public int Tempo { get; set; }
        public int Potencia { get; set; }
        public string Instrucoes { get; set; }
        public char stringAquecimento { get; set; } 

        public ProgramasPadroes(int id, string nome, int tempo, int potencia, string instrucoes, char stringAquecimento)
        {
            Id = id;
            Nome = nome;
            Tempo = tempo;
            Potencia = potencia;
            Instrucoes = instrucoes;
            this.stringAquecimento = stringAquecimento;
        }
    }
}
