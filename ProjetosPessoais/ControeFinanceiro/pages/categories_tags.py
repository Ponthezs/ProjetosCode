import streamlit as st
from controllers.app_controller import AppController
from models.category import Category, Subcategory
from models.owner import Owner
from models.tag import Tag

def render(controller: AppController):
    st.markdown("""
    <div class="header-container">
        <h1 class="header-title">🏷️ Categorias, Subcategorias & Tags</h1>
        <div class="header-subtitle">Organização ilimitada, personalização de cores/ícones e mesclagem de categorias</div>
    </div>
    """, unsafe_allow_html=True)

    tab_cat, tab_sub, tab_merge, tab_tags, tab_owners = st.tabs([
        "📁 Categorias", "📂 Subcategorias", "🔀 Mesclar Categorias", "🏷️ Tags", "👤 Proprietários"
    ])

    # TAB 1: Categorias
    with tab_cat:
        st.subheader("Categorias Cadastradas")
        categories = controller.categories.get_all_with_subcategories()

        cols = st.columns(3)
        for idx, cat in enumerate(categories):
            with cols[idx % 3]:
                st.markdown(f"""
                <div class="metric-card" style="border-left: 5px solid {cat.color};">
                    <div style="font-size: 1.3rem;">{cat.icon} <b>{cat.name}</b> ({cat.type})</div>
                    <div style="font-size: 0.85rem; color: #94A3B8; margin-top: 0.4rem;">
                        Subcategorias: {len(cat.subcategories)}
                    </div>
                </div>
                """, unsafe_allow_html=True)

        st.markdown("<hr style='border-color: rgba(255,255,255,0.1); margin: 1.5rem 0;'>", unsafe_allow_html=True)
        st.subheader("➕ Criar Nova Categoria")
        with st.form("new_cat_form"):
            c1, c2, c3 = st.columns(3)
            with c1:
                cat_name = st.text_input("Nome da Categoria*")
            with c2:
                cat_type = st.selectbox("Tipo", ["Despesa", "Receita", "Investimento"])
            with c3:
                cat_icon = st.text_input("Ícone Emoji", value="📁")

            cat_color = st.color_picker("Cor da Categoria", value="#3498DB")

            if st.form_submit_button("💾 Salvar Categoria"):
                if not cat_name:
                    st.error("Nome é obrigatório.")
                else:
                    new_c = Category(name=cat_name, type=cat_type, icon=cat_icon, color=cat_color)
                    controller.categories.add(new_c)
                    st.success(f"Categoria '{cat_name}' criada!")
                    st.rerun()

    # TAB 2: Subcategorias
    with tab_sub:
        st.subheader("Adicionar Subcategoria")
        categories = controller.categories.get_all()
        cat_dict = {f"{c.icon} {c.name}": c.id for c in categories}
        sel_cat_label = st.selectbox("Selecione a Categoria Pai:", list(cat_dict.keys()))

        with st.form("new_sub_form"):
            sub_name = st.text_input("Nome da Subcategoria*")
            if st.form_submit_button("➕ Adicionar Subcategoria"):
                if not sub_name:
                    st.error("Nome da subcategoria é obrigatório.")
                else:
                    controller.categories.add_subcategory(sub_name, cat_dict[sel_cat_label])
                    st.success(f"Subcategoria '{sub_name}' adicionada!")
                    st.rerun()

    # TAB 3: Mesclar Categorias
    with tab_merge:
        st.subheader("🔀 Mesclar Categoria de Origem na Categoria de Destino")
        st.warning("⚠️ Esta operação reatribuirá todas as movimentações e subcategorias da categoria de origem para a de destino, e depois excluirá a categoria de origem.")

        categories = controller.categories.get_all()
        cat_dict_merge = {c.name: c.id for c in categories}

        col_m1, col_m2 = st.columns(2)
        with col_m1:
            src_name = st.selectbox("Categoria de Origem (Será Excluída)", list(cat_dict_merge.keys()))
        with col_m2:
            dst_name = st.selectbox("Categoria de Destino (Manterá Tudo)", list(cat_dict_merge.keys()))

        if st.button("🔀 Executar Mesclagem de Categorias"):
            if src_name == dst_name:
                st.error("A categoria de origem deve ser diferente da categoria de destino.")
            else:
                success = controller.categories.merge_categories(cat_dict_merge[src_name], cat_dict_merge[dst_name])
                if success:
                    st.success(f"Categoria '{src_name}' mesclada com sucesso em '{dst_name}'!")
                    st.rerun()

    # TAB 4: Tags
    with tab_tags:
        st.subheader("Tags do Sistema")
        tags = controller.tags.get_all()
        st.write(", ".join([f"`{t.name}`" for t in tags]))

        with st.form("new_tag_form"):
            tag_name = st.text_input("Nova Tag")
            if st.form_submit_button("➕ Salvar Tag"):
                if tag_name:
                    controller.tags.add(Tag(name=tag_name))
                    st.success(f"Tag '{tag_name}' criada!")
                    st.rerun()

    # TAB 5: Proprietários
    with tab_owners:
        st.subheader("Proprietários das Despesas")
        owners = controller.owners.get_all()
        for o in owners:
            st.write(f"• **{o.name}** {'(Padrão)' if o.is_default else ''}")

        with st.form("new_owner_form"):
            owner_name = st.text_input("Novo Proprietário (Ex: Filho, Sogras, Projeto X)")
            if st.form_submit_button("➕ Salvar Proprietário"):
                if owner_name:
                    controller.owners.add(Owner(name=owner_name))
                    st.success(f"Proprietário '{owner_name}' adicionado!")
                    st.rerun()
