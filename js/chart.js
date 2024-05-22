function displayChart(symbol, labels, data) {
    $('#loading').hide();
    $('#stockChart').show();
    const ctx = $('#stockChart')[0].getContext('2d'); // Get the 2D drawing context of the canvas

    if (window.stockChart instanceof Chart) {
        window.stockChart.destroy(); // Destroy the previous chart if it exists
    }

    // Create a new chart
    window.stockChart = new Chart(ctx, {
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

function displayMiniChart(symbol, data) {
    const ctx = $(`#chart-${symbol}`)[0].getContext('2d'); // Get the 2D drawing context of the mini chart canvas

    // Create a new mini chart
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
