// Define the API key and region
const apiKey = 'b5d7102911msh298c5e392dc941cp1e1682jsn72ee10f12bdc';
const region = 'EU';

// Function to fetch stock symbols for autocomplete
function fetchStockSymbols(query, callback) {
    const settings = {
        async: true,
        crossDomain: true,
        url: `https://apidojo-yahoo-finance-v1.p.rapidapi.com/auto-complete?q=${query}&region=${region}`,
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
        }
    };

    console.log('Fetching stock symbols');

    $.ajax(settings).done(function (data) {
        console.log('Stock symbols fetched:', data);
        const symbols = data.quotes.map(quote => quote.symbol);
        callback(symbols);
    }).fail(function (jqxhr, textStatus, error) {
        const err = `${textStatus}, ${error}`;
        console.error('Request Failed:', `Status: ${jqxhr.status}, Status Text: ${jqxhr.statusText}, Error: ${error}`);
        alert(`Failed to fetch stock symbols. Status: ${jqxhr.status}, Status Text: ${jqxhr.statusText}. Please try again later.`);
    });
}

// Function to fetch stock data with retry mechanism
function fetchStockData(symbol, retryCount = 0) {
    $('#loading').show();
    $('#stockChart').hide();
    $('#news').hide();
    const settings = {
        async: true,
        crossDomain: true,
        url: `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-historical-data?symbol=${symbol}&region=${region}`,
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
        }
    };

    console.log(`Fetching stock data for symbol: ${symbol}`);

    $.ajax(settings).done(function (data) {
        console.log('Stock data fetched:', data);

        if (!data.meta) {
            console.error('No meta data found in response:', data);
            alert('Failed to fetch stock data. No meta data found.');
            $('#loading').hide();
            return;
        }

        const prices = data.prices.reverse();
        const labels = prices.map(price => new Date(price.date * 1000).toISOString().split('T')[0]);
        const closePrices = prices.map(price => price.close);

        displayChart(symbol, labels, closePrices);
        fetchStockNews(symbol);
        // Update the company name heading
        $('#company-name').text(`${data.meta.symbol} - ${data.meta.name}`);
    }).fail(function (jqxhr, textStatus, error) {
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
    });
}

// Function to fetch stock news with retry mechanism
function fetchStockNews(symbol, retryCount = 0) {
    const settings = {
        async: true,
        crossDomain: true,
        url: `https://apidojo-yahoo-finance-v1.p.rapidapi.com/news/v2/list?region=${region}&snippetCount=3&s=${symbol}`,
        method: 'POST',
        headers: {
            'content-type': 'text/plain',
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
        },
        data: ''
    };

    console.log('Fetching news articles for symbol:', symbol);

    $.ajax(settings).done(function (data) {
        console.log('News data fetched:', data);

        if (!data.main || !data.main.stream) {
            console.error('No valid news data found in response:', data);
            alert('Failed to fetch news. No valid news data found.');
            return;
        }

        displayNews(data.main.stream.slice(0, 3));
    }).fail(function (jqxhr, textStatus, error) {
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
    });
}

// Function to fetch the latest stock price and mini-chart for the given stock symbol with retry mechanism
function fetchStockPrice(symbol, retryCount = 0) {
    const settings = {
        async: true,
        crossDomain: true,
        url: `https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary?symbol=${symbol}&region=${region}`,
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
        }
    };

    console.log('Fetching stock price for symbol:', symbol);

    $.ajax(settings).done(function (data) {
        const latestPrice = data.price.regularMarketPrice.raw;
        $(`#price-${symbol}`).text(`€${latestPrice.toFixed(2)}`); // Display the latest price with Euro sign
        const prices = data.price.chartPreviousClose.map(price => price.close);
        displayMiniChart(symbol, prices.reverse()); // Display the mini-chart
    }).fail(function (jqxhr, textStatus, error) {
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
    });
}
