// app/static/js/dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    // Gráfico de Status
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    new Chart(statusCtx, {
        type: 'pie',
        data: {
            labels: chartData.status.labels,
            datasets: [{
                label: 'Atendimentos por Status',
                data: chartData.status.data,
                backgroundColor: ['#007bff', '#ffc107', '#28a745', '#dc3545'],
            }]
        }
    });

    // Gráfico de Prioridade
    const priorityCtx = document.getElementById('priorityChart').getContext('2d');
    new Chart(priorityCtx, {
        type: 'bar',
        data: {
            labels: chartData.priority.labels,
            datasets: [{
                label: 'Atendimentos por Prioridade',
                data: chartData.priority.data,
                backgroundColor: ['#6f42c1', '#fd7e14', '#20c997', '#e83e8c'],
            }]
        }
    });
});