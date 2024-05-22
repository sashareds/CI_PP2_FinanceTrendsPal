$(document).ready(function() {
    const stockSymbols = [
        "AAPL", "MSFT", "GOOGL", "AMZN", "FB", "TSLA", "BRK.A", "V", "JNJ", "WMT",
        "JPM", "PG", "UNH", "DIS", "NVDA", "HD", "PYPL", "MA", "VZ", "NFLX"
    ];

    $('#symbol').autocomplete({
        source: stockSymbols
    });

    $('#stock-form').on('submit', function(event) {
        event.preventDefault();
        const symbol = $('#symbol').val().toUpperCase();
        fetchStockData(symbol);
    });
});

function fetchStockData(symbol) {
    const apiKey = 'JITGUBI3HN04HP10';
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
    
    $.getJSON(url, function(data) {
        if (data['Error Message']) {
            alert('Invalid stock symbol. Please try again.');
            return;
        }

        const timeSeries = data['Time Series (Daily)'];
        const labels = Object.keys(timeSeries).reverse();
        const prices = labels.map(date => parseFloat(timeSeries[date]['4. close']));

        fetchExchangeRate(prices, labels, symbol);
    });
}

function fetchExchangeRate(prices, labels, symbol) {
    const apiKey = 'JITGUBI3HN04HP10';
    const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey=${apiKey}`;

    $.getJSON(url, function(data) {
        const exchangeRate = parseFloat(data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
        const pricesInEuro = prices.map(price => price * exchangeRate);
        displayChart(symbol, labels, pricesInEuro);
    });
}

function displayChart(symbol, labels, data) {
    const ctx = $('#stockChart')[0].getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${symbol} Stock Price (EUR)`,
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
                        text: 'Price (EUR)'
                    }
                }
            }
        }
    });
}
