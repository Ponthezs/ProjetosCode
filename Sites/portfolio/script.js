document.addEventListener('DOMContentLoaded', function() {
    // Atualiza o ano no rodapé
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Opcional: Navegação suave (smooth scroll) - já definido no CSS com html { scroll-behavior: smooth; }
    // Se precisar de mais controle ou para navegadores mais antigos, pode adicionar JS para isso.

    // Opcional: Destacar link ativo na navegação ao rolar (mais complexo)
    // Isso envolveria monitorar a posição de rolagem e verificar qual seção está visível.
});