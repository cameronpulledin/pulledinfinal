// --- GLOBAL LOGIC ---
document.addEventListener('DOMContentLoaded', function () {
    if (typeof gsap === 'undefined') { return; }

    const mainContent = document.getElementById('smooth-content');
    const loader = document.getElementById('loader');
    const loaderLogo = document.getElementById('loader-logo');
    const pageTransitionOverlay = document.getElementById('page-transition-overlay');

    function loaderAnimation() {
        if (!loader || !mainContent) {
            if(mainContent) mainContent.style.opacity = 1;
            document.dispatchEvent(new Event('loaderAnimationComplete'));
            return;
        }
        const tl = gsap.timeline({
            onComplete: () => {
                gsap.set(loader, { display: "none" });
                document.body.style.pointerEvents = 'auto';
                document.dispatchEvent(new Event('loaderAnimationComplete'));
            }
        });
        tl.set(mainContent, { opacity: 0 }).set(document.body, { pointerEvents: 'none' });
        const logoPaths = loaderLogo ? loaderLogo.querySelectorAll('path, polygon, rect') : [];
        if (logoPaths.length > 0 && typeof DrawSVGPlugin !== 'undefined') {
            gsap.registerPlugin(DrawSVGPlugin);
            tl.fromTo(logoPaths, { drawSVG: "0%" }, { drawSVG: "100%", duration: 2, stagger: 0.05, ease: "power1.inOut" });
            tl.to(logoPaths, { fill: "var(--primary)", duration: 0.5, ease: "power1.inOut" }, "-=0.5");
            tl.to(loader, { opacity: 0, duration: 0.8, ease: "power2.out", delay: 0.3 });
        } else {
            tl.to(loader, { opacity: 0, duration: 0.8, ease: "power2.out", delay: 1 });
        }
        tl.to(mainContent, { opacity: 1, duration: 1, ease: "power2.out" }, "<");
    }
    loaderAnimation();

    const learnMoreLink = document.querySelector('.learn-more-link');
    const aboutOverlay = document.querySelector('.about-overlay');
    if (learnMoreLink && aboutOverlay) {
        gsap.set(aboutOverlay, { autoAlpha: 0 });
        const showOverlay = () => gsap.to(aboutOverlay, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' });
        const hideOverlay = () => gsap.to(aboutOverlay, { autoAlpha: 0, duration: 0.4, ease: 'power2.in' });
        learnMoreLink.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); showOverlay(); });
        aboutOverlay.addEventListener('click', (e) => { if (e.target === aboutOverlay) { hideOverlay(); } });
    }
});

