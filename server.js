const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('public'));

// Function to fetch raw asset data
async function getAssetData() {
    // --- REAL DATA ---
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        params: {
            vs_currency: 'usd',
            ids: 'bitcoin',
            price_change_percentage: '24h'
        }
    });
    const bitcoin_24h_change = response.data[0].price_change_percentage_24h;

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

// API route to get calculated portfolio ratios
app.get('/api/portfolio-ratios', async (req, res) => {
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

        res.json(portfolioRatios);

    } catch (error) {
        if (error.response) {
            console.error('Error fetching API data:', error.response.status, error.response.data);
            res.status(500).json({ error: 'Failed to fetch data from an external API.' });
        } else {
            console.error('Error setting up API request:', error.message);
            res.status(500).json({ error: 'An internal server error occurred.' });
        }
    }
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
