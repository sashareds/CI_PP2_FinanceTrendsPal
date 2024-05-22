$(document).ready(function() {
    $('#stock-form').on('submit', function(event) {
        event.preventDefault();
        const symbol = $('#symbol').val().toUpperCase();
        console.log(`Form submitted with symbol: ${symbol}`);
        fetchStockData(symbol);
    });
});

function fetchStockData(symbol) {
    const apiKey = 'JITGUBI3HN04HP10';
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
    
    console.log(`Fetching stock data for symbol: ${symbol}`);

    $.getJSON(url, function(data) {
        if (data['Error Message']) {
            alert('Invalid stock symbol. Please try again.');
            return;
        }

        const timeSeries = data['Time Series (Daily)'];
        const labels = Object.keys(timeSeries).reverse();
        const prices = labels.map(date => parseFloat(timeSeries[date]['4. close']));

        displayChart(symbol, labels, prices);
    });
}



function displayChart(symbol, labels, data) {
    const ctx = $('#stockChart')[0].getContext('2d');
    const chart = new Chart(ctx, {
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
                        text: 'Price (USD)'
                    }
                }
            }
        }
    });
}
