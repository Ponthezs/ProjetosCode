import logging
import discord
from discord import app_commands
from discord.ext import commands
from typing import Optional
from database.database import DatabaseManager
from bot.embeds.deal_embed import EmbedBuilder
from config.settings import settings

logger = logging.getLogger(__name__)

def is_admin():
    def predicate(interaction: discord.Interaction) -> bool:
        return interaction.user.guild_permissions.administrator
    return app_commands.check(predicate)

class DealCommands(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="setup", description="Configura os canais do servidor para receber alertas de jogos e ofertas.")
    @app_commands.describe(
        canal_gratis="Canal para jogos 100% gratuitos",
        canal_promocoes="Canal para grandes promoções",
        canal_ofertas_imperdiveis="Canal para ofertas imperdíveis (80%+ OFF)",
        canal_novidades="Canal para novas promoções detectadas"
    )
    @is_admin()
    async def setup(
        self,
        interaction: discord.Interaction,
        canal_gratis: Optional[discord.TextChannel] = None,
        canal_promocoes: Optional[discord.TextChannel] = None,
        canal_ofertas_imperdiveis: Optional[discord.TextChannel] = None,
        canal_novidades: Optional[discord.TextChannel] = None,
    ):
        await interaction.response.defer(ephemeral=True)
        guild_id = str(interaction.guild_id)

        update_kwargs = {}
        if canal_gratis:
            update_kwargs["channel_free_games"] = str(canal_gratis.id)
        if canal_promocoes:
            update_kwargs["channel_deals"] = str(canal_promocoes.id)
        if canal_ofertas_imperdiveis:
            update_kwargs["channel_big_deals"] = str(canal_ofertas_imperdiveis.id)
        if canal_novidades:
            update_kwargs["channel_new_offers"] = str(canal_novidades.id)

        conf = await DatabaseManager.update_guild_config(guild_id, **update_kwargs)

        embed = discord.Embed(
            title="⚙️ Configuração dos Canais Concluída!",
            color=0x2ECC71,
            description="Os canais foram atualizados com sucesso para este servidor:"
        )

        embed.add_field(name="🎁 Jogos Grátis", value=f"<#{conf.channel_free_games}>" if conf.channel_free_games else "Não configurado", inline=False)
        embed.add_field(name="🔥 Promoções", value=f"<#{conf.channel_deals}>" if conf.channel_deals else "Não configurado", inline=False)
        embed.add_field(name="💎 Ofertas Imperdíveis", value=f"<#{conf.channel_big_deals}>" if conf.channel_big_deals else "Não configurado", inline=False)
        embed.add_field(name="🆕 Novidades", value=f"<#{conf.channel_new_offers}>" if conf.channel_new_offers else "Não configurado", inline=False)

        await interaction.followup.send(embed=embed, ephemeral=True)

    @app_commands.command(name="gratis", description="Mostra todos os jogos atualmente gratuitos nas lojas.")
    async def gratis(self, interaction: discord.Interaction):
        await interaction.response.defer()
        free_games = await DatabaseManager.get_active_free_games()

        if not free_games:
            await interaction.followup.send("🎁 Nenhum jogo gratuito temporário encontrado no momento. Verifique novamente em breve!")
            return

        for game in free_games[:5]:  # Limit to 5 embeds to prevent Discord limit spam
            embed = EmbedBuilder.create_free_game_embed(game)
            await interaction.followup.send(embed=embed)

    @app_commands.command(name="promocoes", description="Mostra as melhores promoções de jogos atualmente ativas.")
    @app_commands.describe(desconto_minimo="Percentual mínimo de desconto (ex: 50)")
    async def promocoes(self, interaction: discord.Interaction, desconto_minimo: Optional[float] = 50.0):
        await interaction.response.defer()
        deals = await DatabaseManager.get_active_deals(min_discount=desconto_minimo or 50.0, limit=5)

        if not deals:
            await interaction.followup.send(f"🔥 Nenhuma promoção com no mínimo **{desconto_minimo}% OFF** encontrada no momento.")
            return

        for deal in deals:
            is_extreme = deal.discount >= settings.EXTREME_DISCOUNT
            embed = EmbedBuilder.create_big_deal_embed(deal, is_extreme=is_extreme)
            await interaction.followup.send(embed=embed)

    @app_commands.command(name="ofertas", description="Mostra as ofertas de maior desconto disponíveis (Imperdíveis 80%+ OFF).")
    async def ofertas(self, interaction: discord.Interaction):
        await interaction.response.defer()
        deals = await DatabaseManager.get_active_deals(min_discount=settings.EXTREME_DISCOUNT, limit=5)

        if not deals:
            await interaction.followup.send("💎 Nenhuma oferta imperdível de **80% OFF** ou mais encontrada no momento.")
            return

        for deal in deals:
            embed = EmbedBuilder.create_big_deal_embed(deal, is_extreme=True)
            await interaction.followup.send(embed=embed)

    async def _send_store_deals(self, interaction: discord.Interaction, store_name: str):
        await interaction.response.defer()
        deals = await DatabaseManager.get_active_deals(min_discount=30.0, store_filter=store_name, limit=5)

        if not deals:
            await interaction.followup.send(f"🏪 Nenhuma oferta relevante encontrada para a loja **{store_name}** no momento.")
            return

        for deal in deals:
            embed = EmbedBuilder.create_big_deal_embed(deal, is_extreme=(deal.discount >= 80.0))
            await interaction.followup.send(embed=embed)

    @app_commands.command(name="steam", description="Mostra ofertas ativas na Steam.")
    async def steam(self, interaction: discord.Interaction):
        await self._send_store_deals(interaction, "Steam")

    @app_commands.command(name="epic", description="Mostra ofertas ativas na Epic Games Store.")
    async def epic(self, interaction: discord.Interaction):
        await self._send_store_deals(interaction, "Epic")

    @app_commands.command(name="ea", description="Mostra ofertas ativas na EA Store.")
    async def ea(self, interaction: discord.Interaction):
        await self._send_store_deals(interaction, "EA")

    @app_commands.command(name="playstation", description="Mostra ofertas ativas na PlayStation Store.")
    async def playstation(self, interaction: discord.Interaction):
        await self._send_store_deals(interaction, "PlayStation")

    @app_commands.command(name="xbox", description="Mostra ofertas ativas na Xbox Store.")
    async def xbox(self, interaction: discord.Interaction):
        await self._send_store_deals(interaction, "Xbox")

    @app_commands.command(name="ubisoft", description="Mostra ofertas ativas na Ubisoft Store.")
    async def ubisoft(self, interaction: discord.Interaction):
        await self._send_store_deals(interaction, "Ubisoft")

    @app_commands.command(name="gog", description="Mostra ofertas ativas na GOG.")
    async def gog(self, interaction: discord.Interaction):
        await self._send_store_deals(interaction, "GOG")

    @app_commands.command(name="config", description="Altera configurações de desconto mínimo do servidor.")
    @app_commands.describe(desconto_minimo="Novo valor padrão para desconto mínimo em %")
    @is_admin()
    async def config(self, interaction: discord.Interaction, desconto_minimo: float):
        await interaction.response.defer(ephemeral=True)
        guild_id = str(interaction.guild_id)
        conf = await DatabaseManager.update_guild_config(guild_id, min_discount=desconto_minimo)

        embed = discord.Embed(
            title="⚙️ Configurações Atualizadas",
            description=f"Desconto mínimo alterado para **{conf.min_discount}% OFF** neste servidor.",
            color=0x3498DB
        )
        await interaction.followup.send(embed=embed, ephemeral=True)

    @app_commands.command(name="test", description="Envia uma promoção de teste para verificar se o bot e canais estão funcionando.")
    @is_admin()
    async def test(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)
        guild_id = str(interaction.guild_id)
        conf = await DatabaseManager.get_guild_config(guild_id)

        target_channel_id = None
        if conf:
            target_channel_id = conf.channel_free_games or conf.channel_deals or conf.channel_big_deals
        if not target_channel_id:
            target_channel_id = settings.CHANNEL_FREE_GAMES or settings.CHANNEL_DEALS

        if not target_channel_id:
            await interaction.followup.send("⚠️ Nenhum canal configurado. Utilize `/setup` para definir os canais do servidor primeiro.", ephemeral=True)
            return

        try:
            channel = self.bot.get_channel(int(target_channel_id))
            if not channel:
                channel = await self.bot.fetch_channel(int(target_channel_id))

            test_embed = discord.Embed(
                title="🎁 JOGO GRÁTIS (TESTE) — Control",
                url="https://store.epicgames.com",
                color=0x2ECC71,
                description=(
                    "🔥 **Control (DEMO DE TESTE)**\n\n"
                    "💰 **Preço normal:** ~~R$ 199,90~~\n"
                    "🆓 **Agora:** **GRÁTIS (R$ 0,00)**\n\n"
                    "🏪 **Loja:** Epic Games Store\n"
                    "⏰ **Oferta termina:** 30/08/2026\n\n"
                    "🔗 **[RESGATAR AGORA](https://store.epicgames.com)**\n\n"
                    "⚠️ *Mensagem de teste enviada com sucesso!*"
                )
            )
            test_embed.set_footer(text="Bot Game Deals • Test Command")
            msg = await channel.send(embed=test_embed)

            await interaction.followup.send(f"✅ Promoção de teste enviada com sucesso para o canal <#{target_channel_id}>! (Mensagem ID: `{msg.id}`)", ephemeral=True)
        except Exception as ex:
            logger.error(f"Error executing /test command: {ex}")
            await interaction.followup.send(f"❌ Erro ao enviar mensagem de teste: `{ex}`. Verifique se o bot possui permissão no canal.", ephemeral=True)

    @app_commands.command(name="status", description="Mostra o status de monitoramento, lojas ativas e estatísticas do bot.")
    async def status(self, interaction: discord.Interaction):
        await interaction.response.defer()
        stats = await DatabaseManager.get_dashboard_stats()
        embed = EmbedBuilder.create_status_embed(stats)
        await interaction.followup.send(embed=embed)

async def setup(bot: commands.Bot):
    await bot.add_cog(DealCommands(bot))
