// js/auth.js

// --- Variable Declarations ---
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const userActionBtn = document.getElementById('user-action-btn'); // In navbar
const profileUsernameSpan = document.getElementById('profile-username'); // On profile page
const userProfileDataSection = document.getElementById('user-profile-data'); // On profile page
const authRequiredMessageSection = document.getElementById('auth-required-message'); // On profile page

// --- Cookie Helper Functions ---
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax"; // Added SameSite
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999; path=/; SameSite=Lax'; // Added SameSite
}

// --- UI Update Functions ---
function updateNavbarForLoggedInUser(username) {
    if (userActionBtn) {
        userActionBtn.textContent = 'Logout';
        userActionBtn.href = '#'; // To prevent navigation, logout handled by event listener
        userActionBtn.id = 'logout-btn'; // Change ID to attach logout listener

        // Add Profile link if not already there
        const navbarNav = document.querySelector('.navbar-nav');
        if (navbarNav && !document.getElementById('profile-nav-link')) {
            const profileLink = document.createElement('a');
            profileLink.href = 'profile.html';
            profileLink.classList.add('nav-link');
            profileLink.id = 'profile-nav-link';
            profileLink.textContent = 'My Profile';
            navbarNav.appendChild(profileLink); // Add it to the end or specific position
        }

        // Add event listener for the new logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }
}

function updateNavbarForLoggedOutUser() {
    if (userActionBtn && userActionBtn.id !== 'user-action-btn') { // Check if it was changed to logout-btn
         // Revert to login button if it was logout
        const newLoginBtn = document.createElement('a');
        newLoginBtn.href = 'login.html';
        newLoginBtn.id = 'user-action-btn';
        newLoginBtn.classList.add('btn', 'btn-primary');
        newLoginBtn.textContent = 'Login';
        userActionBtn.parentNode.replaceChild(newLoginBtn, userActionBtn);
    } else if (userActionBtn) { // If it's still the original login button
        userActionBtn.textContent = 'Login';
        userActionBtn.href = 'login.html';
        userActionBtn.id = 'user-action-btn'; // Ensure ID is correct
    }


    const profileLink = document.getElementById('profile-nav-link');
    if (profileLink) {
        profileLink.remove();
    }
}

function displayMessage(formElement, message, type = 'error') {
    const messageElementId = formElement.id.replace('-form', '-message');
    const messageDiv = document.getElementById(messageElementId);
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `form-message ${type}`; // 'error' or 'success'
        messageDiv.style.display = 'block';
    }
}

