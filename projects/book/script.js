// --- Globální proměnná a funkce pro skrytí návodu ---
let instructionsHidden = false;

function hideInstructions() {
    if (instructionsHidden) return; // Udělá to jen jednou

    const instructionPage = document.getElementById('instruction-page');
    if (instructionPage) {
        instructionPage.classList.add('hidden');
        instructionsHidden = true; // Označíme, že je skryto
    }
}
// ----------------------------------------------------


// =================================================================
//  KONFIGURACE A GLOBÁLNÍ PROMĚNNÉ
// =================================================================

const CONFIG = {
    animationDuration: 500,
    snapDuration: 350,
    wheelSensitivity: 0.0025,
    touchSwipeThreshold: 10,
    lightboxAnimDuration: 250
};

const mediaOverlays = {
    6: { type: 'webm', src: 'assets/S3B-2_overlay.webm' },
    8: { type: 'webm', src: 'assets/360-2_overlay.webm' },
    7: { type: 'webm', src: 'assets/Piktogramy pro školu-1_overlay.webm' },
    10: { type: 'webm', src: 'assets/Piktogramy pro školu-2_overlay.webm' },
    12: { type: 'webm', src: 'assets/povalec-2_overlay.webm' },
    13: { type: 'webm', src: 'assets/busking a ztohoven-1_overlay.webm' },
    11: { type: 'webm', src: 'assets/toustak-1_overlay.webm' },
    14: { type: 'webm', src: 'assets/toustak-2_overlay.webm' },
    16: { type: 'webm', src: 'assets/ztohoven_overlay.webm' },
    18: { type: 'webm', src: 'assets/Typotrip-2_overlay.webm' },
    24: { type: 'webm', src: 'assets/city smog-2_overlay.webm' },
    26: { type: 'webm', src: 'assets/1-txt-2_overlay_1.webm' },
};

const book = document.getElementById('book');
const bookViewport = document.querySelector('.book-viewport');
const slider = document.getElementById('pageSlider');
const interactiveLayer = document.getElementById('interactive-layer');
const lightbox = document.getElementById('lightbox');
const lightboxStage = document.getElementById('lightbox-stage');
const lightboxPrevBtn = document.getElementById('lightboxPrev');
const lightboxNextBtn = document.getElementById('lightboxNext');
const lightboxReel = document.getElementById('lightbox-reel');
const papers = Array.from(document.querySelectorAll('.paper'));


const state = {
    currentSpread: 0,
    maxSpread: papers.length,
    isAnimating: false,
    touchStartX: null,
    touchStartY: null,
};

let galleryItems = [];
let spreadsWithItems = [];
let spreadItems = [];
let currentSpreadItemIndex = 0;
let isLightboxAnimating = false;

// Mapa pro ID v navigaci (musí odpovídat nav.js)
const SPREAD_TO_NAV_ID_MAP = {
    2: 'portfolio-s2',
    3: 'portfolio-s3',
    4: 'portfolio-s4',
    5: 'portfolio-s5',
    6: 'portfolio-s6',
    8: 'portfolio-s8',
    9: 'portfolio-s9',
    13: 'portfolio-s13'
};


function preloadLocalVideo(src) {
    const srcParts = src.split('.');
    const extension = srcParts[srcParts.length - 1].toLowerCase();
    if (src.startsWith('http') || extension === 'vimeo') {
        return;
    }
    fetch(src, { mode: 'no-cors', cache: 'force-cache' })
        .then(response => { })
        .catch(err => console.warn('Preload failed:', err));
}
// =================================================================


// =================================================================
//  HLAVNÍ FUNKCE KNIHY
// =================================================================

function updateBook(spread) {
    papers.forEach((paper, index) => {
        const progress = Math.max(0, Math.min(1, spread - index));
        const rotation = -progress * 180;
        paper.style.transform = `rotateY(${rotation}deg)`;
        paper.style.zIndex = spread > index ? index : state.maxSpread - index;
    });
    renderButtons(Math.floor(spread));
}

