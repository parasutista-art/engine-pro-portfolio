// =================================================================
//  KONFIGURACE A GLOBÁLNÍ PROMĚNNÉ
// =================================================================

const CONFIG = {
    animationDuration: 500,
    snapDuration: 350,
    wheelSensitivity: 0.0025,
    touchSwipeThreshold: 10,
    lightboxAnimDuration: 250 // Doba animace přechodu v lightboxu (ms)
};

// Zde vyčištěno, protože původní názvy video souborů nesedí k novým stránkám
const mediaOverlays = {};

// --- PŘIDÁNO: GENERÁTOR DAT (Náhrada za buttons.js) ---
// Protože nemáme soubor buttons.js, vygenerujeme data z HTML, 
// aby fungovala lišta v lightboxu a skript nehlásil chybu.
let buttonData = [];

function generateButtonDataFromDOM() {
    const papers = document.querySelectorAll('.paper');
    const data = [];

    papers.forEach((paper, index) => {
        // Získáme obrázky z přední a zadní strany
        const frontImg = paper.querySelector('.front .page-image');
        const backImg = paper.querySelector('.back .page-image');

        // Přední strana (sudá stránka v knize, ale index 0 je zavřená kniha)
        if (frontImg) {
            data.push({
                spread: index, // Spread odpovídá indexu papíru
                mediaSrc: frontImg.getAttribute('src'),
                text: frontImg.getAttribute('alt') || ''
            });
        }

        // Zadní strana (lichá stránka)
        // V logice otáčení: back strana papíru X se zobrazí vlevo na spreadu X+1
        if (backImg) {
            data.push({
                spread: index + 1,
                mediaSrc: backImg.getAttribute('src'),
                text: backImg.getAttribute('alt') || ''
            });
        }
    });

    return data.sort((a, b) => a.spread - b.spread);
}
// -------------------------------------------------------


// ... (získání DOM elementů book, bookViewport, atd.) ...
const book = document.getElementById('book');
const bookViewport = document.querySelector('.book-viewport');
const slider = document.getElementById('pageSlider');
const interactiveLayer = document.getElementById('interactive-layer');
const lightbox = document.getElementById('lightbox');
const lightboxStage = document.getElementById('lightbox-stage');
const lightboxPrevBtn = document.getElementById('lightboxPrev');
const lightboxNextBtn = document.getElementById('lightboxNext');
const lightboxReel = document.getElementById('lightbox-reel');

// !!! DŮLEŽITÉ: papers načítáme až v main(), protože teď jich je víc a generují se
let papers = [];

const state = {
    currentSpread: 0,
    maxSpread: 0, // Bude nastaveno dynamicky
    isAnimating: false,
    touchStartX: null,
    touchStartY: null, // Pro vertikální swipe
};

let galleryItems = []; // Všechny položky galerie
let spreadsWithItems = []; // Pole čísel dvoustran, které mají položky

// --- Stav lightboxu ---
let spreadItems = []; // DOM elementy položek na *aktuální* dvoustraně
let currentSpreadItemIndex = 0; // Index aktivní položky v poli spreadItems
let isLightboxAnimating = false; // Zabraňuje spamování kolečkem myši

