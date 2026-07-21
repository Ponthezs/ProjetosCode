# seed.py
import os
from app import create_app
from app.models import db, User, Ticket, PriorityEnum, StatusEnum, CategoryEnum, Message, Attachment

app = create_app()

def seed():
    with app.app_context():
        print("Limpando e reconstruindo banco de dados...")
        db.drop_all()
        db.create_all()

        print("Criando usuários de teste...")
        admin = User(
            name="Administrador do Sistema",
            email="admin@sistema.com",
            phone="(11) 98765-4321",
            is_admin=True
        )
        admin.set_password("admin123")

        user1 = User(
            name="Maria Silva",
            email="maria@cliente.com",
            phone="(11) 91234-5678",
            is_admin=False
        )
        user1.set_password("user123")

        user2 = User(
            name="Carlos Oliveira",
            email="carlos@cliente.com",
            phone="(21) 99887-7665",
            is_admin=False
        )
        user2.set_password("user123")

        db.session.add_all([admin, user1, user2])
        db.session.commit()

        print("Criando chamados de teste...")
        ticket1 = Ticket(
            protocol="TK-102938",
            title="Erro 500 ao emitir relatório financeiro mensal",
            description="Quando tento exportar o relatório consolidado do mês anterior no formato PDF, a página fica carregando infinitamente e retorna uma tela de Erro 500.",
            category=CategoryEnum.FINANCEIRO,
            priority=PriorityEnum.ALTA,
            status=StatusEnum.EM_ANDAMENTO,
            user_id=user1.id
        )

        ticket2 = Ticket(
            protocol="TK-582910",
            title="Dúvida sobre upgrade do plano anual",
            description="Gostaria de saber quais são os métodos de pagamento aceitos para renovação anual com desconto para equipes de 15 pessoas.",
            category=CategoryEnum.COMERCIAL,
            priority=PriorityEnum.MEDIA,
            status=StatusEnum.ABERTO,
            user_id=user2.id
        )

        ticket3 = Ticket(
            protocol="TK-918273",
            title="Falha de conexão com a API de integração",
            description="A rota /v1/transactions está devolvendo timeout de conexão intermitente desde as 09:00 de hoje.",
            category=CategoryEnum.TECNICO,
            priority=PriorityEnum.MAXIMA,
            status=StatusEnum.AGUARDANDO_RESPOSTA,
            user_id=user1.id
        )

        ticket4 = Ticket(
            protocol="TK-443912",
            title="Solicitação de troca de e-mail cadastrado",
            description="Preciso alterar meu e-mail de acesso para o novo domínio corporativo.",
            category=CategoryEnum.DUVIDAS,
            priority=PriorityEnum.MINIMA,
            status=StatusEnum.FECHADO,
            user_id=user2.id
        )

        db.session.add_all([ticket1, ticket2, ticket3, ticket4])
        db.session.commit()

        print("Criando mensagens de histórico nos chamados...")
        m1 = Message(
            content="Olá Maria, identificamos o problema na rotina de geração de PDF. Nossa equipe técnica já está aplicando um patch de correção.",
            user_id=admin.id,
            ticket_id=ticket1.id
        )
        m2 = Message(
            content="Obrigada pelo retorno rápido! Fico no aguardo da atualização.",
            user_id=user1.id,
            ticket_id=ticket1.id
        )
        m3 = Message(
            content="Instabilidade investigada. Foi constatado um pico de tráfego de entrada. Por favor, valide se a requisição voltou ao normal.",
            user_id=admin.id,
            ticket_id=ticket3.id
        )

        db.session.add_all([m1, m2, m3])
        db.session.commit()

        print("\n=======================================================")
        print(" Banco de dados inicializado com sucesso!")
        print(" Contas para teste:")
        print("  - Admin:   admin@sistema.com  / senha: admin123")
        print("  - Usuário: maria@cliente.com  / senha: user123")
        print("  - Usuário: carlos@cliente.com / senha: user123")
        print("=======================================================\n")

if __name__ == '__main__':
    seed()