function renderButtons(spread) {
    interactiveLayer.innerHTML = '';
    const relevantButtons = buttonData.filter(btn => btn.spread === spread);

    relevantButtons.forEach(data => {
        const element = document.createElement(data.url ? 'a' : 'div');
        element.className = 'interactive-button';

        if (data.url) {
            element.href = data.url;
            element.target = '_blank';
        } else {
            element.setAttribute('role', 'button');
            const galleryIndex = galleryItems.findIndex(item => item === data);
            if (galleryIndex !== -1) {
                element.addEventListener('click', () => {
                    openLightbox(galleryIndex);
                });
            }
            if (data.mediaSrc) {
                element.addEventListener('mouseenter', () => {
                    preloadLocalVideo(data.mediaSrc);
                }, { once: true });
            }
        }
        Object.assign(element.style, data.styles);
        interactiveLayer.appendChild(element);
    });
}
// =================================================================


// =================================================================
//  LIGHTBOX (Váš kód - beze změny)
// =================================================================

function openLightbox(index) {
    const clickedItem = galleryItems[index];
    if (!clickedItem) return;
    const targetSpread = clickedItem.spread;
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
    lightboxPrevBtn.style.display = 'block';
    lightboxNextBtn.style.display = 'block';
    const currentBookSpread = Math.round(parseFloat(slider.value));
    if (targetSpread !== currentBookSpread) {
        animateTo(
            parseFloat(slider.value),
            targetSpread,
            CONFIG.animationDuration,
            () => loadSpreadItems(targetSpread, clickedItem)
        );
    } else {
        loadSpreadItems(targetSpread, clickedItem);
    }
}

function closeLightbox() {
    lightbox.classList.remove('show');
    document.body.style.overflow = '';
    lightboxStage.innerHTML = '';
    lightboxReel.innerHTML = '';
    document.getElementById('lightbox-dots').innerHTML = '';
    const overlayTexts = lightbox.querySelectorAll('.lightbox-text-overlay');
    overlayTexts.forEach(el => el.remove());
    lightbox.classList.remove('has-multiple-items');
    spreadItems = [];
    currentSpreadItemIndex = 0;
}

function setCurrentSpreadItem(index) {
    if (index < 0 || index >= spreadItems.length) {
        console.warn(`Index ${index} je mimo rozsah.`);
        return;
    }
    currentSpreadItemIndex = index;
    updateLightboxView();
}