// === PŘIDÁNO: NOVÁ FUNKCE PRO PŘEDNAČTENÍ LOKÁLNÍCH VIDEÍ ===
function preloadLocalVideo(src) {
    if (!src) return;
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

let lastRenderedSpread = -1; // Optimalizace vykreslování

function updateBook(spread) {
    papers.forEach((paper, index) => {
        const progress = Math.max(0, Math.min(1, spread - index));
        const rotation = -progress * 180;
        paper.style.transform = `rotateY(${rotation}deg)`;
        paper.style.zIndex = spread > index ? index : state.maxSpread - index;
    });

    // OPTIMALIZACE: Překreslit tlačítka pouze pokud se změnila celá stránka
    // Toto zabrání sekání při animaci
    const currentFloorSpread = Math.floor(spread);
    if (currentFloorSpread !== lastRenderedSpread) {
        renderButtons(currentFloorSpread);
        lastRenderedSpread = currentFloorSpread;
    }
}

function renderButtons(spread) {
    interactiveLayer.innerHTML = '';
    // Používáme galleryItems místo buttonData, protože data jsme si vygenerovali
    const relevantButtons = galleryItems.filter(btn => Math.floor(btn.spread) === spread);

    relevantButtons.forEach(data => {
        const element = document.createElement(data.url ? 'a' : 'div');
        element.className = 'interactive-button';

        if (data.url) {
            element.href = data.url;
            element.target = '_blank';
        } else {
            element.setAttribute('role', 'button');
            // Najdeme index v poli galleryItems
            const galleryIndex = galleryItems.indexOf(data);
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
        // Pokud nejsou definované styly (což u generovaných nejsou), nastavíme defaultní plochu
        if (data.styles) {
            Object.assign(element.style, data.styles);
        } else {
            // Neviditelné tlačítko přes celou stránku pro kliknutí
            element.style.position = 'absolute';
            element.style.top = '0';
            element.style.left = '0';
            element.style.width = '100%';
            element.style.height = '100%';
            element.style.cursor = 'pointer';
        }

        interactiveLayer.appendChild(element);
    });
}
// =================================================================


// =================================================================
//  LIGHTBOX
// =================================================================

function openLightbox(index) {
    const clickedItem = galleryItems[index];
    if (!clickedItem) return;

    const targetSpread = clickedItem.spread;

    lightbox.classList.add('show'); // Původní třída
    lightbox.classList.add('active'); // Pro jistotu (v CSS může být obojí)
    document.body.style.overflow = 'hidden';

    lightboxPrevBtn.style.display = 'block';
    lightboxNextBtn.style.display = 'block';

    const currentBookSpread = Math.round(parseFloat(slider.value));

    if (Math.abs(targetSpread - currentBookSpread) > 0.5) {
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
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxStage.innerHTML = '';
    lightboxReel.innerHTML = '';
    const dots = document.getElementById('lightbox-dots');
    if (dots) dots.innerHTML = '';

    const overlayTexts = lightbox.querySelectorAll('.lightbox-text-overlay');
    overlayTexts.forEach(el => el.remove());

    lightbox.classList.remove('has-multiple-items');

    spreadItems = [];
    currentSpreadItemIndex = 0;
}


function setCurrentSpreadItem(index) {
    if (index < 0 || index >= spreadItems.length) {
        return;
    }
    currentSpreadItemIndex = index;
    updateLightboxView();
}


function loadSpreadItems(spread, itemToSelect = null) {
    lightboxStage.innerHTML = '';
    lightboxReel.innerHTML = '';
    const dots = document.getElementById('lightbox-dots');
    if (dots) dots.innerHTML = '';

    const oldOverlayTexts = lightbox.querySelectorAll('.lightbox-text-overlay');
    oldOverlayTexts.forEach(el => el.remove());

    spreadItems = [];
    currentSpreadItemIndex = 0;

    // Filtrujeme položky pro tuto dvoustranu (floor)
    const itemsForSpread = galleryItems.filter(item => Math.floor(item.spread) === Math.floor(spread));

    itemsForSpread.forEach((itemData, index) => {
        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'lightbox-item';

        let mediaElement = null;
        let textElement = null;

        if (itemData.mediaSrc) {
            let mediaType = 'image';
            let mediaSrcPath = itemData.mediaSrc;
            const extension = mediaSrcPath.split('.').pop().toLowerCase();

            if (['mp4', 'webm', 'gif'].includes(extension)) {
                mediaType = 'localVideo';
            }

            if (mediaType === 'localVideo') {
                mediaElement = document.createElement('video');
                mediaElement.src = mediaSrcPath;
                Object.assign(mediaElement, {
                    autoplay: false, loop: true, muted: true, playsInline: true, controls: true, preload: 'auto'
                });
            } else {
                mediaElement = document.createElement('img');
                mediaElement.src = mediaSrcPath;
            }
            mediaElement.className = 'lightbox-media';
        }

        if (mediaElement) {
            itemWrapper.appendChild(mediaElement);
        }

        if (mediaElement || textElement) {
            lightboxStage.appendChild(itemWrapper);
            spreadItems.push(itemWrapper);
            if (itemData === itemToSelect) {
                currentSpreadItemIndex = index;
            } else if (!itemToSelect && index === 0) {
                currentSpreadItemIndex = 0;
            }
        }

        // Reel thumbnail
        if (mediaElement) {
            const thumb = document.createElement('button');
            thumb.className = 'reel-thumbnail';

            const img = document.createElement('img');
            img.src = itemData.mediaSrc; // Pro video to nebude fungovat ideálně, ale stačí to
            thumb.appendChild(img);

            thumb.addEventListener('click', () => {
                setCurrentSpreadItem(index);
            });
            lightboxReel.appendChild(thumb);
        }
    });

    // Tečky pro mobil
    if (spreadItems.length > 1 && dots) {
        spreadItems.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'lightbox-dot';
            dot.addEventListener('click', () => setCurrentSpreadItem(index));
            dots.appendChild(dot);
        });
    }

    if (spreadItems.length > 1) {
        lightbox.classList.add('has-multiple-items');
    } else {
        lightbox.classList.remove('has-multiple-items');
    }

    updateLightboxView();
}


function updateLightboxView() {
    if (spreadItems.length === 0) return;

    spreadItems.forEach((item, index) => {
        item.classList.remove('active');
        const video = item.querySelector('video');

        if (index === currentSpreadItemIndex) {
            item.classList.add('active');
            if (video) video.play().catch(() => { });
        } else {
            if (video) video.pause();
        }
    });

    const thumbnails = document.querySelectorAll('.reel-thumbnail');
    thumbnails.forEach((thumb, index) => {
        if (index === currentSpreadItemIndex) thumb.classList.add('active');
        else thumb.classList.remove('active');
    });

    const dots = document.querySelectorAll('.lightbox-dot');
    dots.forEach((dot, index) => {
        if (index === currentSpreadItemIndex) dot.classList.add('active');
        else dot.classList.remove('active');
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
//  ZPRACOVÁNÍ VSTUPU
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
        if (lightbox.classList.contains('show') || lightbox.classList.contains('active')) {
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

    setupLightboxControls();
    setupWheel();
    setupTouchGestures();
}

function findNextSpreadWithItems(direction) {
    if (state.isAnimating || spreadsWithItems.length === 0) return;
    const currentBookSpread = Math.round(parseFloat(slider.value));

    // Jednoduchá navigace po 1 stránce v lightboxu, pokud nejsou definované "items" spread
    const targetSpread = Math.max(0, Math.min(state.maxSpread, currentBookSpread + direction));

    if (targetSpread !== currentBookSpread) {
        // Jen posuneme knihu, obsah se načte callbackem v animateTo
        // (zde zjednodušeno pro zachování funkčnosti bez složité logiky spreadů)
        animateTo(parseFloat(slider.value), targetSpread, CONFIG.animationDuration,
            () => {
                // Pokusíme se otevřít lightbox na nové straně, pokud tam něco je
                const item = galleryItems.find(i => Math.floor(i.spread) === targetSpread);
                if (item) loadSpreadItems(targetSpread, item);
            }
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
            // renderButtons už není potřeba volat explicitně, volá se v updateBook
            if (history.replaceState) history.replaceState(null, '', `#spread=${end}`);

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

function setupLightboxControls() {
    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    lightboxPrevBtn.addEventListener('click', () => findNextSpreadWithItems(-1));
    lightboxNextBtn.addEventListener('click', () => findNextSpreadWithItems(1));

    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox || event.target === lightboxStage) {
            closeLightbox();
        }
    });
}

function wrapPageImages() { document.querySelectorAll(".page-image").forEach(e => { const t = document.createElement("div"); t.className = "page-image-wrapper", e.parentNode.insertBefore(t, e), t.appendChild(e) }) }
function setupMediaOverlays() { /* Vyprázdněno */ }

// =================================================================
//  SPUŠTĚNÍ APLIKACE
// =================================================================

function main() {
    // Pokud existuje funkce z main.js, použijeme ji
    if (typeof createNav === 'function') createNav('../../', 'bez.filtru');

    // Načteme elementy až teď
    papers = Array.from(document.querySelectorAll('.paper'));
    state.maxSpread = papers.length;

    // Vygenerujeme data pro lightbox
    buttonData = generateButtonDataFromDOM();
    galleryItems = buttonData; // Pro kompatibilitu

    // Vytvoříme seznam spreadů
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
        const spreadFromUrl = parseFloat(hash.replace('#spread=', ''));
        if (!isNaN(spreadFromUrl)) {
            initialSpread = Math.max(0, Math.min(spreadFromUrl, state.maxSpread));
        }
    }
    slider.value = initialSpread;
    updateBook(initialSpread);
}

document.addEventListener('DOMContentLoaded', main);