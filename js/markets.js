// js/markets.js

document.addEventListener('DOMContentLoaded', () => {
    const marketListingSection = document.getElementById('market-listing-section');
    const searchBar = document.getElementById('search-bar');
    const categoryFilterButtons = document.querySelectorAll('.category-filters .filter-btn');
    const noMarketsMessage = document.getElementById('no-markets-message');

    let currentMarkets = []; // To store the markets being displayed

    function formatPrice(price) {
        return `R ${price.toFixed(0)}`; // Display as cents, e.g., 60c
    }

    function renderMarketCard(market) {
        // The 'Details' button will link to market-detail.html with the market's ID
        // e.g., market-detail.html?id=1
        const detailUrl = `market-detail.html?id=${market.id}`;

       

        return `
            <div class="card market-card" data-market-id="${market.id}" data-category="${market.category.toLowerCase()}">
                
                <div class="market-card-content" style="padding:1rem;">
                    <h3>${market.question}</h3>
                    <span class="category-badge">${market.category}</span>
                    <div class="market-prices">
                        <span class="price-label">YES: <strong class="price-yes">${formatPrice(market.yesPrice)}</strong></span>
                        <span class="price-label">NO: <strong class="price-no">${formatPrice(market.noPrice)}</strong></span>
                    </div>
                     <p class="market-volume-liquidity small-text">
                        Volume: ZAR ${market.totalVolumeTraded ? market.totalVolumeTraded.toLocaleString() : 'N/A'}
                        | Ends: ${market.endDate ? new Date(market.endDate).toLocaleDateString() : 'TBD'}
                    </p>
                    <a href="${detailUrl}" class="btn btn-primary btn-block mt-1">View & Trade</a>
                </div>
            </div>
        `;
    }

    function displayMarkets(marketsToDisplay) {
        if (!marketListingSection) {
            console.error('Market listing section not found!');
            return;
        }

        if (!marketsToDisplay || marketsToDisplay.length === 0) {
            marketListingSection.innerHTML = ''; // Clear previous markets
            if (noMarketsMessage) noMarketsMessage.style.display = 'block';
            return;
        }

        if (noMarketsMessage) noMarketsMessage.style.display = 'none';
        marketListingSection.innerHTML = marketsToDisplay.map(renderMarketCard).join('');
    }

    function filterAndSearchMarkets() {
        const searchTerm = searchBar ? searchBar.value.toLowerCase() : '';
        const activeButton = document.querySelector('.category-filters .filter-btn.active');
        const activeCategory = activeButton ? activeButton.dataset.category.toLowerCase() : 'all';

        let filteredMarkets = currentAppState.markets.filter(market => {
            const matchesCategory = activeCategory === 'all' || market.category.toLowerCase() === activeCategory;
            const matchesSearch = market.question.toLowerCase().includes(searchTerm) ||
                                  market.category.toLowerCase().includes(searchTerm) ||
                                  (market.description && market.description.toLowerCase().includes(searchTerm));
            return matchesCategory && matchesSearch;
        });

        displayMarkets(filteredMarkets);
    }

    // --- Event Listeners ---
    if (searchBar) {
        searchBar.addEventListener('input', filterAndSearchMarkets);
    }

    if (categoryFilterButtons) {
        categoryFilterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                categoryFilterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to the clicked button
                button.classList.add('active');
                filterAndSearchMarkets();
            });
        });
    }

    // --- Initial Load ---
    if (currentAppState && currentAppState.markets) {
        currentMarkets = [...currentAppState.markets]; // Initialize with all markets
        displayMarkets(currentMarkets); // Display all markets initially
    } else {
        console.error("Markets data not found in currentAppState.");
        if (marketListingSection) marketListingSection.innerHTML = '<p class="text-center">Could not load market data.</p>';
    }
});