// --- HOMEPAGE GALLERY LOGIC ---
function initializeHomepageGallery() {
    if (typeof Draggable !== 'undefined' && typeof Observer !== 'undefined') {
        gsap.registerPlugin(Draggable, Observer);

        const gallerySection = document.querySelector('.event-gallery-section');
        if (!gallerySection) return;

        const galleryContainer = gallerySection.querySelector('.gallery-container');
        const galleryWrapper = gallerySection.querySelector('.gallery-wrapper');
        const hintIcon = gallerySection.querySelector('.scroll-hint-container');
        const controlsDiv = document.getElementById('controls');
        
        if (!galleryContainer || !galleryWrapper || !hintIcon || !controlsDiv) return;

        let contentData = [];
        let draggableInstance;
        let wheelObserver;
        let hasInteracted = false;
        let panels = [];

        const panelWidth = 400;
        const panelHeight = 600;
        const panelOverlap = 100;
        const panelSpacing = panelWidth - panelOverlap;
        const rotationAmount = 25;
        let wrapWidth;

        function hideHintIcon() {
            if (!hasInteracted) {
                gsap.to(hintIcon, { opacity: 0, duration: 0.4 });
                hasInteracted = true;
            }
        }

        function createPanelsAndClones() {
            galleryWrapper.innerHTML = '';
            panels = [];

            const originalPanelsData = [
                { id: 'event-01', year: '2025', title: 'Music Festival', mediaUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&h=1200&fit=crop', detailContent: { pageUrl: "events/stackxdays.html", title: "The Echoes Festival: A Symphony of Sound", image: "https://images.unsplash.com/photo-1505373877845-8f2f2115b67a?q=80&w=1200&h=800&fit=crop", paragraphs: ["Held annually in the vibrant heart of the city...", "Our production for Echoes focuses on creating seamless stage transitions...", "From intricate backstage logistics to crowd flow management..."] } },
                { id: 'event-02', year: '2024', title: 'MIA Training', mediaUrl: 'https://www.youtube.com/watch?v=q35b04MhiJ4', detailContent: { pageUrl: "events/mia.html", title: "Mission Impact Academy Training", image: "https://images.unsplash.com/photo-1542740685-5b8d0092823a?q=80&w=1200&h=800&fit=crop", paragraphs: ["The Mission Impact Academy Training is designed to...", "We focused on interactive modules...", "Attendees left with practical skills..."] } },
                { id: 'event-03', year: '2023', title: 'Immerse Global Summit', mediaUrl: 'https://www.youtube.com/watch?v=xw3vjLJzdAU', detailContent: { pageUrl: "events/igs.html", title: "Immerse Global Summit: The Future of XR", image: "https://images.unsplash.com/photo-1517486804867-0c7f3b8e8b2a?q=80&w=1200&h=800&fit=crop", paragraphs: ["The Immerse Global Summit brought together...", "Our role involved creating dynamic presentation spaces...", "From keynote speakers to hands-on demos..."] } },
                { id: 'event-04', year: '2020', title: 'VR/AR Global Summit (EU)', mediaUrl: 'https://www.youtube.com/watch?v=CJSWm0lCBwY', detailContent: { pageUrl: "events/vrargs-europa.html", title: "VR/AR Global Summit Europe: Connecting Innovators", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1200&h=800&fit=crop", paragraphs: ["The European edition of the VR/AR Global Summit...", "We focused on regional insights...", "Showcasing the best of European XR..."] } },
                { id: 'event-05', year: '2020', title: 'VR/AR Global Summit (WW)', mediaUrl: 'https://www.youtube.com/watch?v=8XI4n7WEPqg', detailContent: { pageUrl: "events/vrargs-2020.html", title: "VR/AR Global Summit Worldwide: Virtual Connections", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&h=800&fit=crop", paragraphs: ["The worldwide virtual summit was a pioneering event...", "Leveraging cutting-edge virtual platforms...", "Connecting a global community..."] } },
                { id: 'event-06', year: '2019', title: 'VR/AR Global Summit (Van)', mediaUrl: 'https://www.youtube.com/watch?v=FDA0vYYl0NY', detailContent: { pageUrl: "events/vrargs-2019.html", title: "VR/AR Global Summit Vancouver: A Local Hub", image: "https://images.unsplash.com/photo-1499956434442-73a7a496a75f?q=80&w=1200&h=800&fit=crop", paragraphs: ["The Vancouver summit was a key gathering...", "Highlighting local talent and innovation...", "A vibrant community event..."] } },
                { id: 'event-07', year: '2018', title: 'VR/AR Global Summit', mediaUrl: 'https://www.youtube.com/watch?v=fpeGUuLhDqI', detailContent: { pageUrl: "events/vrargs-2018.html", title: "VR/AR Global Summit: Early Innovations", image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&h=800&fit=crop", paragraphs: ["The inaugural VR/AR Global Summit set the stage...", "Exploring foundational concepts...", "Pioneering discussions in emerging tech..."] } },
                { id: 'event-08', year: '2018', title: 'CVR', mediaUrl: 'https://www.youtube.com/watch?v=BvA925bjW4s', detailContent: { pageUrl: "events/cvr.html", title: "CVR: The Canadian VR Expo", image: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=1200&h=800&fit=crop", paragraphs: ["CVR was Canada's premier virtual reality expo...", "Showcasing Canadian innovation...", "A platform for local developers..."] } },
                { id: 'event-09', year: '2014', title: 'TED30', mediaUrl: 'https://www.youtube.com/watch?v=BbLlo8rXcI4', detailContent: { pageUrl: "events/ted.html", title: "TED30: Celebrating Innovation", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200&h=800&fit=crop", paragraphs: ["TED30 marked three decades of 'Ideas Worth Spreading'...", "Our involvement ensured seamless presentation...", "A milestone event for global thought..."] } },
                { id: 'event-10', year: '2013', title: 'Walk a Mile in Her Shoes', mediaUrl: 'https://www.youtube.com/watch?v=ApeuMetSDWE', detailContent: { pageUrl: "events/walk-a-mile.html", title: "Walk a Mile in Her Shoes: Toronto Edition", image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&h=800&fit=crop", paragraphs: ["The 'Walk a Mile in Her Shoes' event in Toronto...", "Raising awareness for a vital cause...", "A powerful community demonstration..."] } },
                { id: 'event-11', year: '2011-2013', title: 'SmartGrid Canada', mediaUrl: 'assets/images/Events/sgc2013.jpg', detailContent: { pageUrl: "events/smartgrid.html", title: "SmartGrid Canada: Powering the Future", image: "https://images.unsplash.com/photo-1499956434442-73a7a496a75f?q=80&w=1200&h=800&fit=crop", paragraphs: ["SmartGrid Canada conferences focused on...", "Facilitating dialogue between industry and policy makers...", "Shaping the future of energy infrastructure..."] } }
            ];

            contentData = originalPanelsData;

            const numOriginals = contentData.length;
            const panelsPerView = Math.ceil(window.innerWidth / panelSpacing);
            const numClonesEachSide = numOriginals + panelsPerView;

            for (let i = 0; i < numClonesEachSide; i++) {
                const originalIndex = i % numOriginals;
                const data = contentData[originalIndex];
                const clonedPanel = createPanelElement(data, originalIndex, true);
                galleryWrapper.appendChild(clonedPanel);
                panels.push(clonedPanel);
            }

            for (let i = numClonesEachSide - 1; i >= 0; i--) {
                const originalIndex = i % numOriginals;
                const data = contentData[originalIndex];
                const clonedPanel = createPanelElement(data, originalIndex, true);
                galleryWrapper.prepend(clonedPanel);
                panels.unshift(clonedPanel);
            }

            gsap.set(panels, { x: (i) => i * panelSpacing });
            wrapWidth = numOriginals * panelSpacing;
        }

        function createPanelElement(data, index, isClone) {
            const panel = document.createElement('a');
            panel.className = 'event-panel';
            panel.href = data.detailContent.pageUrl || '#';
            panel.dataset.id = data.id;
            panel.dataset.originalIndex = index;
            if (isClone) {
                panel.classList.add('is-clone');
            }

            const mediaWrapper = document.createElement('div');
            mediaWrapper.className = 'event-panel-image-wrapper';
            let mediaEl;

            if (data.mediaUrl.includes('youtube.com')) {
                data.type = 'youtube';
                const videoId = new URL(data.mediaUrl).searchParams.get('v');
                data.videoId = videoId;
                mediaEl = document.createElement('div');
                mediaEl.className = 'yt-player';
                mediaEl.id = `player-home-${data.id}-${isClone ? 'clone-' + Math.random().toString(36).substring(7) : index}`;
            } else if (data.mediaUrl.endsWith('.mp4')) {
                data.type = 'video';
                mediaEl = document.createElement('video');
                mediaEl.className = 'event-panel-video';
                mediaEl.src = data.mediaUrl;
                Object.assign(mediaEl, { loop: true, muted: true, playsinline: true, preload: 'metadata' });
            } else {
                data.type = 'image';
                mediaEl = document.createElement('img');
                mediaEl.className = 'event-panel-image';
                mediaEl.src = data.mediaUrl;
                mediaEl.alt = data.title;
                mediaEl.onerror = function() { this.src = 'https://placehold.co/400x600/1a1a1a/F0EAD6?text=Image+Error'; };
            }
            
            mediaWrapper.appendChild(mediaEl);

            const textOverlay = document.createElement('div');
            textOverlay.className = 'event-panel-text-overlay';

            const titleElem = document.createElement('h2');
            titleElem.className = 'event-panel-title-coverflow';
            titleElem.textContent = data.title;
            textOverlay.appendChild(titleElem);

            const yearElem = document.createElement('p');
            yearElem.className = 'event-panel-year';
            yearElem.textContent = data.year;
            textOverlay.appendChild(yearElem);

            panel.appendChild(mediaWrapper);
            panel.appendChild(textOverlay);

            if (data.type === 'video') {
                panel.addEventListener('mouseenter', () => mediaEl.play());
                panel.addEventListener('mouseleave', () => mediaEl.pause());
            }

            panel.addEventListener('click', (e) => {
                e.preventDefault();
                // openOverlay(data.detailContent); // Assuming openOverlay function exists
            });

            return panel;
        }

        function setupCoverflow() {
            const initialOffset = (window.innerWidth / 2) - (panels[0].offsetWidth / 2) - panels[0].offsetLeft;

            draggableInstance = Draggable.create(galleryWrapper, {
                type: "x",
                bounds: { minX: -Infinity, maxX: Infinity },
                inertia: true,
                dragResistance: 0.5,
                edgeResistance: 0.7,
                cursor: "grab",
                throwProps: true,
                snap: {
                    x: function(endValue) {
                        return Math.round(endValue / panelSpacing) * panelSpacing;
                    }
                },
                onDragStart: function() {
                    galleryWrapper.classList.add('is-dragging');
                },
                onDragEnd: function() {
                    galleryWrapper.classList.remove('is-dragging');
                },
                onDrag: function() {
                    applyCoverflowEffects(this.x);
                    seamlessLoop(this);
                    updateActiveMenuItem(this.x);
                },
                onThrowUpdate: function() {
                    applyCoverflowEffects(this.x);
                    seamlessLoop(this);
                    updateActiveMenuItem(this.x);
                },
                onRelease: function() {
                    snapToNearestPanel();
                }
            })[0];

            gsap.set(galleryWrapper, { x: initialOffset });
            draggableInstance.x = initialOffset;

            applyCoverflowEffects(draggableInstance.x);
            updateActiveMenuItem(draggableInstance.x);

            function seamlessLoop(draggable) {
                let proxy = draggable.x;
                if (proxy > 0) {
                    draggable.x -= wrapWidth;
                } else if (proxy < -wrapWidth) {
                    draggable.x += wrapWidth;
                }
                draggable.update();
            }

            function applyCoverflowEffects(wrapperX) {
                const centerOfContainer = galleryContainer.offsetWidth / 2;
                panels.forEach((panel) => {
                    const panelCenterX = panel.offsetLeft + gsap.getProperty(panel, "x") + (panel.offsetWidth / 2) + wrapperX;
                    const distanceFromCenter = panelCenterX - centerOfContainer;
                    const normalizedDistance = gsap.utils.clamp(-1, 1, distanceFromCenter / (panelWidth * 1.5));
                    gsap.to(panel, {
                        scale: 1 - Math.abs(normalizedDistance * 0.2),
                        rotationY: normalizedDistance * rotationAmount,
                        opacity: 1 - Math.abs(normalizedDistance * 0.5),
                        z: -Math.abs(normalizedDistance * 200),
                        duration: 0.1,
                        ease: "power1.out",
                        overwrite: true,
                        zIndex: 1000 - Math.abs(Math.round(normalizedDistance * 100))
                    });
                });
            }

            function snapToNearestPanel() {
                // ... (snap logic)
            }

            wheelObserver = Observer.create({
                target: galleryContainer,
                type: "wheel",
                onWheel: (self) => {
                    hideHintIcon();
                    const currentX = gsap.getProperty(galleryWrapper, 'x');
                    const newX = currentX - (self.deltaX || self.deltaY);
                    gsap.to(galleryWrapper, {
                        x: newX,
                        duration: 0.5,
                        ease: "power2.out",
                        onUpdate: () => {
                            draggableInstance.x = gsap.getProperty(galleryWrapper, "x");
                            applyCoverflowEffects(draggableInstance.x);
                            seamlessLoop(draggableInstance);
                            updateActiveMenuItem(draggableInstance.x);
                        }
                    });
                }
            });

            gsap.to(hintIcon, { opacity: 1, delay: 1, duration: 0.5 });
        }

        function setupBottomMenu() {
            if (!controlsDiv) return;
            // ... (bottom menu logic)
        }

        function updateActiveMenuItem(currentWrapperX) {
            // ... (update menu logic)
        }

        let youtubePlayers = {};

        function initializeYTPlayers() {
            const ytPlayerDivs = document.querySelectorAll('.yt-player');
            ytPlayerDivs.forEach(div => {
                const panel = div.closest('.event-panel');
                const data = contentData.find(item => item.id === panel.dataset.id);
                if (data && data.type === 'youtube' && !youtubePlayers[div.id]) {
                    youtubePlayers[div.id] = new YT.Player(div.id, {
                        height: '100%',
                        width: '100%',
                        videoId: data.videoId,
                        playerVars: { 'autoplay': 0, 'controls': 0, 'rel': 0, 'showinfo': 0, 'loop': 1, 'mute': 1, 'playlist': data.videoId, 'enablejsapi': 1 },
                    });
                }
            });
        }

        document.addEventListener('mouseenter', (e) => {
            const panel = e.target.closest('.event-panel');
            if (panel) {
                const video = panel.querySelector('.event-panel-video');
                if (video) video.play();
                const ytPlayerDiv = panel.querySelector('.yt-player');
                if (ytPlayerDiv && youtubePlayers[ytPlayerDiv.id]) {
                    youtubePlayers[ytPlayerDiv.id].playVideo();
                }
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const panel = e.target.closest('.event-panel');
            if (panel) {
                const video = panel.querySelector('.event-panel-video');
                if (video) video.pause();
                const ytPlayerDiv = panel.querySelector('.yt-player');
                if (ytPlayerDiv && youtubePlayers[ytPlayerDiv.id]) {
                    youtubePlayers[ytPlayerDiv.id].pauseVideo();
                }
            }
        }, true);

        window.onYouTubeIframeAPIReady = initializeYTPlayers;

        createPanelsAndClones();
        setupCoverflow();
        setupBottomMenu();
        
        if (window.YT && window.YT.Player) {
            initializeYTPlayers();
        }
    } else {
        console.error("GSAP or its plugins failed to load. Please check script includes.");
    }
}

document.addEventListener('loaderAnimationComplete', () => {
    initializeHomepageGallery();
});
