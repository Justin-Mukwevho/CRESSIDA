// js/leaderboard.js

document.addEventListener('DOMContentLoaded', () => {
    const leaderboardBody = document.getElementById('leaderboard-body');

    function displayLeaderboard() {
        if (!leaderboardBody) {
            console.error('Leaderboard table body not found!');
            return;
        }
        if (!leaderboardData || leaderboardData.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="4" class="text-center">Leaderboard data is not available.</td></tr>';
            return;
        }

        // Sort leaderboard data by rank if it's not already sorted
        // Or, if rank is not present, sort by profit descending
        const sortedLeaderboard = leaderboardData.sort((a, b) => {
            if (a.rank && b.rank) {
                return a.rank - b.rank;
            }
            return b.profit - a.profit; // Fallback to sort by profit if no rank
        });

        leaderboardBody.innerHTML = ''; // Clear existing rows

        sortedLeaderboard.forEach((player, index) => {
            const row = leaderboardBody.insertRow();

            const rankCell = row.insertCell();
            const usernameCell = row.insertCell();
            const profitCell = row.insertCell();
            const volumeCell = row.insertCell();
            // Optional: const winRateCell = row.insertCell();

            rankCell.textContent = player.rank || (index + 1); // Use provided rank or generate one
            usernameCell.textContent = player.username;
            profitCell.textContent = `ZAR ${player.profit.toFixed(2)}`;
            profitCell.style.color = player.profit >= 0 ? 'var(--yes-color)' : 'var(--no-color)';
            volumeCell.textContent = `ZAR ${player.volume.toFixed(2)}`;

            // if (player.winRate !== undefined) {
            //     winRateCell.textContent = `${player.winRate.toFixed(1)}%`;
            // } else {
            //     winRateCell.textContent = 'N/A';
            // }
        });
    }

    // Initial display
    displayLeaderboard();
});