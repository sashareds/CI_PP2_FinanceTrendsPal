$(document).ready(function() {
    const apiKey = 'b5d7102911msh298c5e392dc941cp1e1682jsn72ee10f12bdc';

    const stockSymbols = [
        { symbol: 'AAPL', name: 'Apple' },
        { symbol: 'MSFT', name: 'Microsoft' },
        { symbol: 'TSLA', name: 'Tesla' },
        { symbol: 'AMZN', name: 'Amazon' },
        { symbol: 'KO', name: 'Coca Cola' },
        { symbol: 'GOOGL', name: 'Google' },
        { symbol: 'NKE', name: 'Nike' }
    ];

    $('#symbol').autocomplete({
        source: stockSymbols.map(stock => stock.symbol)
    });

    $('#stock-form').on('submit', function(event) {
        event.preventDefault();
        const symbol = $('#symbol').val().toUpperCase();
        fetchStockData(symbol, apiKey);
    });

    stockSymbols.forEach(stock => {
        $('#watchlist').append(`
            <li class="watchlist-item" data-symbol="${stock.symbol}">
                <span>${stock.name}</span>
                <span id="price-${stock.symbol}"></span>
                <canvas id="chart-${stock.symbol}" width="50" height="20"></canvas>
            </li>
        `);
        fetchStockPrice(stock.symbol, apiKey);
    });

    $('#watchlist').on('click', '.watchlist-item', function() {
        const symbol = $(this).data('symbol');
        fetchStockData(symbol, apiKey);
    });
});

// Fetch stock data (time series) for the given symbol
function fetchStockData(symbol, apiKey) {
    $('#loading').show();
    $('#stockChart').hide();
    $('#news').hide();
    const url = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-historical-data?symbol=${symbol}&region=US`;

    console.log(`Fetching stock data for symbol: ${symbol}`);

    $.ajax({
        url: url,
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
            'x-rapidapi-key': apiKey
        },
        success: function(data) {
            console.log('Stock data fetched:', data);

            const prices = data.prices.reverse();
            const labels = prices.map(price => new Date(price.date * 1000).toISOString().split('T')[0]);
            const closePrices = prices.map(price => price.close);

            displayChart(symbol, labels, closePrices);
            fetchStockNews(symbol, apiKey);
        },
        error: function(jqxhr, textStatus, error) {
            const err = `${textStatus}, ${error}`;
            console.error('Request Failed:', err);
            alert('Failed to fetch stock data. Please try again later.');
            $('#loading').hide();
        }
    });
}

// Fetch the latest news articles for the given stock symbol
function fetchStockNews(symbol, apiKey) {
    const url = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/get-news?region=US&category=${symbol}`;

    console.log('Fetching news articles for symbol:', symbol);

    $.ajax({
        url: url,
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
            'x-rapidapi-key': apiKey
        },
        success: function(data) {
            console.log('News data fetched:', data);
            displayNews(data.items.result.slice(0, 3));
        },
        error: function(jqxhr, textStatus, error) {
            const err = `${textStatus}, ${error}`;
            console.error('Request Failed:', err);
            alert('Failed to fetch news articles. Please try again later.');
        }
    });
}

// Fetch the latest stock price and mini-chart for the given stock symbol
function fetchStockPrice(symbol, apiKey) {
    const url = `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=${symbol}&region=US`;

    console.log('Fetching stock price for symbol:', symbol);

    $.ajax({
        url: url,
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
            'x-rapidapi-key': apiKey
        },
        success: function(data) {
            const latestPrice = data.price.regularMarketPrice.raw;
            $(`#price-${symbol}`).text(latestPrice.toFixed(2)); // Display the latest price
            const prices = data.price.chartPreviousClose.map(price => price.close);
            displayMiniChart(symbol, prices.reverse()); // Display the mini-chart
        },
        error: function(jqxhr, textStatus, error) {
            const err = `${textStatus}, ${error}`;
            console.error('Request Failed:', err);
            alert('Failed to fetch stock price. Please try again later.');
        }
    });
}

// Display the main stock chart
function displayChart(symbol, labels, data) {
    $('#loading').hide();
    $('#stockChart').show();
    const ctx = $('#stockChart')[0].getContext('2d');

    if (window.stockChart instanceof Chart) {
        window.stockChart.destroy();
    }

    window.stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${symbol} Stock Price`,
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price'
                    }
                }
            }
        }
    });
}

// Display the latest news articles
function displayNews(articles) {
    $('#news-articles').empty();
    $('#news').show();

    articles.forEach(article => {
        const articleElement = `
            <div class="article">
                <h3><a href="${article.link}" target="_blank">${article.title}</a></h3>
                <p>${article.description}</p>
                <p><small>Source: ${article.source}</small></p>
            </div>
        `;
        $('#news-articles').append(articleElement);
    });
}

// Display the mini chart in the watchlist items
function displayMiniChart(symbol, data) {
    const ctx = $(`#chart-${symbol}`)[0].getContext('2d');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map((_, index) => index),
            datasets: [{
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false,
                borderWidth: 1,
                tension: 0.1
            }]
        },
        options: {
            responsive: false,
            scales: {
                x: { display: false },
                y: { display: false }
            },
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            elements: {
                point: { radius: 0 }
            }
        }
    });
}