function loadSpreadItems(spread, itemToSelect = null) {
    lightboxStage.innerHTML = '';
    lightboxReel.innerHTML = '';
    document.getElementById('lightbox-dots').innerHTML = '';
    const oldOverlayTexts = lightbox.querySelectorAll('.lightbox-text-overlay');
    oldOverlayTexts.forEach(el => el.remove());
    spreadItems = [];
    currentSpreadItemIndex = 0;
    const itemsForSpread = galleryItems.filter(item => item.spread === spread);
    itemsForSpread.forEach((itemData, index) => {
        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'lightbox-item';
        let mediaElement = null;
        let textElement = null;
        let overlayTextElement = null;
        if (itemData.mediaSrc) {
            let mediaType = '';
            let videoId = '';
            let mediaSrcPath = itemData.mediaSrc;
            const showControls = itemData.mediaControls === true;
            if (mediaSrcPath.startsWith('http')) {
                try {
                    const url = new URL(mediaSrcPath);
                    if (url.hostname.includes('vimeo.com')) {
                        mediaType = 'vimeo';
                        videoId = url.pathname.substring(1).split('/')[0];
                    } else {
                        const extension = url.pathname.split('.').pop().toLowerCase();
                        if (['mp4', 'webm', 'gif'].includes(extension)) mediaType = 'localVideo';
                        else if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(extension)) mediaType = 'image';
                    }
                } catch (e) { console.error(`Chybná URL v buttons.js: ${mediaSrcPath}`, e); }
            } else {
                const srcParts = mediaSrcPath.split('.');
                const extension = srcParts[srcParts.length - 1].toLowerCase();
                if (extension === 'vimeo') {
                    mediaType = extension;
                    videoId = mediaSrcPath.split('_').pop().split('.')[0];
                } else if (['mp4', 'webm', 'gif'].includes(extension)) {
                    mediaType = 'localVideo';
                } else {
                    mediaType = 'image';
                }
            }
            if (mediaType === 'vimeo') {
                mediaElement = document.createElement('iframe');
                let vimeoSrc = `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&autopause=0&muted=1`;
                vimeoSrc += showControls ? '&controls=1' : '&controls=0';
                if (itemData === itemToSelect || index === 0) mediaElement.src = vimeoSrc;
                mediaElement.dataset.src = vimeoSrc;
                Object.assign(mediaElement, { frameborder: '0', allow: 'autoplay; fullscreen; picture-in-picture', allowfullscreen: true });
            } else if (mediaType === 'localVideo') {
                mediaElement = document.createElement('video');
                mediaElement.src = mediaSrcPath;
                mediaElement.dataset.src = mediaSrcPath;
                const videoProps = { autoplay: false, loop: true, muted: true, playsInline: true, controls: showControls, preload: 'auto' };
                Object.assign(mediaElement, videoProps);
            } else if (mediaType === 'image') {
                mediaElement = document.createElement('img');
                mediaElement.src = mediaSrcPath;
            }
            if (mediaElement) mediaElement.className = 'lightbox-media';
        }
        if (itemData.text) {
            if (mediaElement) {
                overlayTextElement = document.createElement('div');
                overlayTextElement.className = 'lightbox-text-overlay';
                overlayTextElement.innerHTML = itemData.text.replace(/\n/g, '<br>');
                overlayTextElement.dataset.index = index;
            } else {
                textElement = document.createElement('div');
                textElement.className = 'lightbox-text';
                textElement.innerHTML = itemData.text.replace(/\n/g, '<br>');
            }
        }
        if (mediaElement) itemWrapper.appendChild(mediaElement);
        else if (textElement) itemWrapper.appendChild(textElement);
        if (mediaElement || textElement) {
            lightboxStage.appendChild(itemWrapper);
            spreadItems.push(itemWrapper);
            if (itemData === itemToSelect) currentSpreadItemIndex = index;
        }
        if (overlayTextElement) lightbox.appendChild(overlayTextElement);
        if (mediaElement || textElement) {
            const thumb = document.createElement('button');
            thumb.className = 'reel-thumbnail';
            thumb.dataset.index = index;
            thumb.setAttribute('aria-label', `Zobrazit položku ${index + 1}`);
            if (itemData.mediaSrc) {
                let thumbMediaType = '';
                const mediaSrc = itemData.mediaSrc;
                if (mediaSrc.startsWith('http')) {
                    if (mediaSrc.includes('vimeo.com')) thumbMediaType = 'vimeo';
                    else {
                        const ext = mediaSrc.split('.').pop().toLowerCase();
                        if (['mp4', 'webm', 'gif'].includes(ext)) thumbMediaType = 'localVideo';
                        else if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) thumbMediaType = 'image';
                    }
                } else {
                    const ext = mediaSrc.split('.').pop().toLowerCase();
                    if (ext === 'vimeo') thumbMediaType = ext;
                    else if (['mp4', 'webm', 'gif'].includes(ext)) thumbMediaType = 'localVideo';
                    else thumbMediaType = 'image';
                }
                if (thumbMediaType === 'image') {
                    const img = document.createElement('img');
                    img.src = mediaSrc;
                    img.alt = `Náhled ${index + 1}`;
                    thumb.appendChild(img);
                } else if (thumbMediaType === 'localVideo') {
                    const vid = document.createElement('video');
                    vid.src = mediaSrc;
                    Object.assign(vid, { muted: true, preload: "metadata", disablePictureInPicture: true, playsInline: true });
                    thumb.appendChild(vid);
                } else if (thumbMediaType === 'vimeo') {
                    thumb.innerHTML = '<span>VIDEO</span>';
                    thumb.classList.add('is-placeholder');
                }
            } else if (itemData.text) {
                thumb.innerHTML = '<span>TEXT</span>';
                thumb.classList.add('is-placeholder');
            }
            thumb.addEventListener('click', () => setCurrentSpreadItem(index));
            lightboxReel.appendChild(thumb);
        }
    });
    const dotsContainer = document.getElementById('lightbox-dots');
    dotsContainer.innerHTML = '';
    if (spreadItems.length > 1) {
        spreadItems.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'lightbox-dot';
            dot.dataset.index = index;
            dot.setAttribute('aria-label', `Zobrazit položku ${index + 1}`);
            dot.addEventListener('click', () => setCurrentSpreadItem(index));
            dotsContainer.appendChild(dot);
        });
    }
    if (spreadItems.length > 1) lightbox.classList.add('has-multiple-items');
    else lightbox.classList.remove('has-multiple-items');
    updateLightboxView();
}

