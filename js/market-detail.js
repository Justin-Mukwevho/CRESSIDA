// js/market-detail.js

document.addEventListener('DOMContentLoaded', () => {
    const marketDetailContent = document.getElementById('market-detail-content');
    const initialLoadingMessage = document.getElementById('loading-message'); // Get the initial static loading message

    let currentMarket = null;
    let priceChartInstance = null;

    // --- Helper Functions ---
    function getMarketIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('id'));
    }

    function formatPrice(priceInCents, includeSymbol = true) {
        if (typeof priceInCents !== 'number' || isNaN(priceInCents)) {
            return includeSymbol ? '--c' : '--';
        }
        return includeSymbol ? `${priceInCents.toFixed(0)}c` : priceInCents.toFixed(0);
    }

    function formatDate(dateString) {
        if (!dateString) return 'TBD';
        try {
            return new Date(dateString).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', /*hour: '2-digit', minute: '2-digit'*/
            });
        } catch (e) {
            return 'Invalid Date';
        }
    }

    // --- Rendering Functions ---
    function renderMarketSkeleton() {
        // This function now builds the entire inner structure for #market-detail-content
        const skeletonHTML = `
            <header class="page-header">
                <h1 id="market-question-title">Loading market...</h1>
                <p>
                    <span id="market-category-badge" class="category-badge">---</span>
                    <span class="market-meta-item">Ends: <span id="market-end-date">--/--/----</span></span>
                </p>
            </header>

            <div class="market-detail-grid">
                <div class="market-detail-main">
                    <section class="market-chart-section card">
                        <h2>Price History</h2>
                        <div class="chart-container" style="position: relative; height:280px; width:100%;">
                            <canvas id="priceHistoryChart"></canvas>
                        </div>
                    </section>

                    <section class="market-info-section card">
                        <h2>Market Information</h2>
                        <div id="market-info-details">
                            <p><strong>Description:</strong> <span id="market-info-description">Loading...</span></p>
                            <p><strong>Resolution Criteria:</strong> <span id="market-info-resolution">Loading...</span></p>
                            <p><strong>Total Volume Traded:</strong> ZAR <span id="market-info-volume">--</span></p>
                        </div>
                    </section>

                    <section class="market-comments-section card">
                        <h2>Comments (<span id="comment-count">0</span>)</h2>
                        <div id="comments-list">
                            <p class="no-comments-message" style="text-align:center; padding:1rem 0;">Loading comments...</p>
                        </div>
                        <div class="add-comment-form-container mt-1">
                            <h4>Add Your Comment (Simulated)</h4>
                            <textarea id="new-comment-text" class="form-input" rows="3" placeholder="Share your insights... (Comments are hardcoded for this prototype)" aria-label="Add your comment"></textarea>
                            <button id="submit-comment-btn" class="btn btn-primary btn-sm mt-1" disabled>Submit Comment (Disabled)</button>
                            <p class="small-text"><em>Comment submission is not functional in this static prototype.</em></p>
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
                        <p id="login-to-trade-message" style="display:none;" class="text-center mt-1 small-text">
                            Please <a href="login.html" class="link-accent">login</a> or <a href="register.html" class="link-accent">register</a> to trade.
                        </p>
                    </section>

                    <section class="market-order-book-section card">
                        <h2>Order Book</h2>
                        <div class="order-book-tabs">
                            <button class="btn btn-sm btn-outline active" data-tab="bids">Bids (Buy YES)</button>
                            <button class="btn btn-sm btn-outline" data-tab="asks">Asks (Sell YES)</button>
                        </div>
                        <div id="bids-order-book" class="order-book-content active-tab-content">
                            <table class="styled-table order-book-table">
                                <thead><tr><th>Price (c)</th><th>Quantity</th><th>Total (ZAR)</th></tr></thead>
                                <tbody id="bids-table-body"><tr><td colspan="3" class="text-center">Loading...</td></tr></tbody>
                            </table>
                        </div>
                        <div id="asks-order-book" class="order-book-content" style="display:none;">
                            <table class="styled-table order-book-table">
                                <thead><tr><th>Price (c)</th><th>Quantity</th><th>Total (ZAR)</th></tr></thead>
                                <tbody id="asks-table-body"><tr><td colspan="3" class="text-center">Loading...</td></tr></tbody>
                            </table>
                        </div>
                    </section>
                </aside>
            </div>
        `;
        if (marketDetailContent) {
            marketDetailContent.innerHTML = skeletonHTML;
        } else {
            console.error("Market detail content container not found!");
        }
    }

    function populateMarketDetails(market) {
        if (!market) return;

        document.title = `${market.question ? market.question.substring(0, 50) : 'Market'}... - CRESSIDA`;
        
        // Safely update elements
        const safelySetText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
            else console.warn(`Element with ID '${id}' not found for text update.`);
        };
        
        const safelySetData = (id, dataKey, value) => {
             const el = document.getElementById(id);
            if (el) el.dataset[dataKey] = value;
        };

        safelySetText('market-question-title', market.question || 'N/A');
        safelySetText('market-category-badge', market.category || 'N/A');
        safelySetText('market-end-date', formatDate(market.endDate));

        safelySetText('current-yes-price', formatPrice(market.yesPrice));
        safelySetData('current-yes-price', 'rawPrice', market.yesPrice);
        safelySetText('current-no-price', formatPrice(market.noPrice));
        safelySetData('current-no-price', 'rawPrice', market.noPrice);

        safelySetText('market-info-description', market.description || 'Not available.');
        safelySetText('market-info-resolution', market.resolutionCriteria || 'Not available.');
        safelySetText('market-info-volume', market.totalVolumeTraded ? market.totalVolumeTraded.toLocaleString() : 'N/A');

        initializePriceChart(market);
        renderOrderBook(market);
        renderComments(market);
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
            priceChartInstance.destroy();
        }
        
        if (!market || !market.historicalData || !market.historicalData.labels || !market.historicalData.yes || !market.historicalData.no) {
            console.error("Market historical data is incomplete for chart initialization.");
            // Optionally display a message on the chart canvas area
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.textAlign = 'center';
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--secondary-text-color').trim();
            ctx.fillText("Price history data not available.", ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }


        const yesColor = getComputedStyle(document.documentElement).getPropertyValue('--yes-color').trim() || 'rgb(0, 200, 83)';
        const noColor = getComputedStyle(document.documentElement).getPropertyValue('--no-color').trim() || 'rgb(255, 61, 0)';
        const secondaryTextColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-text-color').trim();
        const chartGridColor = getComputedStyle(document.documentElement).getPropertyValue('--chart-grid-color').trim();
        const primaryTextColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-text-color').trim();

        const data = {
            labels: market.historicalData.labels,
            datasets: [
                {
                    label: 'YES Price',
                    data: market.historicalData.yes,
                    borderColor: yesColor,
                    backgroundColor: yesColor.replace('rgb', 'rgba').replace(')', ', 0.1)'), // Make transparent
                    tension: 0.1,
                    fill: true,
                },
                {
                    label: 'NO Price',
                    data: market.historicalData.no,
                    borderColor: noColor,
                    backgroundColor: noColor.replace('rgb', 'rgba').replace(')', ', 0.1)'), // Make transparent
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
                        beginAtZero: false,
                        max: 100,
                        ticks: { callback: value => value + 'c', color: secondaryTextColor },
                        grid: { color: chartGridColor }
                    },
                    x: {
                        ticks: { color: secondaryTextColor },
                        grid: { color: chartGridColor }
                    }
                },
                plugins: {
                    legend: { labels: { color: primaryTextColor } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y.toFixed(0) + 'c';
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
    
    function updatePriceChart() {
        if (priceChartInstance && currentMarket && currentMarket.historicalData) {
            priceChartInstance.data.labels = currentMarket.historicalData.labels;
            priceChartInstance.data.datasets[0].data = currentMarket.historicalData.yes; // YES prices
            priceChartInstance.data.datasets[1].data = currentMarket.historicalData.no;  // NO prices
            priceChartInstance.update();
        }
    }


    function renderOrderBook(market) {
        const bidsBody = document.getElementById('bids-table-body');
        const asksBody = document.getElementById('asks-table-body');

        if (!bidsBody || !asksBody || !market || !market.orderBook) {
            console.error("Order book elements or data not found.");
            if (bidsBody) bidsBody.innerHTML = '<tr><td colspan="3" class="text-center">Order book data unavailable.</td></tr>';
            if (asksBody) asksBody.innerHTML = '<tr><td colspan="3" class="text-center">Order book data unavailable.</td></tr>';
            return;
        }
        
        bidsBody.innerHTML = ''; // Clear previous
        if (market.orderBook.bids && market.orderBook.bids.length > 0) {
            market.orderBook.bids
                .sort((a, b) => b.price - a.price)
                .forEach(bid => {
                    const row = bidsBody.insertRow();
                    row.innerHTML = `<td>${formatPrice(bid.price)}</td><td>${bid.quantity}</td><td>ZAR ${(bid.price * bid.quantity / 100).toFixed(2)}</td>`;
                });
        } else {
            bidsBody.innerHTML = '<tr><td colspan="3" class="text-center">No bids</td></tr>';
        }

        asksBody.innerHTML = ''; // Clear previous
        if (market.orderBook.asks && market.orderBook.asks.length > 0) {
            market.orderBook.asks
                .sort((a, b) => a.price - b.price)
                .forEach(ask => {
                    const row = asksBody.insertRow();
                    row.innerHTML = `<td>${formatPrice(ask.price)}</td><td>${ask.quantity}</td><td>ZAR ${(ask.price * ask.quantity / 100).toFixed(2)}</td>`;
                });
        } else {
            asksBody.innerHTML = '<tr><td colspan="3" class="text-center">No asks</td></tr>';
        }
    }

    function renderComments(market) {
        const commentsListDiv = document.getElementById('comments-list');
        const commentCountSpan = document.getElementById('comment-count');

        if (!commentsListDiv || !commentCountSpan || !market) {
            console.error("Comment display elements or market data not found.");
            if (commentsListDiv) commentsListDiv.innerHTML = '<p class="no-comments-message" style="text-align:center; padding:1rem 0;">Comments unavailable.</p>';
            if (commentCountSpan) commentCountSpan.textContent = '0';
            return;
        }

        commentsListDiv.innerHTML = ''; // Clear previous

        if (market.comments && market.comments.length > 0) {
            commentCountSpan.textContent = market.comments.length;
            const ul = document.createElement('ul');
            ul.className = 'comments-ul';

            market.comments.forEach(comment => {
                const li = document.createElement('li');
                li.className = 'comment-item';
                li.innerHTML = `
                    <div class="comment-header">
                        <strong class="comment-username">${comment.username || 'Anonymous'}</strong>
                        <span class="comment-timestamp">${formatDate(comment.timestamp)}</span>
                    </div>
                    <p class="comment-text">${comment.text || ''}</p>
                `;
                ul.appendChild(li);
            });
            commentsListDiv.appendChild(ul);
        } else {
            commentCountSpan.textContent = '0';
            commentsListDiv.innerHTML = '<p class="no-comments-message" style="text-align:center; padding:1rem 0;">No comments yet for this market.</p>';
        }
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
                const activeContentEl = document.getElementById(activeContentId);
                if (activeContentEl) activeContentEl.style.display = 'block';
            });
        });
    }

    function setupTradeInterface(market) {
        if (!market) return;

        const tradeForm = document.getElementById('trade-form');
        const outcomeSelectorBtns = document.querySelectorAll('.outcome-selector .btn');
        const selectedOutcomeInput = document.getElementById('selected-outcome');
        const selectedPriceInput = document.getElementById('selected-price');
        const tradeStakeInput = document.getElementById('trade-stake');
        const sharesToReceiveSpan = document.getElementById('shares-to-receive');
        const avgPricePerShareSpan = document.getElementById('avg-price-per-share');
        const potentialPayoutSpan = document.getElementById('potential-payout');
        const confirmTradeBtn = document.getElementById('confirm-trade-btn');
        const tradeMessageP = document.getElementById('trade-message');
        const loginToTradeMessageP = document.getElementById('login-to-trade-message');

        let currentSelectedOutcome = null;
        let currentMarketPriceForOutcome = 0;

        if (!tradeForm || !outcomeSelectorBtns.length || !selectedOutcomeInput || !selectedPriceInput || !tradeStakeInput ||
            !sharesToReceiveSpan || !avgPricePerShareSpan || !potentialPayoutSpan || !confirmTradeBtn || !tradeMessageP || !loginToTradeMessageP) {
            console.error("One or more trade interface elements are missing from the DOM.");
            return;
        }
        
        const updateTradeButtonStatus = () => {
            if (auth && auth.isUserLoggedIn()) {
                loginToTradeMessageP.style.display = 'none';
                confirmTradeBtn.disabled = false;
            } else {
                loginToTradeMessageP.style.display = 'block';
                confirmTradeBtn.disabled = true;
            }
        };
        updateTradeButtonStatus(); // Initial check
        window.addEventListener('authChange', updateTradeButtonStatus); // Listen for custom event if auth.js dispatches it on login/logout


        outcomeSelectorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                outcomeSelectorBtns.forEach(b => b.classList.remove('selected-outcome'));
                btn.classList.add('selected-outcome');
                currentSelectedOutcome = btn.dataset.outcome;
                selectedOutcomeInput.value = currentSelectedOutcome;
                currentMarketPriceForOutcome = (currentSelectedOutcome === 'YES') ? currentMarket.yesPrice : currentMarket.noPrice;
                selectedPriceInput.value = currentMarketPriceForOutcome;
                updateTradeSummary();
            });
        });

        tradeStakeInput.addEventListener('input', updateTradeSummary);

        function updateTradeSummary() {
            if (!currentSelectedOutcome) { // Don't update if no outcome selected yet
                sharesToReceiveSpan.textContent = '--';
                avgPricePerShareSpan.textContent = '--c';
                potentialPayoutSpan.textContent = 'ZAR --.--';
                return;
            }
            
            const stakeZAR = parseFloat(tradeStakeInput.value);
            const pricePerShareCents = parseFloat(selectedPriceInput.value);

            if (isNaN(stakeZAR) || stakeZAR <= 0 || isNaN(pricePerShareCents) || pricePerShareCents <= 0) {
                sharesToReceiveSpan.textContent = '--';
                avgPricePerShareSpan.textContent = (pricePerShareCents > 0) ? formatPrice(pricePerShareCents) : '--c';
                potentialPayoutSpan.textContent = 'ZAR --.--';
                return;
            }
            const stakeCents = stakeZAR * 100;
            const shares = stakeCents / pricePerShareCents;
            sharesToReceiveSpan.textContent = shares.toFixed(2);
            avgPricePerShareSpan.textContent = formatPrice(pricePerShareCents);
            potentialPayoutSpan.textContent = `ZAR ${(shares * 1).toFixed(2)}`; // Each share pays out 100c = 1 ZAR
        }

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
                displayTradeMessage(`Insufficient balance. You have ZAR ${loggedInUser.balance.toFixed(2)}.`, 'error');
                return;
            }

            const stakeCents = stakeZAR * 100;
            const sharesToBuy = stakeCents / pricePerShareCents;

            // --- Simulate Trade Impact ---
            loggedInUser.balance -= stakeZAR;
            const existingHoldingIndex = loggedInUser.portfolio.findIndex(
                item => item.marketId === currentMarket.id && item.outcome === currentSelectedOutcome
            );
            if (existingHoldingIndex > -1) {
                const existing = loggedInUser.portfolio[existingHoldingIndex];
                const totalQuantity = existing.quantity + sharesToBuy;
                existing.avgPricePaid = Math.round(((existing.avgPricePaid * existing.quantity) + (pricePerShareCents * sharesToBuy)) / totalQuantity);
                existing.quantity = totalQuantity;
            } else {
                loggedInUser.portfolio.push({
                    marketId: currentMarket.id,
                    marketQuestion: currentMarket.question,
                    outcome: currentSelectedOutcome,
                    quantity: sharesToBuy,
                    avgPricePaid: Math.round(pricePerShareCents)
                });
            }

            const priceImpact = 0.5;
            if (currentSelectedOutcome === 'YES') {
                currentMarket.yesPrice = Math.min(99, currentMarket.yesPrice + (sharesToBuy / 10) * priceImpact);
                currentMarket.noPrice = 100 - currentMarket.yesPrice;
            } else {
                currentMarket.noPrice = Math.min(99, currentMarket.noPrice + (sharesToBuy / 10) * priceImpact);
                currentMarket.yesPrice = 100 - currentMarket.noPrice;
            }
            currentMarket.yesPrice = Math.max(1, Math.round(currentMarket.yesPrice));
            currentMarket.noPrice = Math.max(1, Math.round(currentMarket.noPrice));
            if (currentMarket.yesPrice + currentMarket.noPrice !== 100) { // Ensure sum is 100
                 if (currentSelectedOutcome === 'YES') currentMarket.noPrice = 100 - currentMarket.yesPrice;
                 else currentMarket.yesPrice = 100 - currentMarket.noPrice;
            }


            const newTimeLabel = `T${currentMarket.historicalData.labels.length + 1}`;
            currentMarket.historicalData.labels.push(newTimeLabel);
            currentMarket.historicalData.yes.push(currentMarket.yesPrice);
            currentMarket.historicalData.no.push(currentMarket.noPrice);
            currentMarket.totalVolumeTraded = (currentMarket.totalVolumeTraded || 0) + stakeZAR;

            // --- Refresh UI ---
            document.getElementById('current-yes-price').textContent = formatPrice(currentMarket.yesPrice);
            document.getElementById('current-no-price').textContent = formatPrice(currentMarket.noPrice);
            document.getElementById('current-yes-price').dataset.rawPrice = currentMarket.yesPrice;
            document.getElementById('current-no-price').dataset.rawPrice = currentMarket.noPrice;
            document.getElementById('market-info-volume').textContent = currentMarket.totalVolumeTraded.toLocaleString();
            
            updatePriceChart(); // Update chart with new data
            // renderOrderBook(currentMarket); // Potentially update order book if simulating matching

            displayTradeMessage(`Successfully bought ${sharesToBuy.toFixed(2)} shares of ${currentSelectedOutcome} at ~${formatPrice(pricePerShareCents)}.`, 'success');
            tradeStakeInput.value = '';

            const marketIndex = currentAppState.markets.findIndex(m => m.id === currentMarket.id);
            if (marketIndex > -1) currentAppState.markets[marketIndex] = { ...currentMarket }; // Update with a copy
            
            const userIndex = currentAppState.users.findIndex(u => u.id === loggedInUser.id);
            if (userIndex > -1) currentAppState.users[userIndex] = { ...loggedInUser };
            currentAppState.loggedInUser = { ...loggedInUser };


            // Reset selected outcome
            outcomeSelectorBtns.forEach(b => b.classList.remove('selected-outcome'));
            selectedOutcomeInput.value = '';
            selectedPriceInput.value = '';
            currentSelectedOutcome = null;
            updateTradeSummary(); // Clear summary fields
            
            // Dispatch a custom event that balance might have changed (for profile page or other components)
            window.dispatchEvent(new CustomEvent('balanceChanged', { detail: { newBalance: loggedInUser.balance }}));
            window.dispatchEvent(new CustomEvent('portfolioChanged'));
        });

        function displayTradeMessage(message, type = 'error') {
            if (tradeMessageP) {
                tradeMessageP.textContent = message;
                tradeMessageP.className = `form-message ${type}`; // Ensure correct class application
                tradeMessageP.style.display = 'block';
                setTimeout(() => { tradeMessageP.style.display = 'none'; }, 4000);
            }
        }
    }

    // --- Main Initialization ---
    function initializePage() {
        if (initialLoadingMessage) initialLoadingMessage.style.display = 'none'; // Hide static loading message
        renderMarketSkeleton(); // Build the page structure

        const marketId = getMarketIdFromUrl();
        if (!marketId) {
            if (marketDetailContent) marketDetailContent.innerHTML = '<h1 class="text-center">Market ID not provided.</h1>';
            return;
        }

        // Find the market from a fresh copy to avoid modifying the original data.js constant
        // currentAppState.markets is already a deep copy, so this is fine.
        const marketFromState = currentAppState.markets.find(m => m.id === marketId);
        if (!marketFromState) {
            if (marketDetailContent) marketDetailContent.innerHTML = `<h1 class="text-center">Market with ID ${marketId} not found.</h1>`;
            return;
        }
        // Work with a copy of the market for this page instance to avoid direct state mutation before confirmation
        currentMarket = JSON.parse(JSON.stringify(marketFromState)); 

        populateMarketDetails(currentMarket);
    }

    if (typeof currentAppState !== 'undefined' && currentAppState.markets) {
        initializePage();
    } else {
        console.error("Market Detail: currentAppState or currentAppState.markets not ready.");
        if (marketDetailContent && initialLoadingMessage) {
            initialLoadingMessage.style.display = 'none';
            marketDetailContent.innerHTML = '<h1 class="text-center">Error loading market data. Please ensure data.js is loaded correctly and try refreshing.</h1>';
        }
    }
});