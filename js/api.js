// Define the API key
const apiKey = 'b5d7102911msh298c5e392dc941cp1e1682jsn72ee10f12bdc';

// Function to fetch stock data with retry mechanism
function fetchStockData(symbol, retryCount = 0) {
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
            fetchStockNews(symbol);
        },
        error: function(jqxhr, textStatus, error) {
            if (jqxhr.status === 429 && retryCount < 5) {
                // Retry after a delay if rate limited (429 error)
                console.warn(`Rate limited, retrying... (${retryCount + 1})`);
                setTimeout(() => fetchStockData(symbol, retryCount + 1), (retryCount + 1) * 2000);
            } else if (jqxhr.status === 403) {
                // Handle 403 Forbidden
                console.error('Forbidden: Check API key and permissions.');
                alert('Forbidden: Check API key and permissions.');
            } else {
                // Handle other errors
                const err = `${textStatus}, ${error}`;
                console.error('Request Failed:', `Status: ${jqxhr.status}, Status Text: ${jqxhr.statusText}, Error: ${error}`);
                alert(`Failed to fetch stock data. Status: ${jqxhr.status}, Status Text: ${jqxhr.statusText}. Please try again later.`);
            }
            $('#loading').hide();
        }
    });
}

// Function to fetch stock news with retry mechanism
function fetchStockNews(symbol, retryCount = 0) {
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
            if (jqxhr.status === 429 && retryCount < 5) {
                // Retry after a delay if rate limited (429 error)
                console.warn(`Rate limited, retrying... (${retryCount + 1})`);
                setTimeout(() => fetchStockNews(symbol, retryCount + 1), (retryCount + 1) * 2000);
            } else if (jqxhr.status === 403) {
                // Handle 403 Forbidden
                console.error('Forbidden: Check API key and permissions.');
                alert('Forbidden: Check API key and permissions.');
            } else {
                // Handle other errors
                const err = `${textStatus}, ${error}`;
                console.error('Request Failed:', `Status: ${jqxhr.status}, Status Text: ${jqxhr.statusText}, Error: ${error}`);
                alert(`Failed to fetch news. Status: ${jqxhr.status}, Status Text: ${jqxhr.statusText}. Please try again later.`);
            }
        }
    });
}

// Function to fetch the latest stock price and mini-chart for the given stock symbol with retry mechanism
function fetchStockPrice(symbol, retryCount = 0) {
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
            $(`#price-${symbol}`).text(`€${latestPrice.toFixed(2)}`); // Display the latest price with Euro sign
            const prices = data.price.chartPreviousClose.map(price => price.close);
            displayMiniChart(symbol, prices.reverse()); // Display the mini-chart
        },
        error: function(jqxhr, textStatus, error) {
            if (jqxhr.status === 429 && retryCount < 5) {
                // Retry after a delay if rate limited (429 error)
                console.warn(`Rate limited, retrying... (${retryCount + 1})`);
                setTimeout(() => fetchStockPrice(symbol, retryCount + 1), (retryCount + 1) * 2000);
            } else if (jqxhr.status === 403) {
                // Handle 403 Forbidden
                console.error('Forbidden: Check API key and permissions.');
                alert('Forbidden: Check API key and permissions.');
            } else {
                // Handle other errors
                const err = `${textStatus}, ${error}`;
                console.error('Request Failed:', `Status: ${jqxhr.status}, Status Text: ${jqxhr.statusText}, Error: ${error}`);
                alert(`Failed to fetch stock price. Status: ${jqxhr.status}, Status Text: ${jqxhr.statusText}. Please try again later.`);
            }
        }
    });
}
