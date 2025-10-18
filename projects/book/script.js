// =================================================================
//  KONFIGURACE A GLOBÁLNÍ PROMĚNNÉ
// =================================================================

const CONFIG = {
    animationDuration: 800,
    snapDuration: 500,
    wheelSensitivity: 0.0025,
    touchSwipeThreshold: 50,
    lightboxAnimDuration: 400, // Doba animace přechodu v lightboxu (ms)
    lightboxWheelThrottle: 500 // Omezení pro kolečko myši (ms)
};

const mediaOverlays = {
    5: { type: 'webm', src: 'assets/page-5-overlay.webm' },
    7: { type: 'webm', src: 'assets/page-7-overlay.webm' }
};

// ... (získání DOM elementů book, bookViewport, atd.) ...
const book = document.getElementById('book');
const bookViewport = document.querySelector('.book-viewport');
const slider = document.getElementById('pageSlider');
const interactiveLayer = document.getElementById('interactive-layer');
const lightbox = document.getElementById('lightbox');
const lightboxStage = document.getElementById('lightbox-stage');
const lightboxPrevBtn = document.getElementById('lightboxPrev');
const lightboxNextBtn = document.getElementById('lightboxNext');
const papers = Array.from(document.querySelectorAll('.paper'));


const state = {
    currentSpread: 0,
    maxSpread: papers.length,
    isAnimating: false,
    touchStartX: null,
    touchStartY: null, // <-- PŘIDÁNO: Pro vertikální swipe
};

let galleryItems = []; // Všechny položky galerie (z buttons.js)
let spreadsWithItems = []; // Pole čísel dvoustran, které mají položky

// --- Stav lightboxu ---
let spreadItems = []; // DOM elementy položek na *aktuální* dvoustraně
let currentSpreadItemIndex = 0; // Index aktivní položky v poli spreadItems
let isLightboxAnimating = false; // Zabraňuje spamování kolečkem myši

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
        }
        Object.assign(element.style, data.styles);
        interactiveLayer.appendChild(element);
    });
}

// =================================================================
//  LIGHTBOX (NOVÝ KOLOTOČ)
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
            () => loadSpreadItems(targetSpread, clickedItem) // Callback po dokončení
        );
    } else {
        loadSpreadItems(targetSpread, clickedItem);
    }
}

function closeLightbox() {
    lightbox.classList.remove('show');
    document.body.style.overflow = '';
    lightboxStage.innerHTML = ''; // Vyčistíme obsah
    spreadItems = []; // Resetujeme stav
    currentSpreadItemIndex = 0;
}

/**
 * Načte všechny položky pro danou dvoustranu do lightboxu
 * a připraví je pro zobrazení.
 */
