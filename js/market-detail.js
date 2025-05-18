// js/market-detail.js

document.addEventListener('DOMContentLoaded', () => {
    const marketDetailContent = document.getElementById('market-detail-content');
    const loadingMessage = document.getElementById('loading-message');

    let currentMarket = null;
    let priceChartInstance = null;

    // --- Helper Functions ---
    function getMarketIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('id'));
    }

    function formatPrice(priceInCents, includeSymbol = true) {
        if (includeSymbol) {
            return `${priceInCents.toFixed(0)}c`;
        }
        return priceInCents.toFixed(0);
    }

    function formatDate(dateString) {
        if (!dateString) return 'TBD';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    // --- Rendering Functions ---
    function renderMarketSkeleton() {
        const skeletonHTML = `
            <header class="page-header">
                <h1 id="market-question-title">Loading market...</h1>
                <p><span id="market-category-badge" class="category-badge">---</span> <span class="market-meta-item">Ends: <span id="market-end-date">--/--/----</span></span></p>
            </header>
            <div class="market-detail-grid">
                <div class="market-detail-main">
                    <section class="market-chart-section card">
                        <h2>Price History</h2>
                        <div class="chart-container" style="position: relative; height:300px; width:100%;"><canvas id="priceHistoryChart"></canvas></div>
                    </section>
                    <section class="market-info-section card">
                        <h2>Market Information</h2>
                        <div id="market-info-details">
                            <p><strong>Description:</strong> <span id="market-info-description">Loading...</span></p>
                            <p><strong>Resolution Criteria:</strong> <span id="market-info-resolution">Loading...</span></p>
                            <p><strong>Total Volume Traded:</strong> ZAR <span id="market-info-volume">--</span></p>
                        </div>
                    </section>
                </div>
                <aside class="market-detail-sidebar">
                    <section class="market-trade-section card">
                        <h2>Trade</h2>
                        <div class="current-prices-detail">
                            <p>YES: <strong id="current-yes-price" class="price-yes">--c</strong></p>
                            <p>NO: <strong id="current-no-price" class="price-no">--c</strong></p>
                        </div>
                        <form id="trade-form" class="mt-1">
                            <div class="form-group">
                                <label>Your Prediction:</label>
                                <div class="outcome-selector">
                                    <button type="button" class="btn btn-sm btn-yes-outline" data-outcome="YES">Buy YES</button>
                                    <button type="button" class="btn btn-sm btn-no-outline" data-outcome="NO">Buy NO</button>
                                </div>
                                <input type="hidden" id="selected-outcome" name="outcome">
                                <input type="hidden" id="selected-price" name="price">
                            </div>
                            <div class="form-group">
                                <label for="trade-stake">Your Stake (ZAR):</label>
                                <input type="number" id="trade-stake" name="stake" class="form-input" placeholder="e.g., 10" min="1" step="any">
                            </div>
                            <div class="trade-summary">
                                <p>Shares to receive: <span id="shares-to-receive">--</span></p>
                                <p>Avg. Price per Share: <span id="avg-price-per-share">--c</span></p>
                                <p>Potential Payout: <span id="potential-payout">ZAR --.--</span></p>
                                <p class="small-text">(If your prediction is correct, each share pays out 100c)</p>
                            </div>
                            <button type="submit" id="confirm-trade-btn" class="btn btn-primary btn-block mt-1">Place Trade</button>
                            <p id="trade-message" class="form-message" style="display:none;"></p>
                        </form>
                        <p id="login-to-trade-message" style="display:none;" class="text-center mt-1 small-text">Please <a href="login.html" class="link-accent">login</a> or <a href="register.html" class="link-accent">register</a> to trade.</p>
                    </section>
                    <section class="market-order-book-section card">
                        <h2>Order Book</h2>
                        <div class="order-book-tabs">
                            <button class="btn btn-sm btn-outline active" data-tab="bids">Bids (Buy YES)</button>
                            <button class="btn btn-sm btn-outline" data-tab="asks">Asks (Sell YES)</button>
                        </div>
                        <div id="bids-order-book" class="order-book-content active-tab-content">
                            <table class="styled-table order-book-table"><thead_><tr><th>Price (c)</th><th>Quantity</th><th>Total (ZAR)</th></tr></thead_><tbody id="bids-table-body"><tr><td colspan="3">Loading...</td></tr></tbody></table>
                        </div>
                        <div id="asks-order-book" class="order-book-content" style="display:none;">
                            <table class="styled-table order-book-table"><thead><tr><th>Price (c)</th><th>Quantity</th><th>Total (ZAR)</th></tr></thead><tbody id="asks-table-body"><tr><td colspan="3">Loading...</td></tr></tbody></table>
                        </div>
                    </section>
                </aside>
            </div>
        `;
        if (marketDetailContent) marketDetailContent.innerHTML = skeletonHTML;
    }


    function populateMarketDetails(market) {
        document.title = `${market.question.substring(0, 50)}... - CRESSIDA`; // Update page title
        document.getElementById('market-question-title').textContent = market.question;
        document.getElementById('market-category-badge').textContent = market.category;
        document.getElementById('market-end-date').textContent = formatDate(market.endDate);

        document.getElementById('current-yes-price').textContent = formatPrice(market.yesPrice);
        document.getElementById('current-no-price').textContent = formatPrice(market.noPrice);
        // Store raw prices for calculation in trade form
        document.getElementById('current-yes-price').dataset.rawPrice = market.yesPrice;
        document.getElementById('current-no-price').dataset.rawPrice = market.noPrice;


        document.getElementById('market-info-description').textContent = market.description || 'Not available.';
        document.getElementById('market-info-resolution').textContent = market.resolutionCriteria || 'Not available.';
        document.getElementById('market-info-volume').textContent = market.totalVolumeTraded ? market.totalVolumeTraded.toLocaleString() : 'N/A';

        initializePriceChart(market);
        renderOrderBook(market);
        setupTradeInterface(market);
        setupOrderBookTabs();
    }

    function initializePriceChart(market) {
        const ctx = document.getElementById('priceHistoryChart')?.getContext('2d');
        if (!ctx) {
            console.error("Chart canvas not found!");
            return;
        }

        if (priceChartInstance) {
            priceChartInstance.destroy(); // Destroy previous chart instance if exists
        }

        const data = {
            labels: market.historicalData.labels,
            datasets: [
                {
                    label: 'YES Price',
                    data: market.historicalData.yes,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--yes-color').trim() || 'rgb(0, 200, 83)',
                    backgroundColor: 'rgba(0, 200, 83, 0.1)',
                    tension: 0.1,
                    fill: true,
                },
                {
                    label: 'NO Price',
                    data: market.historicalData.no,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--no-color').trim() || 'rgb(255, 61, 0)',
                    backgroundColor: 'rgba(255, 61, 0, 0.1)',
                    tension: 0.1,
                    fill: true,
                }
            ]
        };

        priceChartInstance = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false, // Prices don't always start at 0
                        max: 100, // Prices are 0-100 cents
                        ticks: {
                            callback: function(value) { return value + 'c'; },
                            color: getComputedStyle(document.documentElement).getPropertyValue('--secondary-text-color').trim()
                        },
                        grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--chart-grid-color').trim() }
                    },
                    x: {
                        ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--secondary-text-color').trim() },
                        grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--chart-grid-color').trim() }
                    }
                },
                plugins: {
                    legend: { labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--primary-text-color').trim() } }
                }
            }
        });
    }

    function renderOrderBook(market) {
        const bidsBody = document.getElementById('bids-table-body');
        const asksBody = document.getElementById('asks-table-body');

        if (!bidsBody || !asksBody) return;

        bidsBody.innerHTML = '';
        market.orderBook.bids
            .sort((a, b) => b.price - a.price) // Highest bid price first
            .forEach(bid => {
                const row = bidsBody.insertRow();
                row.innerHTML = `<td>${formatPrice(bid.price)}</td><td>${bid.quantity}</td><td>ZAR ${(bid.price * bid.quantity / 100).toFixed(2)}</td>`;
            });
        if(market.orderBook.bids.length === 0) bidsBody.innerHTML = '<tr><td colspan="3" class="text-center">No bids</td></tr>';

        asksBody.innerHTML = '';
        market.orderBook.asks
            .sort((a, b) => a.price - b.price) // Lowest ask price first
            .forEach(ask => {
                const row = asksBody.insertRow();
                row.innerHTML = `<td>${formatPrice(ask.price)}</td><td>${ask.quantity}</td><td>ZAR ${(ask.price * ask.quantity / 100).toFixed(2)}</td>`;
            });
        if(market.orderBook.asks.length === 0) asksBody.innerHTML = '<tr><td colspan="3" class="text-center">No asks</td></tr>';
    }

    function setupOrderBookTabs() {
        const tabs = document.querySelectorAll('.order-book-tabs .btn');
        const contents = document.querySelectorAll('.order-book-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                contents.forEach(content => content.style.display = 'none');
                const activeContentId = tab.dataset.tab === 'bids' ? 'bids-order-book' : 'asks-order-book';
                document.getElementById(activeContentId).style.display = 'block';
            });
        });
    }


    // --- Trade Interface Logic ---
    function setupTradeInterface(market) {
        const tradeForm = document.getElementById('trade-form');
        const outcomeSelectorBtns = document.querySelectorAll('.outcome-selector .btn');
        const selectedOutcomeInput = document.getElementById('selected-outcome');
        const selectedPriceInput = document.getElementById('selected-price'); // Price for selected outcome
        const tradeStakeInput = document.getElementById('trade-stake');

        const sharesToReceiveSpan = document.getElementById('shares-to-receive');
        const avgPricePerShareSpan = document.getElementById('avg-price-per-share');
        const potentialPayoutSpan = document.getElementById('potential-payout');
        const confirmTradeBtn = document.getElementById('confirm-trade-btn');
        const tradeMessageP = document.getElementById('trade-message');
        const loginToTradeMessageP = document.getElementById('login-to-trade-message');

        let currentSelectedOutcome = null; // 'YES' or 'NO'
        let currentMarketPriceForOutcome = 0; // Price in cents for the selected outcome

        // Check login status for trade button
        if (auth && auth.isUserLoggedIn()) {
            if (loginToTradeMessageP) loginToTradeMessageP.style.display = 'none';
            if (confirmTradeBtn) confirmTradeBtn.disabled = false;
        } else {
            if (loginToTradeMessageP) loginToTradeMessageP.style.display = 'block';
            if (confirmTradeBtn) confirmTradeBtn.disabled = true;
        }


        outcomeSelectorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                outcomeSelectorBtns.forEach(b => b.classList.remove('selected-outcome'));
                btn.classList.add('selected-outcome');
                currentSelectedOutcome = btn.dataset.outcome;
                selectedOutcomeInput.value = currentSelectedOutcome;

                // If buying YES, price is current YES price (cost to acquire 1 YES share)
                // If buying NO, price is current NO price (cost to acquire 1 NO share)
                currentMarketPriceForOutcome = (currentSelectedOutcome === 'YES') ? market.yesPrice : market.noPrice;
                selectedPriceInput.value = currentMarketPriceForOutcome; // Store this for submission

                updateTradeSummary();
            });
        });

        if (tradeStakeInput) {
            tradeStakeInput.addEventListener('input', updateTradeSummary);
        }

        function updateTradeSummary() {
            if (!currentSelectedOutcome || !tradeStakeInput || !selectedPriceInput) return;

            const stakeZAR = parseFloat(tradeStakeInput.value);
            const pricePerShareCents = parseFloat(selectedPriceInput.value); // This is the price for the chosen outcome

            if (isNaN(stakeZAR) || stakeZAR <= 0 || isNaN(pricePerShareCents) || pricePerShareCents <= 0) {
                sharesToReceiveSpan.textContent = '--';
                avgPricePerShareSpan.textContent = '--c';
                potentialPayoutSpan.textContent = 'ZAR --.--';
                return;
            }

            // Stake is in ZAR, pricePerShare is in Cents.
            // Number of shares = (Stake in Cents) / (Price per Share in Cents)
            const stakeCents = stakeZAR * 100;
            const shares = stakeCents / pricePerShareCents;

            sharesToReceiveSpan.textContent = shares.toFixed(2);
            avgPricePerShareSpan.textContent = formatPrice(pricePerShareCents);
            potentialPayoutSpan.textContent = `ZAR ${(shares * 100 / 100).toFixed(2)}`; // Each share pays 100c (1 ZAR)
        }

        if (tradeForm) {
            tradeForm.addEventListener('submit', (event) => {
                event.preventDefault();
                if (!auth || !auth.isUserLoggedIn()) {
                    displayTradeMessage('You must be logged in to trade.', 'error');
                    return;
                }
                if (!currentSelectedOutcome) {
                    displayTradeMessage('Please select an outcome (YES or NO).', 'error');
                    return;
                }

                const stakeZAR = parseFloat(tradeStakeInput.value);
                const pricePerShareCents = parseFloat(selectedPriceInput.value);
                const loggedInUser = auth.getLoggedInUser();

                if (isNaN(stakeZAR) || stakeZAR <= 0) {
                    displayTradeMessage('Please enter a valid stake amount.', 'error');
                    return;
                }
                if (stakeZAR > loggedInUser.balance) {
                    displayTradeMessage('Insufficient balance for this stake.', 'error');
                    return;
                }

                const stakeCents = stakeZAR * 100;
                const sharesToBuy = stakeCents / pricePerShareCents;

                // --- Simulate Trade Impact ---
                // 1. Update User Balance & Portfolio
                loggedInUser.balance -= stakeZAR;
                const existingHoldingIndex = loggedInUser.portfolio.findIndex(
                    item => item.marketId === market.id && item.outcome === currentSelectedOutcome
                );
                if (existingHoldingIndex > -1) {
                    const existing = loggedInUser.portfolio[existingHoldingIndex];
                    const totalQuantity = existing.quantity + sharesToBuy;
                    existing.avgPricePaid = ((existing.avgPricePaid * existing.quantity) + (pricePerShareCents * sharesToBuy)) / totalQuantity;
                    existing.quantity = totalQuantity;
                } else {
                    loggedInUser.portfolio.push({
                        marketId: market.id,
                        marketQuestion: market.question,
                        outcome: currentSelectedOutcome,
                        quantity: sharesToBuy,
                        avgPricePaid: pricePerShareCents
                    });
                }
                // Update global state if necessary (auth.js might need a function to update user in currentAppState.users)
                // For now, modifying currentAppState.loggedInUser directly.

                // 2. Simulate Market Price Change (very basic simulation)
                // This is a gross oversimplification. Real markets match orders.
                // Here, let's assume a large buy pushes the price up slightly for that outcome.
                const priceImpact = 0.5; // Affect price by 0.5c per 10 shares traded on that outcome
                const impactDirection = (currentSelectedOutcome === 'YES') ? 1 : -1; // If YES, YES price up, NO price down. If NO, NO price up, YES price down.

                if (currentSelectedOutcome === 'YES') {
                    market.yesPrice = Math.min(99, market.yesPrice + (sharesToBuy / 10) * priceImpact);
                    market.noPrice = 100 - market.yesPrice;
                } else { // Buying NO
                    market.noPrice = Math.min(99, market.noPrice + (sharesToBuy / 10) * priceImpact);
                    market.yesPrice = 100 - market.noPrice;
                }
                // Ensure prices don't go below 1c
                market.yesPrice = Math.max(1, market.yesPrice);
                market.noPrice = Math.max(1, market.noPrice);


                // 3. Simulate Order Book Change (very basic)
                // Find a matching order and reduce its quantity, or assume it's a market order that gets filled.
                // For simplicity, we won't deeply simulate order book matching here. We'll just reflect the new market prices.

                // 4. Add to Historical Data (and update chart)
                const newTimeLabel = `T${market.historicalData.labels.length + 1}`; // Or a real timestamp
                market.historicalData.labels.push(newTimeLabel);
                market.historicalData.yes.push(market.yesPrice);
                market.historicalData.no.push(market.noPrice);


                // 5. Update Volume
                market.totalVolumeTraded += stakeZAR;


                // --- Refresh UI ---
                populateMarketDetails(market); // Re-render details, chart, order book with new market state
                displayTradeMessage(`Successfully bought ${sharesToBuy.toFixed(2)} shares of ${currentSelectedOutcome} at ~${formatPrice(pricePerShareCents)}.`, 'success');
                tradeStakeInput.value = ''; // Clear stake
                // Update navbar balance if it's displayed there (future enhancement)


                // Update the market object in the global currentAppState.markets
                const marketIndex = currentAppState.markets.findIndex(m => m.id === market.id);
                if (marketIndex > -1) {
                    currentAppState.markets[marketIndex] = market;
                }
                 // Update user in currentAppState.users (important if navigating away and coming back)
                const userIndex = currentAppState.users.findIndex(u => u.id === loggedInUser.id);
                if(userIndex > -1) {
                    currentAppState.users[userIndex] = loggedInUser;
                }


                // Reset selected outcome after trade for clarity
                outcomeSelectorBtns.forEach(b => b.classList.remove('selected-outcome'));
                selectedOutcomeInput.value = '';
                selectedPriceInput.value = '';
                currentSelectedOutcome = null;
                updateTradeSummary(); // Clear summary fields
            });
        }

        function displayTradeMessage(message, type = 'error') {
            if (tradeMessageP) {
                tradeMessageP.textContent = message;
                tradeMessageP.className = `form-message ${type}`;
                tradeMessageP.style.display = 'block';
                setTimeout(() => { tradeMessageP.style.display = 'none'; }, 5000); // Hide after 5s
            }
        }
    }


    // --- Main Initialization ---
    function initializePage() {
        renderMarketSkeleton(); // Show skeleton first
        const marketId = getMarketIdFromUrl();

        if (!marketId) {
            if (marketDetailContent) marketDetailContent.innerHTML = '<h1 class="text-center">Market ID not provided.</h1>';
            if (loadingMessage) loadingMessage.style.display = 'none';
            return;
        }

        // Find the market in the global state (currentAppState from data.js)
        currentMarket = currentAppState.markets.find(m => m.id === marketId);

        if (!currentMarket) {
            if (marketDetailContent) marketDetailContent.innerHTML = `<h1 class="text-center">Market with ID ${marketId} not found.</h1>`;
            if (loadingMessage) loadingMessage.style.display = 'none';
            return;
        }

        if (loadingMessage) loadingMessage.style.display = 'none';
        populateMarketDetails(currentMarket);
    }

    // Call initialization
    if (currentAppState && currentAppState.markets) { // Ensure data.js has loaded currentAppState
        initializePage();
    } else {
        // Handle case where data.js might not have loaded currentAppState yet (should not happen with script order)
        console.error("Market Detail: currentAppState not ready. Retrying in a bit.");
        setTimeout(() => {
            if (currentAppState && currentAppState.markets) initializePage();
            else if (marketDetailContent) marketDetailContent.innerHTML = '<h1 class="text-center">Error loading market data. Please refresh.</h1>';
        }, 500);
    }
});