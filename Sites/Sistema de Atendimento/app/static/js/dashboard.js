// app/static/js/dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    if (!window.chartData) return;

    Chart.defaults.color = '#9ca3af';
    Chart.defaults.font.family = "'Inter', sans-serif";

    // Chart 1: Status (Doughnut)
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        new Chart(statusCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: chartData.status.labels,
                datasets: [{
                    data: chartData.status.data,
                    backgroundColor: [
                        '#f59e0b', // Aberto (Amber)
                        '#3b82f6', // Em Andamento (Blue)
                        '#8b5cf6', // Aguardando Resposta (Purple)
                        '#10b981'  // Fechado (Emerald)
                    ],
                    borderWidth: 2,
                    borderColor: '#0b0f19'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, usePointStyle: true }
                    }
                },
                cutout: '70%'
            }
        });
    }

    // Chart 2: Priority (Bar)
    const priorityCtx = document.getElementById('priorityChart');
    if (priorityCtx) {
        new Chart(priorityCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: chartData.priority.labels,
                datasets: [{
                    label: 'Quantidade',
                    data: chartData.priority.data,
                    backgroundColor: [
                        'rgba(100, 116, 139, 0.7)',
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(244, 63, 94, 0.7)'
                    ],
                    borderColor: [
                        '#64748b',
                        '#3b82f6',
                        '#f59e0b',
                        '#f43f5e'
                    ],
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1 },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // Chart 3: Category (Pie)
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        new Chart(categoryCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: chartData.category.labels,
                datasets: [{
                    data: chartData.category.data,
                    backgroundColor: [
                        '#6366f1',
                        '#a855f7',
                        '#06b6d4',
                        '#ec4899',
                        '#64748b'
                    ],
                    borderWidth: 2,
                    borderColor: '#0b0f19'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, usePointStyle: true }
                    }
                }
            }
        });
    }
});