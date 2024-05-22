$(document).ready(function() {
    // Fetch stock symbols dynamically
    fetchStockSymbols().then(stockSymbols => {
        // Initialize autocomplete for the stock symbol input field
        $('#symbol').autocomplete({
            source: stockSymbols
        });
    });

    // Handle form submission to fetch stock data
    $('#stock-form').on('submit', function(event) {
        event.preventDefault();
        const symbol = $('#symbol').val().toUpperCase();
        fetchStockData(symbol);
    });

    // Populate the watchlist with predefined symbols and fetch initial stock prices
    const predefinedSymbols = [
        { symbol: 'AAPL', name: 'Apple' },
        { symbol: 'MSFT', name: 'Microsoft' },
        { symbol: 'TSLA', name: 'Tesla' },
        { symbol: 'AMZN', name: 'Amazon' },
        { symbol: 'KO', name: 'Coca Cola' },
        { symbol: 'GOOGL', name: 'Google' },
        { symbol: 'NKE', name: 'Nike' }
    ];

    predefinedSymbols.forEach((stock, index) => {
        $('#watchlist').append(`
            <li class="watchlist-item" data-symbol="${stock.symbol}">
                <span>${stock.name}</span>
                <canvas id="chart-${stock.symbol}" width="50" height="20"></canvas>
                <span id="price-${stock.symbol}"></span>
            </li>
        `);
        fetchStockPrice(stock.symbol);
        if (index === 0) {
            fetchStockData(stock.symbol);
        }
    });

    // Handle click on a watchlist item to fetch and display its stock data
    $('#watchlist').on('click', '.watchlist-item', function() {
        const symbol = $(this).data('symbol');
        fetchStockData(symbol);
    });
});

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
