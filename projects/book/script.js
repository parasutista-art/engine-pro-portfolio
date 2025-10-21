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

const mediaOverlays = {
    6: { type: 'webm', src: 'assets/S3B-2_overlay.webm' },
    8: { type: 'webm', src: 'assets/360-2_overlay.webm' },
    7: { type: 'webm', src: 'assets/Piktogramy pro školu-1_overlay.webm' },
    10: { type: 'webm', src: 'assets/Piktogramy pro školu-2_overlay.webm' },
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
// PŘIDÁN ELEMENT PRO LIŠTU
const lightboxReel = document.getElementById('lightbox-reel');
const papers = Array.from(document.querySelectorAll('.paper'));


const state = {
    currentSpread: 0,
    maxSpread: papers.length,
    isAnimating: false,
    touchStartX: null,
    touchStartY: null, // Pro vertikální swipe
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
//  LIGHTBOX
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
    lightboxReel.innerHTML = ''; // Vyčistíme i lištu
    spreadItems = []; // Resetujeme stav
    currentSpreadItemIndex = 0;
}

/**
 * NOVÁ FUNKCE: Nastaví aktuální položku v lightboxu podle indexu
 */
function setCurrentSpreadItem(index) {
    if (index < 0 || index >= spreadItems.length) {
        console.warn(`Index ${index} je mimo rozsah.`);
        return;
    }
    currentSpreadItemIndex = index;
    updateLightboxView();
}

/**
 * PŘEPRACOVANÁ FUNKCE: Načte všechny položky pro danou dvoustranu do lightboxu A VYGENERUJE LIŠTU
 */
function loadSpreadItems(spread, itemToSelect = null) {
    lightboxStage.innerHTML = '';
    lightboxReel.innerHTML = ''; // Vyčistíme lištu
    spreadItems = [];
    currentSpreadItemIndex = 0;

    const itemsForSpread = galleryItems.filter(item => item.spread === spread);

    itemsForSpread.forEach((itemData, index) => {
        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'lightbox-item';

        let mediaElement = null;
        let textElement = null;

        // --- 1. Zpracování Média (pokud existuje) ---
        if (itemData.mediaSrc) {
            const srcParts = itemData.mediaSrc.split('.');
            const type = srcParts[srcParts.length - 1];
            const isVimeo = type === 'vimeo';

            if (isVimeo) {
                const vimeoId = itemData.mediaSrc.split('_').pop().split('.')[0];
                mediaElement = document.createElement('iframe');
                mediaElement.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&autopause=0&muted=1`;
                Object.assign(mediaElement, { frameborder: '0', allow: 'autoplay; fullscreen; picture-in-picture', allowfullscreen: true });
            } else {
                const isVideo = ['mp4', 'webm', 'gif'].includes(type);
                mediaElement = document.createElement(isVideo ? 'video' : 'img');
                mediaElement.src = itemData.mediaSrc;
                if (isVideo) {
                    Object.assign(mediaElement, { autoplay: false, loop: true, muted: true, playsInline: true });
                }
            }
            mediaElement.className = 'lightbox-media';
        }

        // --- 2. Zpracování Textu (pokud existuje) ---
        if (itemData.text) {
            textElement = document.createElement('div');
            textElement.className = 'lightbox-text';
            textElement.innerHTML = itemData.text.replace(/\n/g, '<br>');
        }

        // --- 3. Sestavení a přidání do DOMu (OPRAVENO) ---
        if (mediaElement && textElement) {
            // Případ 1: Médium i text
            // Vytvoříme wrapper, který očekává CSS
            const mediaWrapper = document.createElement('div');
            mediaWrapper.className = 'lightbox-media-wrapper';

            mediaWrapper.appendChild(mediaElement); // Přidáme médium

            textElement.classList.add('is-overlay'); // Přidáme třídu pro text
            mediaWrapper.appendChild(textElement); // Přidáme text

            // Přidáme celý .lightbox-media-wrapper do .lightbox-item
            itemWrapper.appendChild(mediaWrapper); 

        } else if (mediaElement) {
            // Případ 2: Pouze médium
            itemWrapper.appendChild(mediaElement);

        } else if (textElement) {
            // Případ 3: Pouze text
            itemWrapper.appendChild(textElement);
        }

        // --- 4. Vytvoření náhledu pro lištu (NOVÁ ČÁST) ---
        if (mediaElement || textElement) {
            const thumb = document.createElement('button');
            thumb.className = 'reel-thumbnail';
            thumb.dataset.index = index;
            thumb.setAttribute('aria-label', `Zobrazit položku ${index + 1}`);

            if (itemData.mediaSrc) {
                const srcParts = itemData.mediaSrc.split('.');
                const type = srcParts[srcParts.length - 1];
                const isVimeo = type === 'vimeo';
                const isVideo = ['mp4', 'webm', 'gif'].includes(type) && !isVimeo;
                const isImage = !isVideo && !isVimeo;

                if (isImage) {
                    const img = document.createElement('img');
                    img.src = itemData.mediaSrc;
                    img.alt = `Náhled ${index + 1}`;
                    thumb.appendChild(img);
                } else if (isVideo) {
                    // Statický <video> tag pro náhled
                    const vid = document.createElement('video');
                    vid.src = itemData.mediaSrc;
                    vid.muted = true;
                    vid.preload = "metadata"; // Načte první frame (důležité pro Safari)
                    vid.disablePictureInPicture = true;
                    vid.playsInline = true;
                    thumb.appendChild(vid);
                } else if (isVimeo) {
                    thumb.innerHTML = '<span>VIDEO</span>';
                    thumb.classList.add('is-placeholder');
                }
            } else if (itemData.text) {
                // Náhled pouze pro text
                thumb.innerHTML = '<span>TEXT</span>';
                thumb.classList.add('is-placeholder');
            }

            // Kliknutí na náhled změní položku
            thumb.addEventListener('click', () => {
                setCurrentSpreadItem(index);
            });

            lightboxReel.appendChild(thumb);
        }
        // --- Konec vytváření náhledu ---

        // Přidáme wrapper do stage, POKUD má vůbec nějaký obsah
        if (mediaElement || textElement) {
            lightboxStage.appendChild(itemWrapper);
            spreadItems.push(itemWrapper);

            if (itemData === itemToSelect) {
                currentSpreadItemIndex = index;
            }
        }
    });

    // Zobrazíme/skryjeme lištu podle počtu položek
    lightboxReel.style.display = spreadItems.length > 1 ? 'flex' : 'none';

    updateLightboxView();
}


/**
 * UPRAVENÁ FUNKCE: Aktualizuje zobrazení v lightboxu A V LIŠTĚ
 */
function updateLightboxView() {
    if (spreadItems.length === 0) return;

    const prevIndex = (currentSpreadItemIndex - 1 + spreadItems.length) % spreadItems.length;
    const nextIndex = (currentSpreadItemIndex + 1) % spreadItems.length;

    // Aktualizace hlavního okna
    spreadItems.forEach((item, index) => {
        item.classList.remove('active', 'prev', 'next');
        const video = item.querySelector('video');
        const iframe = item.querySelector('iframe');

        if (index === currentSpreadItemIndex) {
            item.classList.add('active');
            if (video) video.play().catch(e => console.log("Autoplay byl zablokován prohlížečem."));
            // (Autoplay pro Vimeo je řešen v URL)
        } else if (index === prevIndex && spreadItems.length > 1) {
            item.classList.add('prev');
            if (video) video.pause();
        } else if (index === nextIndex && spreadItems.length > 1) {
            item.classList.add('next');
            if (video) video.pause();
        } else {
            if (video) video.pause();
        }

        // Zastavení vimeo videí, která nejsou aktivní
        if (iframe && index !== currentSpreadItemIndex) {
            // "Zastaví" video přenastavením src
            const oldSrc = iframe.src;
            iframe.src = oldSrc;
        }
    });

    // Aktualizace aktivního náhledu v liště (NOVÁ ČÁST)
    const thumbnails = document.querySelectorAll('.reel-thumbnail');
    thumbnails.forEach((thumb, index) => {
        if (index === currentSpreadItemIndex) {
            thumb.classList.add('active');
            // Zajistí, že aktivní náhled je vždy vidět (pokud by lišta skrolovala)
            thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            thumb.classList.remove('active');
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
    }, CONFIG.lightboxAnimDuration);
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

/**
 * Přepne na další/předchozí DVOUSTRANU, která obsahuje položky.
 * OPRAVENO: Média se načtou hned, ne až po animaci.
 */
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
        // ZMĚNA: Nejdříve načteme obsah lightboxu
        loadSpreadItems(targetSpread, null);

        // AŽ POTÉ spustíme animaci otáčení knihy, bez callbacku
        animateTo(
            parseFloat(slider.value),
            targetSpread,
            CONFIG.animationDuration,
            null // Callback je odebrán
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


function setupLightboxWheel() {

    let isWheeling = false; 
    let wheelGestureTimeout = null; 
    const WHEEL_GESTURE_END_DELAY = 50;

    lightbox.addEventListener('wheel', (e) => {
        e.preventDefault();

        if (wheelGestureTimeout) {
            clearTimeout(wheelGestureTimeout);
        }

        wheelGestureTimeout = setTimeout(() => {
            isWheeling = false;
            wheelGestureTimeout = null;
        }, WHEEL_GESTURE_END_DELAY);

        if (!isWheeling && !isLightboxAnimating && !state.isAnimating) {

            const deltaY = e.deltaY;
            const deltaX = e.deltaX;
            const absY = Math.abs(deltaY);
            const absX = Math.abs(deltaX);
            const threshold = 1;

            if (absY > absX && absY > threshold) {
                isWheeling = true; 
                if (deltaY > threshold) {
                    changeSpreadItem(1); // Dolů
                } else if (deltaY < -threshold) {
                    changeSpreadItem(-1); // Nahoru
                } else {
                    isWheeling = false; 
                }
            }
        }

    }, { passive: false }); 
}


function setupLightboxTouchGestures() {
    lightbox.addEventListener('touchmove', (event) => {
        event.preventDefault();
    }, { passive: false });

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

        const touchEndX = event.changedTouches[0].screenX;
        const touchEndY = event.changedTouches[0].screenY;
        const deltaX = touchEndX - state.touchStartX;
        const deltaY = touchEndY - state.touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // === HORIZONTÁLNÍ SWIPE (měníme DVOUSTRANU) ===
            if (Math.abs(deltaX) > CONFIG.touchSwipeThreshold) {
                findNextSpreadWithItems(deltaX < 0 ? 1 : -1);
            }
        } else {
            // === VERTIKÁLNÍ SWIPE (měníme POLOŽKU na dvoustraně) ===
            if (Math.abs(deltaY) > CONFIG.touchSwipeThreshold) {
                changeSpreadItem(deltaY < 0 ? -1 : 1); 
            }
        }

        state.touchStartX = null;
        state.touchStartY = null;
    });
}


function setupLightboxControls() {
    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    lightboxPrevBtn.addEventListener('click', () => findNextSpreadWithItems(-1));
    lightboxNextBtn.addEventListener('click', () => findNextSpreadWithItems(1));

    // Zavírání kliknutím na pozadí
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox || event.target === lightboxStage) {
            closeLightbox();
        }
    });

    setupLightboxWheel(); 
    setupLightboxTouchGestures();
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