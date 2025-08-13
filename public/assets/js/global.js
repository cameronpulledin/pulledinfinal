function initializeGlobalScripts() {
    if (typeof gsap === 'undefined') {
        console.error("GSAP not loaded for global scripts");
        return;
    }

    const mainContent = document.querySelector('main');
    const pageTransitionOverlay = document.getElementById('page-transition-overlay');

    function pageTransition(targetUrl) {
        const tl = gsap.timeline({ onComplete: () => window.location.href = targetUrl });
        if (mainContent) {
            tl.to(mainContent, { opacity: 0, duration: 0.4 });
        }
        if(pageTransitionOverlay) {
            tl.set(pageTransitionOverlay, { x: '100%', visibility: 'visible' });
            tl.to(pageTransitionOverlay, { x: '0%', duration: 0.8, ease: "power2.inOut" });
        }
    }

    document.body.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (target && target.href && !target.target && !target.classList.contains('no-transition') && target.hostname === window.location.hostname) {
            if (target.pathname === window.location.pathname && target.hash) return;
            e.preventDefault();
            pageTransition(target.href);
        }
    });

    // --- NEW Menu Toggle Logic ---
    const menuToggle = document.querySelector('.menu-toggle-btn');
    if (menuToggle) {
        const menuText = menuToggle.querySelector('.menu-text');
        const menuOverlay = document.querySelector('.menu-overlay');
        const menuLeft = document.querySelector('.menu-left');
        const menuRight = document.querySelector('.menu-right');
        const menuLinks = gsap.utils.toArray('.menu-nav-overlay li');
        let isMenuOpen = false;

        const menuTimeline = gsap.timeline({ paused: true })
            .set(menuOverlay, { visibility: 'visible' })
            .to([menuLeft, menuRight], {
                x: 0,
                duration: 0.8,
                ease: 'power3.inOut'
            })
            .to(menuLinks, {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.5,
                ease: 'power2.out'
            }, "-=0.5");

        menuToggle.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            menuText.textContent = isMenuOpen ? "CLOSE" : "MENU";
            if (isMenuOpen) {
                menuTimeline.play();
            } else {
                menuTimeline.reverse();
            }
        });
    }
}

// Initial check for pages that might not use the component loader
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('header-placeholder')) {
            initializeGlobalScripts();
        }
    });
} else {
    if (!document.getElementById('header-placeholder')) {
        initializeGlobalScripts();
    }
}
