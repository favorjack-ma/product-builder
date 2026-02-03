document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/portfolio-ratios';
    const chartCanvas = document.getElementById('portfolio-chart');
    const legendUl = document.getElementById('portfolio-legend');
    let portfolioChart = null;

    const backgroundColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#C9CBCF'
    ];
    
    const borderColors = [
        '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF',
        '#FFFFFF', '#FFFFFF'
    ];

    async function fetchAndRenderPortfolio() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Prepare data for chart
            const labels = Object.values(data).map(asset => asset.name);
            const ratios = Object.values(data).map(asset => asset.ratio);

            // Render Chart
            if (portfolioChart) {
                portfolioChart.destroy(); // Destroy previous chart instance before creating a new one
            }
            portfolioChart = new Chart(chartCanvas, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Portfolio Ratio',
                        data: ratios,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false // We are using a custom HTML legend
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed !== null) {
                                        label += `${context.parsed.toFixed(2)}%`;
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });

            // Render custom HTML legend
            legendUl.innerHTML = ''; // Clear previous legend
            for (const key in data) {
                const asset = data[key];
                const changeClass = asset.change_24h >= 0 ? 'positive' : 'negative';

                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="legend-item-name">${asset.name}</span>
                    <span class="legend-item-change ${changeClass}">${parseFloat(asset.change_24h).toFixed(2)}%</span>
                    <span class="legend-item-ratio">${asset.ratio}%</span>
                `;
                legendUl.appendChild(li);
            }

        } catch (error) {
            console.error("Could not fetch or render portfolio:", error);
            legendUl.innerHTML = '<li>데이터를 불러오는 데 실패했습니다. 서버가 실행 중인지 확인해주세요.</li>';
        }
    }

    // Initial render
    fetchAndRenderPortfolio();

    // Set up auto-refresh every 60 seconds
    setInterval(fetchAndRenderPortfolio, 60000);
});