function updateLightboxView() {
    if (spreadItems.length === 0) return;
    const prevIndex = (currentSpreadItemIndex - 1 + spreadItems.length) % spreadItems.length;
    const nextIndex = (currentSpreadItemIndex + 1) % spreadItems.length;
    spreadItems.forEach((item, index) => {
        item.classList.remove('active', 'prev', 'next');
        const video = item.querySelector('video');
        const iframe = item.querySelector('iframe');
        if (index === currentSpreadItemIndex) {
            item.classList.add('active');
            if (video) video.play().catch(e => console.log("Autoplay byl zablokován prohlížečem."));
            if (iframe) {
                const currentSrc = iframe.dataset.src;
                if (currentSrc && iframe.src !== currentSrc) iframe.src = currentSrc;
            }
        } else if (index === prevIndex && spreadItems.length > 1) {
            item.classList.add('prev');
            if (video) video.pause();
            if (iframe) iframe.src = '';
        } else if (index === nextIndex && spreadItems.length > 1) {
            item.classList.add('next');
            if (video) video.pause();
            if (iframe) iframe.src = '';
        } else {
            if (video) video.pause();
            if (iframe) iframe.src = '';
        }
    });
    const thumbnails = document.querySelectorAll('.reel-thumbnail');
    thumbnails.forEach((thumb, index) => {
        if (index === currentSpreadItemIndex) {
            thumb.classList.add('active');
            thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            thumb.classList.remove('active');
        }
    });
    const dots = document.querySelectorAll('.lightbox-dot');
    dots.forEach((dot, index) => {
        if (index === currentSpreadItemIndex) dot.classList.add('active');
        else dot.classList.remove('active');
    });
    const overlayTexts = lightbox.querySelectorAll('.lightbox-text-overlay');
    overlayTexts.forEach(textEl => {
        const textIndex = parseInt(textEl.dataset.index, 10);
        if (textIndex === currentSpreadItemIndex) textEl.classList.add('active');
        else textEl.classList.remove('active');
    });
}

function changeSpreadItem(direction) {
    if (isLightboxAnimating || spreadItems.length <= 1) return;
    isLightboxAnimating = true;
    currentSpreadItemIndex = (currentSpreadItemIndex + direction + spreadItems.length) % spreadItems.length;
    updateLightboxView();
    setTimeout(() => { isLightboxAnimating = false; }, CONFIG.lightboxAnimDuration);
}


// =================================================================
//  ZPRACOVÁNÍ VSTUPU A UDÁLOSTÍ
// =================================================================

