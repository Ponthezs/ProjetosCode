namespace WinFormsApp1
{
    partial class Form2
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            label1 = new Label();
            AlimentoInput = new TextBox();
            Alimento = new Label();
            PotenciaInput = new TextBox();
            potencia = new Label();
            StringAquecimentoInput = new TextBox();
            AquecimentoString = new Label();
            InstrucoesInput = new TextBox();
            instrucoes = new Label();
            btn_save = new Button();
            tempoInput = new TextBox();
            Tempolabel = new Label();
            SuspendLayout();
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Location = new Point(137, 22);
            label1.Name = "label1";
            label1.Size = new Size(159, 15);
            label1.TabIndex = 0;
            label1.Text = "Cadastre um novo programa";
            // 
            // AlimentoInput
            // 
            AlimentoInput.Location = new Point(107, 83);
            AlimentoInput.Name = "AlimentoInput";
            AlimentoInput.Size = new Size(218, 23);
            AlimentoInput.TabIndex = 4;
            // 
            // Alimento
            // 
            Alimento.AutoSize = true;
            Alimento.Location = new Point(106, 65);
            Alimento.Name = "Alimento";
            Alimento.Size = new Size(56, 15);
            Alimento.TabIndex = 3;
            Alimento.Text = "Alimento";
            // 
            // PotenciaInput
            // 
            PotenciaInput.Location = new Point(106, 173);
            PotenciaInput.Name = "PotenciaInput";
            PotenciaInput.Size = new Size(218, 23);
            PotenciaInput.TabIndex = 6;
            // 
            // potencia
            // 
            potencia.AutoSize = true;
            potencia.Location = new Point(106, 155);
            potencia.Name = "potencia";
            potencia.Size = new Size(53, 15);
            potencia.TabIndex = 5;
            potencia.Text = "Potência";
            // 
            // StringAquecimentoInput
            // 
            StringAquecimentoInput.Location = new Point(106, 225);
            StringAquecimentoInput.Name = "StringAquecimentoInput";
            StringAquecimentoInput.Size = new Size(218, 23);
            StringAquecimentoInput.TabIndex = 8;
            // 
            // AquecimentoString
            // 
            AquecimentoString.AutoSize = true;
            AquecimentoString.Location = new Point(106, 207);
            AquecimentoString.Name = "AquecimentoString";
            AquecimentoString.Size = new Size(146, 15);
            AquecimentoString.TabIndex = 7;
            AquecimentoString.Text = "Caractere de aquecimento";
            // 
            // InstrucoesInput
            // 
            InstrucoesInput.Location = new Point(106, 281);
            InstrucoesInput.Name = "InstrucoesInput";
            InstrucoesInput.Size = new Size(218, 23);
            InstrucoesInput.TabIndex = 10;
            // 
            // instrucoes
            // 
            instrucoes.AutoSize = true;
            instrucoes.Location = new Point(106, 263);
            instrucoes.Name = "instrucoes";
            instrucoes.Size = new Size(61, 15);
            instrucoes.TabIndex = 9;
            instrucoes.Text = "Instruções";
            // 
            // btn_save
            // 
            btn_save.Location = new Point(110, 356);
            btn_save.Name = "btn_save";
            btn_save.Size = new Size(214, 23);
            btn_save.TabIndex = 11;
            btn_save.Text = "Salvar";
            btn_save.UseVisualStyleBackColor = true;
            btn_save.Click += btn_save_Click;
            // 
            // tempoInput
            // 
            tempoInput.Location = new Point(106, 129);
            tempoInput.Name = "tempoInput";
            tempoInput.Size = new Size(218, 23);
            tempoInput.TabIndex = 13;
            // 
            // Tempolabel
            // 
            Tempolabel.AutoSize = true;
            Tempolabel.Location = new Point(106, 111);
            Tempolabel.Name = "Tempolabel";
            Tempolabel.Size = new Size(43, 15);
            Tempolabel.TabIndex = 12;
            Tempolabel.Text = "Tempo";
            // 
            // Form2
            // 
            AutoScaleDimensions = new SizeF(7F, 15F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(432, 538);
            Controls.Add(tempoInput);
            Controls.Add(Tempolabel);
            Controls.Add(btn_save);
            Controls.Add(InstrucoesInput);
            Controls.Add(instrucoes);
            Controls.Add(StringAquecimentoInput);
            Controls.Add(AquecimentoString);
            Controls.Add(PotenciaInput);
            Controls.Add(potencia);
            Controls.Add(AlimentoInput);
            Controls.Add(Alimento);
            Controls.Add(label1);
            Name = "Form2";
            Text = "Form2";
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private Label label1;
        private TextBox AlimentoInput;
        private Label Alimento;
        private TextBox PotenciaInput;
        private Label potencia;
        private TextBox StringAquecimentoInput;
        private Label AquecimentoString;
        private TextBox InstrucoesInput;
        private Label instrucoes;
        private Button btn_save;
        private TextBox tempoInput;
        private Label Tempolabel;
    }
}