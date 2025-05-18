document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply saved theme or system preference
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'light') {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    } else {
        if (userPrefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            // Default to light if no system preference for dark and no saved theme
            // Or keep dark as default based on initial HTML
            // Let's stick to HTML default initially if no preference/storage
            if(document.documentElement.getAttribute('data-theme') === 'light'){
                 themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            } else {
                 themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            }
        }
    }


    themeToggleBtn.addEventListener('click', () => {
        let currentThemeSetting = document.documentElement.getAttribute('data-theme');
        if (currentThemeSetting === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>'; // Show moon for light mode
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';  // Show sun for dark mode
        }
    });

    // Set active class for navigation links
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const currentPath = window.location.pathname.split("/").pop();

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath || (currentPath === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Update year in footer
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // js/main.js - Add this inside the DOMContentLoaded listener



    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navbarBrand = document.querySelector('.navbar-brand'); // Get brand for toggler alignment
    const navbarActions = document.querySelector('.navbar-actions'); // Get actions for alignment

    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', () => {
            navbarCollapse.classList.toggle('active');
            // Toggle ARIA attribute for accessibility
            const isExpanded = navbarCollapse.classList.contains('active');
            navbarToggler.setAttribute('aria-expanded', isExpanded);

            // Optional: Change hamburger icon to 'X' (times) icon when open
            const icon = navbarToggler.querySelector('i');
            if (isExpanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Optional: Close mobile menu if a link is clicked
        const navLinksInMobileMenu = navbarCollapse.querySelectorAll('.nav-link, .btn');
        navLinksInMobileMenu.forEach(link => {
            link.addEventListener('click', () => {
                if (navbarCollapse.classList.contains('active')) {
                    navbarCollapse.classList.remove('active');
                    navbarToggler.setAttribute('aria-expanded', 'false');
                    const icon = navbarToggler.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });


        // Optional: Close mobile menu if clicked outside of it
        document.addEventListener('click', (event) => {
            const isClickInsideNavbar = navbarToggler.contains(event.target) ||
                                     navbarCollapse.contains(event.target) ||
                                     navbarBrand.contains(event.target) || // Check if click is on brand
                                     (navbarActions && navbarActions.contains(event.target)); // Check if click is on actions

            if (!isClickInsideNavbar && navbarCollapse.classList.contains('active')) {
                navbarCollapse.classList.remove('active');
                navbarToggler.setAttribute('aria-expanded', 'false');
                const icon = navbarToggler.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
});