function loadSpreadItems(spread, itemToSelect = null) {
    lightboxStage.innerHTML = '';
    spreadItems = [];
    currentSpreadItemIndex = 0;

    const itemsForSpread = galleryItems.filter(item => item.spread === spread);

    itemsForSpread.forEach((itemData, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'lightbox-item';

        let element = null;

        if (itemData.text) {
            element = document.createElement('div');
            element.className = 'lightbox-text';
            element.innerHTML = itemData.text.replace(/\n/g, '<br>');
        } else if (itemData.mediaSrc) {
            const srcParts = itemData.mediaSrc.split('.');
            const type = srcParts[srcParts.length - 1];
            const isVimeo = type === 'vimeo';

            if (isVimeo) {
                const vimeoId = itemData.mediaSrc.split('_').pop().split('.')[0];
                element = document.createElement('iframe');
                element.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&autopause=0&muted=1`;
                Object.assign(element, { frameborder: '0', allow: 'autoplay; fullscreen; picture-in-picture', allowfullscreen: true });
            } else {
                const isVideo = ['mp4', 'webm', 'gif'].includes(type);
                element = document.createElement(isVideo ? 'video' : 'img');
                element.src = itemData.mediaSrc;
                if (isVideo) {
                    Object.assign(element, { autoplay: false, loop: true, muted: true, playsInline: true });
                }
            }
            element.className = 'lightbox-media';
        }

        if (element) {
            wrapper.appendChild(element);
            lightboxStage.appendChild(wrapper);
            spreadItems.push(wrapper);

            if (itemData === itemToSelect) {
                currentSpreadItemIndex = index;
            }
        }
    });

    // Zobrazíme položky ve správných pozicích
    updateLightboxView();
}

/**
 * Aktualizuje zobrazení v lightboxu (aplikuje třídy active, prev, next)
 */
function updateLightboxView() {
    if (spreadItems.length === 0) return;

    const prevIndex = (currentSpreadItemIndex - 1 + spreadItems.length) % spreadItems.length;
    const nextIndex = (currentSpreadItemIndex + 1) % spreadItems.length;

    spreadItems.forEach((item, index) => {
        item.classList.remove('active', 'prev', 'next');
        const video = item.querySelector('video');

        if (index === currentSpreadItemIndex) {
            item.classList.add('active');
            if (video) video.play().catch(e => console.log("Autoplay byl zablokován prohlížečem."));
        } else if (index === prevIndex && spreadItems.length > 1) {
            item.classList.add('prev');
            if (video) video.pause();
        } else if (index === nextIndex && spreadItems.length > 1) {
            item.classList.add('next');
            if (video) video.pause();
        } else {
            if (video) video.pause();
        }
    });
}

/**
 * Přepne na další/předchozí POLOŽKU na *stejné* dvoustraně
 */
function changeSpreadItem(direction) {
    if (isLightboxAnimating || spreadItems.length <= 1) return;

    isLightboxAnimating = true;
    currentSpreadItemIndex = (currentSpreadItemIndex + direction + spreadItems.length) % spreadItems.length;

    updateLightboxView();

    setTimeout(() => {
        isLightboxAnimating = false;
    }, CONFIG.lightboxAnimDuration); // Musí odpovídat CSS přechodu
}


// =================================================================
//  ZPRACOVÁNÍ VSTUPU A UDÁLOSTÍ
// =================================================================

function setupEventListeners() {
    slider.addEventListener('input', () => updateBook(parseFloat(slider.value)));
    slider.addEventListener('change', () => {
        const currentValue = parseFloat(slider.value);
        const targetSpread = Math.round(currentValue);
        if (Math.abs(currentValue - targetSpread) > 0.001) {
            animateTo(currentValue, targetSpread, CONFIG.snapDuration);
        }
    });

    document.getElementById('arrowLeft').addEventListener('click', () => changeSpread(-1));
    document.getElementById('arrowRight').addEventListener('click', () => changeSpread(1));

    document.addEventListener('keydown', (event) => {
        if (lightbox.classList.contains('show')) {
            // --- Nová logika pro lightbox ---
            if (event.key === 'ArrowLeft') findNextSpreadWithItems(-1);
            if (event.key === 'ArrowRight') findNextSpreadWithItems(1);
            if (event.key === 'ArrowUp') changeSpreadItem(-1);
            if (event.key === 'ArrowDown') changeSpreadItem(1);
            if (event.key === 'Escape') closeLightbox();
        } else {
            // Původní chování, když je lightbox zavřený
            if (event.key === 'ArrowLeft') changeSpread(-1);
            if (event.key === 'ArrowRight') changeSpread(1);
        }
    });

    setupLightboxControls();
    setupWheel();
    setupTouchGestures(); // Ponecháváme pro knihu
}

/**
 * Přepne na další/předchozí DVOUSTRANU, která obsahuje položky.
 */
function findNextSpreadWithItems(direction) {
    if (state.isAnimating || spreadsWithItems.length === 0) return;

    const currentBookSpread = Math.round(parseFloat(slider.value));
    let currentSpreadIndex = spreadsWithItems.indexOf(currentBookSpread);
    let nextSpreadIndex;

    if (currentSpreadIndex === -1) {
        if (direction > 0) {
            nextSpreadIndex = spreadsWithItems.findIndex(s => s > currentBookSpread);
            if (nextSpreadIndex === -1) nextSpreadIndex = 0; // Přejít na začátek
        } else {
            const reversedIndex = [...spreadsWithItems].reverse().findIndex(s => s < currentBookSpread);
            if (reversedIndex === -1) nextSpreadIndex = spreadsWithItems.length - 1; // Přejít na konec
            else nextSpreadIndex = spreadsWithItems.length - 1 - reversedIndex;
        }
    } else {
        nextSpreadIndex = (currentSpreadIndex + direction + spreadsWithItems.length) % spreadsWithItems.length;
    }

    const targetSpread = spreadsWithItems[nextSpreadIndex];

    if (targetSpread !== currentBookSpread) {
        loadSpreadItems(targetSpread, null);

        animateTo(
            parseFloat(slider.value),
            targetSpread,
            CONFIG.animationDuration,
            () => { } // Prázdný "do nothing" callback
        );
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

function animateTo(start, end, duration, onCompleteCallback = null) {
    if (state.isAnimating) return;
    state.isAnimating = true;
    const startTime = performance.now();
    const frame = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 0.5 * (1 - Math.cos(Math.PI * progress));
        const currentVal = start + (end - start) * ease;
        slider.value = currentVal;
        updateBook(currentVal);
        if (progress < 1) requestAnimationFrame(frame);
        else {
            state.isAnimating = false;
            slider.value = end;
            updateBook(end);
            renderButtons(end);
            history.pushState(null, '', `#spread=${end}`);

            if (onCompleteCallback) {
                onCompleteCallback();
            } else if (lightbox.classList.contains('show')) {
                loadSpreadItems(end, null);
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

// Gesta pro otáčení stránek knihy
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

/**
 * Přidá ovládání pro kolečko myši uvnitř lightboxu
 */
function setupLightboxWheel() {
    let lastWheelTime = 0;
    lightbox.addEventListener('wheel', (event) => {
        event.preventDefault(); // Zabrání skrolování stránky
        const now = Date.now();

        if (now - lastWheelTime < CONFIG.lightboxWheelThrottle || isLightboxAnimating) {
            return;
        }
        lastWheelTime = now;

        const direction = event.deltaY > 0 ? 1 : -1; // 1 = dolů, -1 = nahoru
        changeSpreadItem(direction);

    }, { passive: false });
}

/**
 * === UPRAVENÁ FUNKCE ===
 * Přidá ovládání gesty (swipe nahoru/dolů A ze strany na stranu) uvnitř lightboxu
 */
function setupLightboxTouchGestures() {
    // Zabráníme skrolování/bounce efektu na mobilu, když je lightbox otevřený
    lightbox.addEventListener('touchmove', (event) => {
        event.preventDefault();
    }, { passive: false });

    // Posloucháme na 'stage', kde jsou média
    lightboxStage.addEventListener('touchstart', (event) => {
        // Uložíme X i Y pozici
        state.touchStartX = event.changedTouches[0].screenX;
        state.touchStartY = event.changedTouches[0].screenY;
    }, { passive: true });

    lightboxStage.addEventListener('touchend', (event) => {
        // Zkontrolujeme, zda máme startovní pozice
        if (state.touchStartX === null || state.touchStartY === null) {
            // Resetujeme pro jistotu obě
            state.touchStartX = null;
            state.touchStartY = null;
            return;
        }

        // Získáme koncové pozice
        const touchEndX = event.changedTouches[0].screenX;
        const touchEndY = event.changedTouches[0].screenY;

        // Vypočítáme rozdíly
        const deltaX = touchEndX - state.touchStartX;
        const deltaY = touchEndY - state.touchStartY;

        // Zjistíme, který směr byl dominantní
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // === HORIZONTÁLNÍ SWIPE (měníme DVOUSTRANU) ===
            if (Math.abs(deltaX) > CONFIG.touchSwipeThreshold) {
                // deltaX < 0 = swipe doleva (chceme další dvoustranu, index +1)
                // deltaX > 0 = swipe doprava (chceme předchozí dvoustranu, index -1)
                findNextSpreadWithItems(deltaX < 0 ? 1 : -1);
            }
        } else {
            // === VERTIKÁLNÍ SWIPE (měníme POLOŽKU na dvoustraně) ===
            if (Math.abs(deltaY) > CONFIG.touchSwipeThreshold) {
                // deltaY < 0 = swipe nahoru (chceme další item, index +1)
                // deltaY > 0 = swipe dolů (chceme předchozí item, index -1)
                changeSpreadItem(deltaY < 0 ? 1 : -1);
            }
        }

        // Resetujeme obě startovní pozice
        state.touchStartX = null;
        state.touchStartY = null;
    });
}


function setupLightboxControls() {
    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);

    lightboxPrevBtn.addEventListener('click', () => findNextSpreadWithItems(-1));
    lightboxNextBtn.addEventListener('click', () => findNextSpreadWithItems(1));

    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    setupLightboxWheel();
    setupLightboxTouchGestures(); // <-- ZDE SE VOLÁ UPRAVENÁ FUNKCE
}

function wrapPageImages() { document.querySelectorAll(".page-image").forEach(e => { const t = document.createElement("div"); t.className = "page-image-wrapper", e.parentNode.insertBefore(t, e), t.appendChild(e) }) }
function setupMediaOverlays() { for (const e in mediaOverlays) { const t = mediaOverlays[e], o = document.querySelector(`#p${Math.floor((e - 1) / 2)} ${e % 2 != 0 ? ".back" : ".front"} .page-image-wrapper`); if (o) { const n = document.createElement("video"); n.className = "media-overlay", Object.assign(n, { src: t.src, autoplay: !0, muted: !0, loop: !0, playsInline: !0 }), o.appendChild(n) } } }

// =================================================================
//  SPUŠTĚNÍ APLIKACE
// =================================================================

function main() {
    createNav('../../', 'portfolio');

    galleryItems = buttonData
        .filter(item => !item.url)
        .sort((a, b) => a.spread - b.spread);

    // Vytvoříme seznam dvoustran, které mají obsah
    const itemSpreads = new Set(galleryItems.map(item => item.spread));
    spreadsWithItems = [...itemSpreads].sort((a, b) => a - b);

    slider.min = 0;
    slider.max = state.maxSpread;
    wrapPageImages();
    setupMediaOverlays();
    setupEventListeners();

    const hash = location.hash;
    let initialSpread = 0;
    if (hash.startsWith('#spread=')) {
        const spreadFromUrl = parseInt(hash.substring(8), 10);
        if (!isNaN(spreadFromUrl) && spreadFromUrl >= 0 && spreadFromUrl <= state.maxSpread) {
            initialSpread = spreadFromUrl;
        }
    }
    slider.value = initialSpread;
    updateBook(initialSpread);
}

document.addEventListener('DOMContentLoaded', main);