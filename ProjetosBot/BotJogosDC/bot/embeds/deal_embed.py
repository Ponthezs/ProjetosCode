import discord
from datetime import datetime
from typing import Optional
from database.models import GameDealModel
from stores.base_store import DealDTO

class EmbedBuilder:
    @staticmethod
    def format_currency(price: float, currency: str = "BRL") -> str:
        if currency.upper() in ["BRL", "R$"]:
            return f"R$ {price:.2f}".replace(".", ",")
        elif currency.upper() in ["USD", "US$"]:
            return f"US$ {price:.2f}"
        elif currency.upper() in ["EUR", "€"]:
            return f"€ {price:.2f}"
        return f"{currency} {price:.2f}"

    @staticmethod
    def create_free_game_embed(deal: GameDealModel) -> discord.Embed:
        embed = discord.Embed(
            title=f"🎁 JOGO GRÁTIS — {deal.title}",
            url=deal.url,
            color=0x2ECC71,  # Emerald Green
            timestamp=datetime.now()
        )

        normal_fmt = EmbedBuilder.format_currency(deal.normal_price, deal.currency)

        desc = (
            f"🔥 **{deal.title}**\n\n"
            f"💰 **Preço normal:** ~~{normal_fmt}~~\n"
            f"🆓 **Agora:** **GRÁTIS**\n\n"
            f"🏪 **Loja:** {deal.store}\n"
        )

        if deal.end_date:
            end_str = deal.end_date.strftime("%d/%m/%Y às %H:%H UTC")
            desc += f"⏰ **Oferta termina:** {end_str}\n"

        desc += f"\n🔗 **[RESGATAR AGORA]({deal.url})**\n\n"
        desc += "⚠️ *Oferta por tempo limitado!*"

        embed.description = desc

        if deal.image_url:
            embed.set_image(url=deal.image_url)

        embed.set_footer(text=f"{deal.store} • Bot Game Deals", icon_url="https://cdn-icons-png.flaticon.com/512/686/686589.png")
        return embed

    @staticmethod
    def create_big_deal_embed(deal: GameDealModel, is_extreme: bool = False) -> discord.Embed:
        color = 0x9B59B6 if is_extreme else 0xE67E22  # Purple for Extreme, Orange for Big Deal
        tag = "💎 OFERTA IMPERDÍVEL" if is_extreme else "🔥 GRANDE DESCONTO"

        embed = discord.Embed(
            title=f"{tag} — {deal.title}",
            url=deal.url,
            color=color,
            timestamp=datetime.now()
        )

        orig_fmt = EmbedBuilder.format_currency(deal.normal_price, deal.currency)
        sale_fmt = EmbedBuilder.format_currency(deal.sale_price, deal.currency)

        embed.add_field(name="🎮 Jogo", value=f"**{deal.title}**", inline=False)
        embed.add_field(name="❌ De", value=f"~~{orig_fmt}~~", inline=True)
        embed.add_field(name="✅ Por", value=f"**{sale_fmt}**", inline=True)
        embed.add_field(name="📉 Desconto", value=f"**{deal.discount:.0f}% OFF**", inline=True)

        embed.add_field(name="🏪 Loja", value=deal.store, inline=True)

        if deal.end_date:
            end_str = deal.end_date.strftime("%d/%m/%Y")
            embed.add_field(name="⏰ Termina em", value=end_str, inline=True)

        embed.add_field(name="🔗 Comprar", value=f"[Acessar Loja]({deal.url})", inline=False)

        if deal.image_url:
            embed.set_image(url=deal.image_url)

        embed.set_footer(text="Bot Game Deals", icon_url="https://cdn-icons-png.flaticon.com/512/686/686589.png")
        return embed

    @staticmethod
    def create_new_offer_embed(deal: GameDealModel) -> discord.Embed:
        embed = discord.Embed(
            title=f"🆕 NOVA OFERTA ENCONTRADA! — {deal.title}",
            url=deal.url,
            color=0x3498DB,  # Blue
            timestamp=datetime.now()
        )

        orig_fmt = EmbedBuilder.format_currency(deal.normal_price, deal.currency)
        sale_fmt = EmbedBuilder.format_currency(deal.sale_price, deal.currency)

        embed.description = (
            f"🎮 **{deal.title}**\n"
            f"📉 **{deal.discount:.0f}% OFF**\n"
            f"💰 ~~{orig_fmt}~~ ➔ **{sale_fmt}**\n\n"
            f"🏪 **Loja:** {deal.store}\n\n"
            f"🔗 **[Ver Oferta]({deal.url})**"
        )

        if deal.image_url:
            embed.set_thumbnail(url=deal.image_url)

        embed.set_footer(text="Bot Game Deals")
        return embed

    @staticmethod
    def create_status_embed(stats: dict) -> discord.Embed:
        embed = discord.Embed(
            title="📊 Status do Bot & Lojas Monitoradas",
            color=0x1ABC9C,
            timestamp=datetime.now()
        )

        embed.add_field(name="🎮 Jogos Monitorados", value=str(stats.get("total_monitored_games", 0)), inline=True)
        embed.add_field(name="🔥 Promoções Ativas", value=str(stats.get("active_deals_count", 0)), inline=True)
        embed.add_field(name="🎁 Jogos Grátis Ativos", value=str(stats.get("free_games_count", 0)), inline=True)
        embed.add_field(name="📢 Ofertas Publicadas", value=str(stats.get("published_offers_count", 0)), inline=True)
        embed.add_field(name="🏪 Lojas Ativas", value=f"{stats.get('active_stores_count', 0)}/{stats.get('total_stores_count', 0)}", inline=True)

        stores_str = ""
        for st in stats.get("stores", []):
            icon = "✅" if st["status"] == "OK" else "❌"
            stores_str += f"{icon} **{st['store_name']}**: {st['items_found']} ofertas ({st['free_games_found']} grátis)\n"

        if stores_str:
            embed.add_field(name="Status por Loja", value=stores_str, inline=False)

        embed.set_footer(text="Bot Game Deals")
        return embed
