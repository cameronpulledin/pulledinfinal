document.addEventListener('DOMContentLoaded', function () {
    // Fetch and inject the header component
    fetch('../components/_header.html')
        .then(response => {
            if (!response.ok) throw new Error('Header component not found');
            return response.text();
        })
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            // Initialize scripts that depend on the header, like the menu toggle
            initializeGlobalScripts();
        })
        .catch(error => console.error('Error fetching header:', error));

    // Get the event ID from the URL query parameter (e.g., ?event=stackxdays)
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');

    if (!eventId) {
        document.body.innerHTML = '<h1>No event specified in URL.</h1>';
        return;
    }

    // Check if the eventsData object from events-data.js is available
    if (typeof eventsData === 'undefined') {
        console.error('Error: eventsData is not defined. Make sure events-data.js is loaded before this script.');
        document.body.innerHTML = '<h1>Error: Event data could not be loaded.</h1>';
        return;
    }

    // Find the specific event's data from the eventsData array
    const eventData = eventsData.find(e => e.id === eventId);

    if (!eventData) {
        document.body.innerHTML = `<h1>Event with ID "${eventId}" not found.</h1>`;
        return;
    }

    // If data is found, populate the page
    populatePage(eventData);
});

function populatePage(eventData) {
    // Populate the page with the fetched event data
    document.title = `Event: ${eventData.heroTitle} | Pulledin`;
    document.getElementById('hero-title').textContent = eventData.heroTitle;
    document.getElementById('description-left').innerHTML = eventData.descriptionLeft;
    document.getElementById('description-right').textContent = eventData.descriptionRight;

    const detailsGrid = document.getElementById('details-grid');
    detailsGrid.innerHTML = ''; // Clear any placeholder content
    eventData.details.forEach(detail => {
        const item = document.createElement('div');
        item.className = 'detail-item';
        item.innerHTML = `<h3>${detail.label}</h3><p>${detail.value}</p>`;
        detailsGrid.appendChild(item);
    });

    // --- Initialize GSAP Animations ---
    const heroTitle = document.querySelector('.event-hero-title');
    const contentSection = document.querySelector('.event-content-section');
    
    gsap.timeline({
        scrollTrigger: { trigger: document.body, start: "top top", end: "60% top", scrub: 1 }
    }).to(heroTitle, { fontSize: "3rem", opacity: 0.9, top: "6rem", left: "2rem", transform: "translate(0, 0)", textAlign: "left" })
      .to(contentSection, { opacity: 1, visibility: 'visible' }, "<");

    // --- Initialize Gallery ---
    const gallery = document.querySelector(".scrolling-gallery");
    let marquee;
    let currentEnlargedIndex = -1;

    if (gallery && eventData.gallery) {
        gallery.innerHTML = ''; // Clear any placeholder content
        eventData.gallery.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'gallery-item';
            itemEl.dataset.index = index;
            if (item.type === 'youtube-portrait') itemEl.classList.add('is-youtube-portrait');
            
            const mediaWrapper = document.createElement('div');
            mediaWrapper.className = 'gallery-item-media';
            let mediaEl;

            if (item.type === 'image') {
                mediaEl = document.createElement('img');
                mediaEl.src = item.url;
            } else if (item.type === 'video') {
                mediaEl = document.createElement('video');
                mediaEl.src = item.url;
                Object.assign(mediaEl, { loop: true, muted: true, playsinline: true });
            } else if (item.type.startsWith('youtube')) {
                mediaEl = document.createElement('div');
                mediaEl.id = `player-thumb-${index}`;
            }
            mediaWrapper.appendChild(mediaEl);
            
            const titleEl = document.createElement('div');
            titleEl.className = 'gallery-item-title';
            titleEl.textContent = item.title;
            
            itemEl.appendChild(mediaWrapper);
            itemEl.appendChild(titleEl);
            gallery.appendChild(itemEl);

            if (item.type === 'image' || item.type === 'video') {
                const eventName = item.type === 'image' ? 'load' : 'loadedmetadata';
                mediaEl.addEventListener(eventName, () => setItemAspectRatio(itemEl, mediaEl));
            } else if (item.type.startsWith('youtube')) {
                setItemAspectRatio(itemEl, null, 16/9);
            }
        });

        function setItemAspectRatio(itemEl, mediaEl, aspectRatio = null) {
            if (!itemEl) return;
            const ar = aspectRatio || (mediaEl.naturalWidth || mediaEl.videoWidth) / (mediaEl.naturalHeight || mediaEl.videoHeight);
            const galleryItemHeight = itemEl.offsetHeight;
            if (galleryItemHeight > 0) {
                itemEl.style.width = `${galleryItemHeight * ar}px`;
            }
        }

        setTimeout(() => {
            const originalItems = gallery.querySelectorAll('.gallery-item');
            originalItems.forEach(item => gallery.appendChild(item.cloneNode(true)));
            let totalWidth = 0;
            gallery.querySelectorAll('.gallery-item').forEach(item => totalWidth += item.offsetWidth + parseInt(getComputedStyle(item).marginRight) * 2);
            marquee = gsap.to(gallery, { x: -totalWidth / 2, duration: 40, ease: "none", repeat: -1, yoyo: true });
        }, 1000);

        gallery.addEventListener('mouseenter', () => marquee && marquee.pause());
        gallery.addEventListener('mouseleave', () => marquee && marquee.play());

        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', (e) => handleItemEnlarge(e.currentTarget));
        });
    }

    function handleItemEnlarge(item) {
        if (document.querySelector('.enlarged-item-clone')) return;
        currentEnlargedIndex = parseInt(item.dataset.index);
        const originalRect = item.getBoundingClientRect();
        let clone = item.cloneNode(true);
        clone.classList.add('enlarged-item-clone');
        const overlay = document.createElement('div');
        overlay.className = 'enlarge-overlay';
        document.body.appendChild(overlay);
        document.body.appendChild(clone);
        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.5 });
        const viewportW = window.innerWidth * 0.9;
        const viewportH = window.innerHeight * 0.9;
        const scaleX = viewportW / originalRect.width;
        const scaleY = viewportH / originalRect.height;
        const scale = Math.min(scaleX, scaleY);
        gsap.fromTo(clone, { 
            top: originalRect.top, left: originalRect.left, 
            width: originalRect.width, height: originalRect.height
        }, {
            top: '50%', left: '50%', x: '-50%', y: '-50%',
            width: originalRect.width * scale,
            height: originalRect.height * scale,
            duration: 0.5, ease: 'expo.out'
        });
        setupEnlargedItem(clone, currentEnlargedIndex);
        overlay.addEventListener('click', closeEnlargedView);
        document.addEventListener('keydown', handleKeyPress);
    }

    function closeEnlargedView() {
        const clone = document.querySelector('.enlarged-item-clone');
        const overlay = document.querySelector('.enlarge-overlay');
        if (!clone || !overlay) return;
        gsap.to([clone, overlay], {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                clone.remove();
                overlay.remove();
                currentEnlargedIndex = -1;
                document.removeEventListener('keydown', handleKeyPress);
            }
        });
    }
    
    function updateEnlargedContent(newIndex) {
        const clone = document.querySelector('.enlarged-item-clone');
        const itemData = eventData.gallery[newIndex];
        const originalItem = document.querySelector(`.gallery-item[data-index='${newIndex}']`);
        if (!clone || !itemData || !originalItem) return;

        currentEnlargedIndex = newIndex;
        const originalRect = originalItem.getBoundingClientRect();

        gsap.to(clone, {opacity: 0, duration: 0.2, onComplete: () => {
            const mediaWrapper = clone.querySelector('.gallery-item-media');
            const titleEl = clone.querySelector('.gallery-item-title');
            titleEl.textContent = itemData.title;
            if (itemData.type === 'image') mediaWrapper.innerHTML = `<img src="${itemData.url}" alt="${itemData.title}">`;
            else if (itemData.type === 'video') mediaWrapper.innerHTML = `<video src="${itemData.url}" loop muted playsinline></video>`;
            else if (itemData.type.startsWith('youtube')) mediaWrapper.innerHTML = `<div id="player-enlarged"></div>`;
            
            if (itemData.type === 'youtube-portrait') clone.classList.add('is-youtube-portrait');
            else clone.classList.remove('is-youtube-portrait');

            const viewportW = window.innerWidth * 0.9;
            const viewportH = window.innerHeight * 0.9;
            const scaleX = viewportW / originalRect.width;
            const scaleY = viewportH / originalRect.height;
            const scale = Math.min(scaleX, scaleY);
            
            gsap.to(clone, {
                width: originalRect.width * scale,
                height: originalRect.height * scale,
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out'
            });

            setupEnlargedItem(clone, newIndex);
        }});
    }

    function handleKeyPress(e) {
        if (e.key === 'ArrowRight') {
            let nextIndex = currentEnlargedIndex + 1;
            if (nextIndex >= eventData.gallery.length) nextIndex = 0;
            updateEnlargedContent(nextIndex);
        } else if (e.key === 'ArrowLeft') {
            let prevIndex = currentEnlargedIndex - 1;
            if (prevIndex < 0) prevIndex = eventData.gallery.length - 1;
            updateEnlargedContent(prevIndex);
        } else if (e.key === 'Escape') {
            closeEnlargedView();
        }
    }

    function setupEnlargedItem(clone, index) {
        const itemData = eventData.gallery[index];
        const itemType = itemData.type;
        let videoPlayer, isMuted = true;
        if (itemType === 'video') {
            videoPlayer = clone.querySelector('video');
            if (videoPlayer) videoPlayer.play();
        } else if (itemType.startsWith('youtube')) {
            videoPlayer = new YT.Player('player-enlarged', {
                height: '100%', width: '100%', videoId: itemData.id,
                playerVars: { 'autoplay': 1, 'controls': 0, 'rel': 0, 'showinfo': 0, 'loop': 1, 'playlist': itemData.id },
            });
        }
        clone.addEventListener('click', (e) => {
            e.stopPropagation();
            if (videoPlayer) {
                if (itemType === 'video') {
                   if (videoPlayer.paused) { videoPlayer.play(); } else { videoPlayer.pause(); }
                   if (isMuted) { videoPlayer.muted = false; isMuted = false; }
                } else if (itemType.startsWith('youtube') && typeof videoPlayer.getPlayerState === 'function') {
                   if(videoPlayer.getPlayerState() === YT.PlayerState.PLAYING) { videoPlayer.pauseVideo(); } else { videoPlayer.playVideo(); }
                   if (isMuted) { videoPlayer.unMute(); isMuted = false; }
                }
            }
        });
    }

    window.onYouTubeIframeAPIReady = function() {
        if (eventData && eventData.gallery) {
            eventData.gallery.forEach((item, index) => {
                if (item.type.startsWith('youtube')) {
                    new YT.Player(`player-thumb-${index}`, {
                        height: '100%', width: '100%', videoId: item.id,
                        playerVars: { 'autoplay': 0, 'controls': 0, 'rel': 0, 'showinfo': 0, 'loop': 1, 'mute': 1, 'playlist': item.id },
                    });
                }
            });
        }
    };
}