//
// === OPRAVENÁ FUNKCE setupEventListeners ===
//
function setupEventListeners() {
    slider.addEventListener('input', () => updateBook(parseFloat(slider.value)));
    slider.addEventListener('change', () => {
        const currentValue = parseFloat(slider.value);
        const targetSpread = Math.round(currentValue);
        if (Math.abs(currentValue - targetSpread) > 0.001) {
            // Tady voláme animateTo, které už v sobě má logiku pro nav.js
            animateTo(currentValue, targetSpread, CONFIG.snapDuration);
        }
    });

    document.getElementById('arrowLeft').addEventListener('click', () => changeSpread(-1));
    document.getElementById('arrowRight').addEventListener('click', () => changeSpread(1));

    document.addEventListener('keydown', (event) => {
        if (lightbox.classList.contains('show')) {
            if (event.key === 'ArrowLeft') findNextSpreadWithItems(-1);
            if (event.key === 'ArrowRight') findNextSpreadWithItems(1);
            if (event.key === 'ArrowUp') changeSpreadItem(-1);
            if (event.key === 'ArrowDown') changeSpreadItem(1);
            if (event.key === 'Escape') closeLightbox();
        } else {
            if (event.key === 'ArrowLeft') changeSpread(-1);
            if (event.key === 'ArrowRight') changeSpread(1);
        }
    });

    // === PŘIDÁNO: Listener pro kliknutí na navigaci ===
    // Toto řeší problém 2 a 5: Kliknutí na odkaz v liště přetočí knihu plynule
    window.addEventListener('hashchange', () => {
        const hash = location.hash;
        let targetSpread = 0;
        if (hash.startsWith('#spread=')) {
            targetSpread = parseInt(hash.substring(8), 10);
            if (isNaN(targetSpread)) targetSpread = 0;
        }

        // Přejdeme na dvoustranu, pouze pokud už tam nejsme
        // Použijeme parseFloat pro přesné porovnání
        if (Math.abs(parseFloat(slider.value) - targetSpread) > 0.01) {
            animateTo(parseFloat(slider.value), targetSpread, CONFIG.animationDuration);
        }
    });
    // === KONEC PŘIDÁNÍ ===

    setupLightboxControls();
    setupWheel();
    setupTouchGestures();
}

function findNextSpreadWithItems(direction) {
    if (state.isAnimating || spreadsWithItems.length === 0) return;
    const currentBookSpread = Math.round(parseFloat(slider.value));
    let currentSpreadIndex = spreadsWithItems.indexOf(currentBookSpread);
    let nextSpreadIndex;
    if (currentSpreadIndex === -1) {
        if (direction > 0) {
            nextSpreadIndex = spreadsWithItems.findIndex(s => s > currentBookSpread);
            if (nextSpreadIndex === -1) nextSpreadIndex = 0;
        } else {
            const reversedIndex = [...spreadsWithItems].reverse().findIndex(s => s < currentBookSpread);
            if (reversedIndex === -1) nextSpreadIndex = spreadsWithItems.length - 1;
            else nextSpreadIndex = spreadsWithItems.length - 1 - reversedIndex;
        }
    } else {
        nextSpreadIndex = (currentSpreadIndex + direction + spreadsWithItems.length) % spreadsWithItems.length;
    }
    const targetSpread = spreadsWithItems[nextSpreadIndex];
    if (targetSpread !== currentBookSpread) {
        loadSpreadItems(targetSpread, null);
        animateTo(parseFloat(slider.value), targetSpread, CONFIG.animationDuration, null);
    }
}


function changeSpread(delta) {
    if (state.isAnimating) return;
    const current = Math.round(parseFloat(slider.value));
    const target = Math.max(0, Math.min(state.maxSpread, current + delta));
    if (current !== target) {
        animateTo(parseFloat(slider.value), target, CONFIG.animationDuration);
    }
}

