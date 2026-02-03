// functions/api/portfolio-ratios.js

// Function to fetch raw asset data
async function getAssetData() {
    // --- REAL DATA ---
    // Using native fetch, which is available in Cloudflare Workers
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&price_change_percentage=24h');
    const data = await response.json();
    const bitcoin_24h_change = data[0].price_change_percentage_24h;

    // --- MOCK DATA ---
    const gold_24h_change = (Math.random() * 4) - 2;
    const silver_24h_change = (Math.random() * 6) - 3;
    const kospi_24h_change = (Math.random() * 3) - 1.5;
    const sp500_24h_change = (Math.random() * 3) - 1.5;

    return {
        bitcoin: { name: '비트코인', change_24h: bitcoin_24h_change },
        gold: { name: '금', change_24h: gold_24h_change },
        silver: { name: '은', change_24h: silver_24h_change },
        korea_stock: { name: '국내주식 (KOSPI)', change_24h: kospi_24h_change },
        global_stock: { name: '해외주식 (S&P 500)', change_24h: sp500_24h_change }
    };
}

// Cloudflare Pages Function handler
export async function onRequest(context) {
    try {
        const assetData = await getAssetData();
        const portfolioRatios = {};
        let totalScore = 0;

        // 1. Calculate scores (weights) for each asset
        const assetScores = {};
        for (const key in assetData) {
            const asset = assetData[key];
            // Add a baseline to handle negative returns. Clamp at 0.
            const score = Math.max(0, 10 + asset.change_24h);
            assetScores[key] = score;
            totalScore += score;
        }

        // 2. Calculate percentage allocation for each asset
        for (const key in assetScores) {
            const score = assetScores[key];
            const ratio = totalScore > 0 ? (score / totalScore) * 100 : 0; // Avoid division by zero
            portfolioRatios[key] = {
                name: assetData[key].name,
                change_24h: assetData[key].change_24h.toFixed(2),
                ratio: ratio.toFixed(2) // Format to 2 decimal places
            };
        }

        return new Response(JSON.stringify(portfolioRatios), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error fetching or processing data:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch or process data.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