// This function needs to be accessible globally for the header fetch to call it.
function initializeGlobalScripts() {
    const menuToggle = document.querySelector('.header-menu-toggle');
    if (menuToggle) {
        const menuText = menuToggle.querySelector('.menu-text');
        const fullscreenMenu = document.querySelector('.fullscreen-menu');
        const menuLinks = gsap.utils.toArray('.fullscreen-menu .menu-nav a');
        const menuFooter = document.querySelector('.menu-footer-text');
        let isMenuOpen = false;

        gsap.set(menuLinks, { yPercent: 101 });
        gsap.set(menuFooter, { opacity: 0 });
        gsap.set(fullscreenMenu, { autoAlpha: 0 });

        const menuTimeline = gsap.timeline({ paused: true })
            .to(fullscreenMenu, { autoAlpha: 1, duration: 0.5, ease: 'power2.inOut' })
            .to(menuLinks, { yPercent: 0, duration: 0.7, stagger: 0.05, ease: 'power3.out' }, "-=0.2")
            .to(menuFooter, { opacity: 1, duration: 0.5, ease: 'power2.out' }, ">-0.5");

        menuToggle.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            menuText.textContent = isMenuOpen ? "CLOSE" : "MENU";
            isMenuOpen ? menuTimeline.play() : menuTimeline.reverse();
        });
    }
}