//
// === OPRAVENÁ FUNKCE animateTo ===
//
function animateTo(start, end, duration, onCompleteCallback = null) {
    // Povolí animaci s délkou 0 (pro start)
    if (state.isAnimating && duration > 0) return;
    state.isAnimating = true;
    const startTime = performance.now();

    const frame = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = (duration === 0) ? 1 : Math.min(elapsed / duration, 1); // Okamžitý skok při 0ms
        const ease = 0.5 * (1 - Math.cos(Math.PI * progress));
        const currentVal = (duration === 0) ? end : (start + (end - start) * ease);

        slider.value = currentVal;
        updateBook(currentVal);

        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            state.isAnimating = false;
            slider.value = end;
            updateBook(end);
            renderButtons(end);

            // === TOTO JE KLÍČOVÁ ZMĚNA ===
            const roundedEnd = Math.round(end);
            // Aktualizujeme hash v URL, pouze pokud není voláno z 'hashchange'
            // (prevence smyčky). `history.replaceState` je bezpečnější.
            if (location.hash !== `#spread=${roundedEnd}`) {
                history.replaceState(null, '', `#spread=${roundedEnd}`);
            }

            // Použijeme globální mapu
            const activeNavID = SPREAD_TO_NAV_ID_MAP[roundedEnd] || 'portfolio';

            // Znovu vykreslíme navigaci s novým aktivním ID
            createNav('../../', activeNavID);
            // === KONEC ZMĚNY ===

            if (onCompleteCallback) {
                onCompleteCallback();
            }
        }
    };
    requestAnimationFrame(frame);
}

function setupWheel() {
    let wheelAccumulator = 0;
    let isWheelAnimating = false;
    bookViewport.addEventListener('wheel', event => {
        event.preventDefault();
        wheelAccumulator += event.deltaY * CONFIG.wheelSensitivity;
        if (!isWheelAnimating) {
            isWheelAnimating = true;
            animateWheel();
        }
    }, { passive: false });

    function animateWheel() {
        if (Math.abs(wheelAccumulator) < 0.001) {
            isWheelAnimating = false;
            const target = Math.round(parseFloat(slider.value));
            // Tady voláme animateTo, které už v sobě má logiku pro nav.js
            animateTo(parseFloat(slider.value), target, CONFIG.snapDuration);
            return;
        }
        const current = parseFloat(slider.value);
        const step = wheelAccumulator * 0.15;
        wheelAccumulator -= step;
        const nextVal = Math.max(0, Math.min(state.maxSpread, current + step));
        slider.value = nextVal;
        updateBook(nextVal);
        requestAnimationFrame(animateWheel);
    }
}

function setupTouchGestures() {
    bookViewport.addEventListener('touchstart', (event) => {
        state.touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });
    bookViewport.addEventListener('touchend', (event) => {
        if (state.touchStartX === null) return;
        const touchEndX = event.changedTouches[0].screenX;
        const deltaX = touchEndX - state.touchStartX;
        if (Math.abs(deltaX) > CONFIG.touchSwipeThreshold) {
            changeSpread(deltaX < 0 ? 1 : -1);
        }
        state.touchStartX = null;
    });
}

function setupLightboxWheel() {
    let isWheeling = false;
    let wheelGestureTimeout = null;
    const WHEEL_GESTURE_END_DELAY = 50;
    lightbox.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (wheelGestureTimeout) clearTimeout(wheelGestureTimeout);
        wheelGestureTimeout = setTimeout(() => { isWheeling = false; wheelGestureTimeout = null; }, WHEEL_GESTURE_END_DELAY);
        if (!isWheeling && !isLightboxAnimating && !state.isAnimating) {
            const deltaY = e.deltaY, deltaX = e.deltaX, absY = Math.abs(deltaY), absX = Math.abs(deltaX), threshold = 1;
            if (absY > absX && absY > threshold) {
                isWheeling = true;
                if (deltaY > threshold) changeSpreadItem(1);
                else if (deltaY < -threshold) changeSpreadItem(-1);
                else isWheeling = false;
            }
        }
    }, { passive: false });
}