// --- Authentication Logic ---
function handleRegistration(event) {
    event.preventDefault();
    const username = registerForm.username.value.trim();
    const password = registerForm.password.value;
    const confirmPassword = registerForm.confirmPassword.value;
    const messageDiv = document.getElementById('register-message');

    // Basic Validation
    if (username.length < 3 || !/^[a-zA-Z0-9]+$/.test(username)) {
        displayMessage(registerForm, 'Username must be at least 3 alphanumeric characters.');
        return;
    }
    if (password.length < 6) {
        displayMessage(registerForm, 'Password must be at least 6 characters long.');
        return;
    }
    if (password !== confirmPassword) {
        displayMessage(registerForm, 'Passwords do not match.');
        return;
    }

    // Check if username already exists in our simulated user data
    if (currentAppState.users.find(user => user.username.toLowerCase() === username.toLowerCase())) {
        displayMessage(registerForm, 'Username already taken. Please choose another.');
        return;
    }

    // Simulate adding user (this won't persist beyond this session unless we write to localStorage)
    const newUser = {
        id: currentAppState.users.length > 0 ? Math.max(...currentAppState.users.map(u => u.id)) + 1 : 1,
        username: username,
        password: password, // In a real app, HASH THIS PASSWORD!
        balance: 1000, // Default starting balance for new users
        portfolio: []
    };
    currentAppState.users.push(newUser); // Add to the in-memory state

    // Optionally, to make new users persist a bit more for testing across page loads (but not browser close without cookies)
    // localStorage.setItem('cressidaSimulatedUsers', JSON.stringify(currentAppState.users));


    displayMessage(registerForm, 'Registration successful! You can now log in.', 'success');
    registerForm.reset();
    // Consider redirecting to login page after a short delay
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

function handleLogin(event) {
    event.preventDefault();
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;

    const user = currentAppState.users.find(
        u => u.username.toLowerCase() === username.toLowerCase() && u.password === password // Plain text check (simulation only!)
    );

    if (user) {
        currentAppState.loggedInUser = user; // Set in global state
        setCookie('cressidaLoggedInUser', user.username, 1); // Cookie for 1 day
        displayMessage(loginForm, 'Login successful! Redirecting...', 'success');
        // Redirect to profile or markets page
        setTimeout(() => {
             // Redirect to profile or markets page
            const intendedUrl = sessionStorage.getItem('intendedUrl') || 'profile.html';
            sessionStorage.removeItem('intendedUrl'); // Clean up
            window.location.href = intendedUrl;
        }, 1000);
    } else {
        displayMessage(loginForm, 'Invalid username or password.');
        currentAppState.loggedInUser = null;
    }
}

function handleLogout(event) {
    if (event) event.preventDefault();
    eraseCookie('cressidaLoggedInUser');
    currentAppState.loggedInUser = null;
    updateNavbarForLoggedOutUser();
    // Redirect to homepage or login page
    if (window.location.pathname.includes('profile.html')) {
        window.location.href = 'index.html';
    } else {
         // If on other pages, just update navbar. User might stay on page.
        checkLoginStatus(); // Re-check status to update UI elements
    }
}

function checkLoginStatus() {
    console.log('Auth: checkLoginStatus called');
    const loggedInUsername = getCookie('cressidaLoggedInUser');
    console.log('Auth: Cookie value for cressidaLoggedInUser:', loggedInUsername);

    if (loggedInUsername) {
        // Ensure currentAppState.users is populated (it should be if data.js loaded)
        if (!currentAppState || !currentAppState.users) {
            console.error('Auth: currentAppState.users is not available!');
            currentAppState.loggedInUser = null; // Safety
            updateNavbarForLoggedOutUser();
            return false;
        }

        const user = currentAppState.users.find(u => u.username === loggedInUsername);
        console.log('Auth: User found in currentAppState.users:', user);

        if (user) {
            currentAppState.loggedInUser = user;
            console.log('Auth: currentAppState.loggedInUser set to:', currentAppState.loggedInUser);
            updateNavbarForLoggedInUser(user.username);
            return true;
        } else {
            console.warn('Auth: Cookie found, but user not in currentAppState.users. Clearing cookie.');
            handleLogout(); // This will also call updateNavbarForLoggedOutUser
            return false;
        }
    } else {
        console.log('Auth: No login cookie found.');
        currentAppState.loggedInUser = null;
        updateNavbarForLoggedOutUser();
        return false;
    }
}

function protectProfilePage() {
    if (window.location.pathname.endsWith('profile.html')) {
        console.log('Auth: protectProfilePage called for profile.html');
        console.log('Auth: currentAppState.loggedInUser at protectProfilePage:', currentAppState.loggedInUser);

        // Elements from profile.html
        const userProfileDataSection = document.getElementById('user-profile-data');
        const authRequiredMessageSection = document.getElementById('auth-required-message');
        const profileUsernameSpan = document.getElementById('profile-username');

        if (!currentAppState.loggedInUser) {
            console.log('Auth: User NOT logged in, showing auth required message.');
            if (authRequiredMessageSection) authRequiredMessageSection.style.display = 'block';
            if (userProfileDataSection) userProfileDataSection.style.display = 'none';
        } else {
            console.log('Auth: User IS logged in, showing profile data.');
            if (authRequiredMessageSection) authRequiredMessageSection.style.display = 'none';
            if (userProfileDataSection) userProfileDataSection.style.display = 'block'; // This is key
            if (profileUsernameSpan) {
                profileUsernameSpan.textContent = currentAppState.loggedInUser.username;
                console.log('Auth: Set profile username to:', currentAppState.loggedInUser.username);
            } else {
                console.warn('Auth: profileUsernameSpan not found on profile page!');
            }
        }
    }
}

// --- Initial Execution ---
// Only one DOMContentLoaded listener, keep this one:
document.addEventListener('DOMContentLoaded', () => {
    // Initial check of login status
    checkLoginStatus();

    // Protect profile page if we are on it
    protectProfilePage();

    // Attach form listeners
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
    }
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    window.auth = {
        getLoggedInUser: () => currentAppState.loggedInUser,
        isUserLoggedIn: () => !!currentAppState.loggedInUser,
        logout: handleLogout
    };
    console.log('Auth: currentAppState.loggedInUser:', currentAppState.loggedInUser);
    console.log('Auth: currentAppState:', currentAppState);
    console.log('Auth: Initial checkLoginStatus completed.');
    
});

// --- Expose functions for testing/debugging if needed ---
window.auth = {
    checkLoginStatus,
    handleRegistration,
    handleLogin,
    handleLogout,
    protectProfilePage
};
// --- End of auth.js ---
