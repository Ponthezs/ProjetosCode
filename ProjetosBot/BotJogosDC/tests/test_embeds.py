from database.models import GameDealModel
from bot.embeds.deal_embed import EmbedBuilder

def test_embed_formatting():
    game = GameDealModel(
        id=1,
        deal_key="test_1",
        title="Cyberpunk 2077",
        store="Steam",
        normal_price=199.90,
        sale_price=99.95,
        discount=50.0,
        currency="BRL",
        url="https://store.steampowered.com/app/1091500/",
        image_url="https://example.com/cover.jpg",
        is_free=False
    )

    embed_big = EmbedBuilder.create_big_deal_embed(game, is_extreme=False)
    assert "Cyberpunk 2077" in embed_big.title
    assert embed_big.color.value == 0xE67E22

    game_free = GameDealModel(
        id=2,
        deal_key="test_2",
        title="Control",
        store="Epic Games Store",
        normal_price=199.90,
        sale_price=0.0,
        discount=100.0,
        currency="BRL",
        url="https://store.epicgames.com",
        is_free=True
    )

    embed_free = EmbedBuilder.create_free_game_embed(game_free)
    assert "Control" in embed_free.title
    assert embed_free.color.value == 0x2ECC71
    assert "GRÁTIS" in embed_free.description