function setupLightboxTouchGestures() {
    lightbox.addEventListener('touchmove', (event) => { event.preventDefault(); }, { passive: false });
    lightboxStage.addEventListener('touchstart', (event) => {
        state.touchStartX = event.changedTouches[0].screenX;
        state.touchStartY = event.changedTouches[0].screenY;
    }, { passive: true });
    lightboxStage.addEventListener('touchend', (event) => {
        if (state.touchStartX === null || state.touchStartY === null) {
            state.touchStartX = null;
            state.touchStartY = null;
            return;
        }
        const touchEndX = event.changedTouches[0].screenX, touchEndY = event.changedTouches[0].screenY;
        const deltaX = touchEndX - state.touchStartX, deltaY = touchEndY - state.touchStartY;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > CONFIG.touchSwipeThreshold) findNextSpreadWithItems(deltaX < 0 ? 1 : -1);
        } else {
            if (Math.abs(deltaY) > CONFIG.touchSwipeThreshold) changeSpreadItem(deltaY < 0 ? 1 : -1);
        }
        state.touchStartX = null;
        state.touchStartY = null;
    });
}

function setupLightboxControls() {
    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    lightboxPrevBtn.addEventListener('click', () => findNextSpreadWithItems(-1));
    lightboxNextBtn.addEventListener('click', () => findNextSpreadWithItems(1));
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox || event.target === lightboxStage) closeLightbox();
    });
    setupLightboxWheel();
    setupLightboxTouchGestures();
}

function wrapPageImages() { document.querySelectorAll(".page-image").forEach(e => { const t = document.createElement("div"); t.className = "page-image-wrapper", e.parentNode.insertBefore(t, e), t.appendChild(e) }) }
function setupMediaOverlays() { for (const e in mediaOverlays) { const t = mediaOverlays[e], o = document.querySelector(`#p${Math.floor((e - 1) / 2)} ${e % 2 != 0 ? ".back" : ".front"} .page-image-wrapper`); if (o) { const n = document.createElement("video"); n.className = "media-overlay", Object.assign(n, { src: t.src, autoplay: !0, muted: !0, loop: !0, playsInline: !0 }), o.appendChild(n) } } }

// =================================================================
//  SPUŠTĚNÍ APLIKACE
// =================================================================

//
// === OPRAVENÁ FUNKCE main ===
//
function main() {
    // === DYNAMICKÉ VOLÁNÍ NAVIGACE ===
    const hash = location.hash;
    let initialSpread = 0;
    let activeNavID = 'portfolio'; // Výchozí

    if (hash.startsWith('#spread=')) {
        initialSpread = parseInt(hash.substring(8), 10);
        if (isNaN(initialSpread)) initialSpread = 0;
    }

    // Zjistíme ID hned při startu
    activeNavID = SPREAD_TO_NAV_ID_MAP[initialSpread] || 'portfolio';

    // Volání navigace se SPRÁVNÝM ID
    createNav('../../', activeNavID);
    // ===================================

    galleryItems = buttonData
        .filter(item => !item.url)
        .sort((a, b) => a.spread - b.spread);

    const itemSpreads = new Set(galleryItems.map(item => item.spread));
    spreadsWithItems = [...itemSpreads].sort((a, b) => a - b);

    slider.min = 0;
    slider.max = state.maxSpread;
    wrapPageImages();
    setupMediaOverlays();
    setupEventListeners(); // Toto nyní zahrnuje 'hashchange' listener

    if (initialSpread > 0) {
        // Použijeme animateTo s nulovou délkou pro okamžitý skok
        animateTo(0, initialSpread, 0);
    } else {
        updateBook(0);
        renderButtons(0);
    }
}

document.addEventListener('DOMContentLoaded', main);