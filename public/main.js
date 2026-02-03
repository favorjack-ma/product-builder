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

    // Register ChartDataLabels plugin
    Chart.register(ChartDataLabels);

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
                type: 'bar', // Changed from 'pie' to 'bar'
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Portfolio Ratio',
                        data: ratios,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 1 // Adjusted for bar chart
                    }]
                },
                options: {
                    indexAxis: 'y', // For horizontal bars
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        x: {
                            beginAtZero: true,
                            max: 100, // Max 100%
                            title: {
                                display: true,
                                text: 'Ratio (%)'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Asset'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false // We are using a custom HTML legend
                        },
                        datalabels: { // Datalabels plugin configuration
                            formatter: (value, context) => {
                                return value + '%'; // Display value as percentage
                            },
                            color: '#fff',
                            font: {
                                weight: 'bold'
                            },
                            anchor: 'end',
                            align: 'start',
                            offset: 4
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