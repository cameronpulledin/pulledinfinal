// Reusable Navigation Component Logic
function initializeNavigation() {
    if (typeof gsap === 'undefined') {
        console.error("GSAP not loaded, navigation will not work.");
        return;
    }

    let isMenuOpen = false;
    let menuTimeline;

    // Corrected selector to match _header.html
    const menuToggle = document.querySelector('.header-menu-toggle'); 
    
    if (menuToggle) {
        const menuText = menuToggle.querySelector('.menu-text');
        const menuOverlay = document.querySelector('.menu-overlay');
        const menuLeft = document.querySelector('.menu-left');
        const menuRight = document.querySelector('.menu-right');
        const menuLinks = gsap.utils.toArray('.menu-nav-overlay li');
        const menuLogoContainer = document.querySelector('.menu-logo-container');
        const pulledinLogo = menuLogoContainer.querySelector('.pulledin-logo');
        const chevronIcon = menuLogoContainer.querySelector('.chevron-icon');
        const rippleFilter = document.querySelector('#ripple-filter feDisplacementMap');
        
        let mm = gsap.matchMedia();

        mm.add({
            isDesktop: "(min-width: 769px)",
            isMobile: "(max-width: 768px)"
        }, (context) => {
            let { isDesktop, isMobile } = context.conditions;

            menuTimeline = gsap.timeline({
                paused: true,
                onStart: () => { gsap.set(menuOverlay, { visibility: 'visible' }); },
                onReverseComplete: () => { gsap.set(menuOverlay, { visibility: 'hidden' }); }
            });

            menuTimeline
            .to([menuLeft, menuRight], {
                x: isDesktop ? 0 : '0%',
                y: isMobile ? 0 : '0%',
                duration: 0.8,
                ease: 'power3.inOut'
            })
            .to(menuToggle, {
                color: isDesktop ? 'var(--background)' : 'var(--primary)',
                duration: 0.8,
                ease: 'power3.inOut'
            }, "<")
            .to(menuLinks, {
                opacity: 1,
                y: 0,
                stagger: 0.1,
                duration: 0.5,
                ease: 'power2.out'
            }, "-=0.5");

            return () => { if (menuTimeline) menuTimeline.kill(); }
        });

        menuToggle.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            menuText.textContent = isMenuOpen ? "CLOSE" : "MENU";
            if (isMenuOpen) {
                menuTimeline.play();
            } else {
                menuTimeline.reverse();
            }
        });
        
        menuLogoContainer.addEventListener('mouseenter', () => {
            gsap.to(pulledinLogo, { opacity: 0, duration: 0.3 });
            gsap.to(chevronIcon, { opacity: 1, duration: 0.3 });
            gsap.fromTo(rippleFilter, { attr: { scale: 0 } }, { attr: { scale: 30 }, duration: 0.5, ease: 'power2.out' });
            gsap.to(rippleFilter, { attr: { scale: 0 }, duration: 0.5, ease: 'power2.in', delay: 0.5 });
        });
        menuLogoContainer.addEventListener('mouseleave', () => {
            gsap.to(pulledinLogo, { opacity: 1, duration: 0.3 });
            gsap.to(chevronIcon, { opacity: 0, duration: 0.3 });
        });

        const navLinks = gsap.utils.toArray('.menu-nav-overlay a');
        navLinks.forEach(link => {
            link.addEventListener('mousemove', (e) => {
                const { clientX, clientY } = e;
                const { left, top, width, height } = link.getBoundingClientRect();
                const moveX = (clientX - (left + width / 2)) * 0.5;
                const moveY = (clientY - (top + height / 2)) * 0.5;
                gsap.to(link.parentNode, { x: moveX, y: moveY, duration: 0.3, ease: 'power2.out' });
            });
            link.addEventListener('mouseleave', () => {
                gsap.to(link.parentNode, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
            });
        });
    }
}
