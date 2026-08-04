import random

class ConversationalBrain:
    def __init__(self):
        self.user_name = "Senhor"

    def get_response(self, text, intent="unknown"):
        t = text.lower().strip()

        # O que está fazendo?
        if any(phrase in t for phrase in ['fazendo', 'que esta fazendo', 'que voce esta fazendo', 'que voce ta fazendo', 'ta fazendo o que']):
            respostas_fazendo = [
                "Estou aqui monitorando seus sistemas e totalmente à sua disposição! O que vamos fazer agora?",
                "Estou processando dados, de olho nos seus recursos e pronto para conversar com você.",
                "Estou por aqui, ajustando meus circuitos e aguardando seus comandos."
            ]
            return random.choice(respostas_fazendo)

        # Saudações
        if any(w in t for w in ['olá', 'ola', 'oi', 'hey', 'bom dia', 'boa tarde', 'boa noite', 'jarvis']):
            if 'bom dia' in t:
                return "Bom dia! Como posso ajudar você hoje?"
            elif 'boa tarde' in t:
                return "Boa tarde! Tudo pronto por aqui."
            elif 'boa noite' in t:
                return "Boa noite! Em que posso ajudar você?"
            else:
                saudacoes = [
                    "Olá! Como posso ajudar?",
                    "Oi! Estou à sua disposição.",
                    "Sistemas online e prontos para você!"
                ]
                return random.choice(saudacoes)

        # Pergunta sobre estado / tudo bem
        if any(w in t for w in ['tudo bem', 'como vai', 'como você está', 'como esta', 'beleza']):
            respostas = [
                "Estou ótimo, 100% operacional! E você, como está?",
                "Tudo perfeito por aqui, pronto para ajudá-lo!",
                "Excelente! Como posso tornar seu dia mais prático?"
            ]
            return random.choice(respostas)

        # Identidade
        if any(w in t for w in ['quem é você', 'quem e voce', 'qual seu nome', 'o que você é']):
            return "Eu sou o J.A.R.V.I.S, seu assistente virtual inteligente."

        # Capacidades
        if any(w in t for w in ['o que você faz', 'o que voce faz', 'ajuda', 'comandos', 'capacidades']):
            return "Posso te dizer as horas, a data, a previsão do tempo, abrir sites como Google, YouTube e Spotify, além de monitorar o uso da sua CPU e RAM."

        # Agradecimentos
        if any(w in t for w in ['obrigado', 'valeu', 'muito obrigado', 'tks', 'thanks']):
            agradecimentos = [
                "Por nada! Sempre que precisar.",
                "Disponha!",
                "É um prazer ajudar!"
            ]
            return random.choice(agradecimentos)

        # Piada
        if any(w in t for w in ['piada', 'conte uma piada', 'engraçado']):
            piadas = [
                "Por que o computador foi ao médico? Porque estava com um vírus!",
                "Existem 10 tipos de pessoas no mundo: as que entendem binário e as que não entendem.",
                "Qual é o café favorito dos programadores? O Java!"
            ]
            return random.choice(piadas)

        # Resposta direta e fluida sem prefixos robóticos
        respostas_diretas = [
            "Entendi perfeitamente. O que mais você precisa?",
            "Certo, estou acompanhando você.",
            "Compreendido! Estou aqui se precisar de algo mais."
        ]
        return random.choice(respostas_diretas)
