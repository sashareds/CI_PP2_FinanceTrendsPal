$(document).ready(function() {
    const stockSymbols = [
        { symbol: 'AAPL', name: 'Apple' },
        { symbol: 'MSFT', name: 'Microsoft' },
        { symbol: 'TSLA', name: 'Tesla' },
        { symbol: 'AMZN', name: 'Amazon' },
        { symbol: 'KO', name: 'Coca Cola' },
        { symbol: 'GOOGL', name: 'Google' },
        { symbol: 'NKE', name: 'Nike' }
    ];

    // Initialize autocomplete for the stock symbol input field
    $('#symbol').autocomplete({
        source: stockSymbols.map(stock => stock.symbol)
    });

    // Handle form submission to fetch stock data
    $('#stock-form').on('submit', function(event) {
        event.preventDefault();
        const symbol = $('#symbol').val().toUpperCase();
        fetchStockData(symbol);
    });

    // Populate the watchlist and fetch initial stock prices
    stockSymbols.forEach((stock, index) => {
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
