document.addEventListener('DOMContentLoaded', function() {
    const pathPrefix = window.location.pathname.includes('/events/') ? '../' : '';
    const headerPath = `${pathPrefix}assets/components/_header.html`;
    const navScriptPath = `${pathPrefix}assets/js/nav.js`;

    fetch(headerPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Could not load header component from ${headerPath}`);
            }
            return response.text();
        })
        .then(data => {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = data;
                
                // Now that the header exists, load and run its script
                const navScript = document.createElement('script');
                navScript.src = navScriptPath;
                navScript.onload = function() {
                    if (typeof initializeNavigation === 'function') {
                        initializeNavigation();
                    }
                };
                document.body.appendChild(navScript);
            }
        })
        .catch(error => {
            console.error('Error loading components:', error);
        });
});
