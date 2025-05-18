// Inside js/profile.js, within the DOMContentLoaded and after user login check:

// Deposit Modal Logic
const depositBtn = document.getElementById('deposit-btn');
const depositModal = document.getElementById('deposit-modal');
const closeDepositModalBtn = document.getElementById('close-deposit-modal');
const depositForm = document.getElementById('deposit-form');
const profileBalanceSpan = document.getElementById('profile-balance'); // Ensure this is defined

if (depositBtn) {
    depositBtn.addEventListener('click', () => {
        if (depositModal) {
            depositModal.style.display = 'flex'; // Or 'block'
            console.log('Profile.js: Deposit button clicked, modal should display flex.');
        } else {
            console.error('Profile.js: depositModal element not found!');
        }
    });
} else {
    console.error('Profile.js: depositBtn element not found!');
}

if (closeDepositModalBtn) {
    closeDepositModalBtn.addEventListener('click', () => {
        if (depositModal) depositModal.style.display = 'none';
    });
} else {
    console.error('Profile.js: closeDepositModalBtn element not found!');
}

if (depositModal) {
    // Close modal if clicking outside the content (on the semi-transparent background)
    depositModal.addEventListener('click', (event) => {
        if (event.target === depositModal) {
            depositModal.style.display = 'none';
        }
    });
}

if (depositForm) {
    depositForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const amountInput = document.getElementById('deposit-amount');
        const amount = parseFloat(amountInput.value);
        const user = auth.getLoggedInUser(); // Get the current user

        if (!user) {
            alert('Error: No user logged in. Cannot deposit.');
            return;
        }

        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid positive amount to deposit.');
            return;
        }

        // Simulate deposit
        user.balance += amount;
        // Also update the user object within the global currentAppState.users array
        const userIndex = currentAppState.users.findIndex(u => u.id === user.id);
        if (userIndex > -1) {
            currentAppState.users[userIndex].balance = user.balance;
        }
        currentAppState.loggedInUser = user; // Ensure the loggedInUser object is the updated one

        // Update UI
        if (profileBalanceSpan) {
            profileBalanceSpan.textContent = `ZAR ${user.balance.toFixed(2)}`;
        } else {
            console.error('Profile.js: profileBalanceSpan element not found for updating balance!');
        }
        
        alert(`Successfully deposited ZAR ${amount.toFixed(2)} (Simulated). Your new balance is ZAR ${user.balance.toFixed(2)}.`);
        amountInput.value = ''; // Clear the input
        if (depositModal) depositModal.style.display = 'none'; // Close the modal
    });
} else {
    console.error('Profile.js: depositForm element not found!');
}