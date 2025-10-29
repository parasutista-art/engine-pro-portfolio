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
    12: { type: 'webm', src: 'assets/povalec-2_overlay.webm' },
    16: { type: 'webm', src: 'assets/ztohoven_overlay.webm' },
    18: { type: 'webm', src: 'assets/Typotrip-2_overlay.webm' },
    26: { type: 'webm', src: 'assets/1-txt-2_overlay_1.webm' },
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

// === PŘIDÁNO: NOVÁ FUNKCE PRO PŘEDNAČTENÍ LOKÁLNÍCH VIDEÍ ===
function preloadLocalVideo(src) {
    // Kontrola, jestli to není URL nebo Vimeo
    const srcParts = src.split('.');
    const extension = srcParts[srcParts.length - 1].toLowerCase();

    if (src.startsWith('http') || extension === 'vimeo') {
        return; // Toto není lokální video, nebudeme ho přednačítat
    }

    // Použijeme fetch API k tichému načtení do cache
    // 'no-cors' může být potřeba, pokud testujete lokálně (z file://)
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

// === UPRAVENO: Funkce renderButtons nyní obsahuje 'mouseenter' pro přednačtení ===
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

            // === PŘIDÁNO: PRELOAD ON HOVER (pro lokální média) ===
            if (data.mediaSrc) {
                element.addEventListener('mouseenter', () => {
                    preloadLocalVideo(data.mediaSrc);
                }, { once: true }); // '{ once: true }' zajistí, že se to spustí jen jednou
            }
            // === KONEC PŘIDÁNÍ ===
        }
        Object.assign(element.style, data.styles);
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
    document.getElementById('lightbox-dots').innerHTML = ''; // Vyčistíme tečky

    const overlayTexts = lightbox.querySelectorAll('.lightbox-text-overlay');
    overlayTexts.forEach(el => el.remove());

    lightbox.classList.remove('has-multiple-items');

    spreadItems = []; // Resetujeme stav
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


/**
 * =================================================================
 * === loadSpreadItems ===
 * === UPRAVENO: Přidán 'preload: auto' pro lokální videa ===
 * =================================================================
 */
function loadSpreadItems(spread, itemToSelect = null) {
    // --- 1. Čištění ---
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

        // --- 2. Zpracování Média ---
        if (itemData.mediaSrc) {

            let mediaType = ''; // 'vimeo', 'localVideo', 'image'
            let videoId = '';
            let mediaSrcPath = itemData.mediaSrc;

            const showControls = itemData.mediaControls === true;

            // === DETEKČNÍ LOGIKA (bez YouTube) ===
            if (mediaSrcPath.startsWith('http')) {
                try {
                    const url = new URL(mediaSrcPath);
                    if (url.hostname.includes('vimeo.com')) {
                        mediaType = 'vimeo';
                        videoId = url.pathname.substring(1).split('/')[0];
                    } else {
                        const extension = url.pathname.split('.').pop().toLowerCase();
                        if (['mp4', 'webm', 'gif'].includes(extension)) {
                            mediaType = 'localVideo';
                        } else if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(extension)) {
                            mediaType = 'image';
                        }
                    }
                } catch (e) { console.error(`Chybná URL v buttons.js: ${mediaSrcPath}`, e); }
            } else {
                const srcParts = mediaSrcPath.split('.');
                const extension = srcParts[srcParts.length - 1].toLowerCase();
                if (extension === 'vimeo') { // Starý formát
                    mediaType = extension;
                    videoId = mediaSrcPath.split('_').pop().split('.')[0];
                } else if (['mp4', 'webm', 'gif'].includes(extension)) {
                    mediaType = 'localVideo';
                } else {
                    mediaType = 'image';
                }
            }
            // === KONEC DETEKČNÍ LOGIKY ===


            // --- 3. Vytvoření elementu podle typu ---

            if (mediaType === 'vimeo') {
                mediaElement = document.createElement('iframe');
                let vimeoSrc = `https://player.vimeo.com/video/${videoId}?autoplay=1&loop=1&autopause=0&muted=1`;
                vimeoSrc += showControls ? '&controls=1' : '&controls=0';

                if (itemData === itemToSelect || index === 0) {
                    mediaElement.src = vimeoSrc;
                }
                mediaElement.dataset.src = vimeoSrc; // <-- Uložíme src pro pozdější použití
                Object.assign(mediaElement, {
                    frameborder: '0',
                    allow: 'autoplay; fullscreen; picture-in-picture',
                    allowfullscreen: true
                });

            } else if (mediaType === 'localVideo') {
                mediaElement = document.createElement('video');
                mediaElement.src = mediaSrcPath;
                mediaElement.dataset.src = mediaSrcPath;
                if (showControls) {
                    Object.assign(mediaElement, {
                        autoplay: false,
                        loop: true,
                        muted: true,
                        playsInline: true,
                        controls: true,
                        preload: 'auto' // <-- PŘIDÁNO
                    });
                } else {
                    Object.assign(mediaElement, {
                        autoplay: false,
                        loop: true,
                        muted: true,
                        playsInline: true,
                        controls: false,
                        preload: 'auto' // <-- PŘIDÁNO
                    });
                }

            } else if (mediaType === 'image') {
                mediaElement = document.createElement('img');
                mediaElement.src = mediaSrcPath;
            }

            if (mediaElement) {
                mediaElement.className = 'lightbox-media';
            }
        } // Konec if (itemData.mediaSrc)

        // --- 4. Zpracování Textu ---
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

        // --- 5. Sestavení a přidání do DOMu ---
        if (mediaElement) {
            itemWrapper.appendChild(mediaElement);
        } else if (textElement) {
            itemWrapper.appendChild(textElement);
        }

        if (mediaElement || textElement) {
            lightboxStage.appendChild(itemWrapper);
            spreadItems.push(itemWrapper);
            if (itemData === itemToSelect) {
                currentSpreadItemIndex = index;
            }
        }

        if (overlayTextElement) {
            lightbox.appendChild(overlayTextElement);
        }

        // --- 6. Vytvoření náhledu pro lištu (Reel Thumbnail) ---
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

            thumb.addEventListener('click', () => {
                setCurrentSpreadItem(index);
            });
            lightboxReel.appendChild(thumb);
        }
    }); // Konec itemsForSpread.forEach

    // --- 7. Vytvoření teček pro mobil ---
    const dotsContainer = document.getElementById('lightbox-dots');
    dotsContainer.innerHTML = '';
    if (spreadItems.length > 1) {
        spreadItems.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'lightbox-dot';
            dot.dataset.index = index;
            dot.setAttribute('aria-label', `Zobrazit položku ${index + 1}`);
            dot.addEventListener('click', () => {
                setCurrentSpreadItem(index);
            });
            dotsContainer.appendChild(dot);
        });
    }

    // --- 8. Ovládání zobrazení (Lišta vs Tečky) ---
    if (spreadItems.length > 1) {
        lightbox.classList.add('has-multiple-items');
    } else {
        lightbox.classList.remove('has-multiple-items');
    }

    // Zavoláme NOVOU verzi updateLightboxView
    updateLightboxView();
}


/**
 * =================================================================
 * === updateLightboxView ===
 * (Tato funkce je finální a stabilní)
 * =================================================================
 */
function updateLightboxView() {
    if (spreadItems.length === 0) return;

    const prevIndex = (currentSpreadItemIndex - 1 + spreadItems.length) % spreadItems.length;
    const nextIndex = (currentSpreadItemIndex + 1) % spreadItems.length;

    // --- 1. Aktualizace hlavního okna (Médií/Sólo textů) ---
    spreadItems.forEach((item, index) => {
        // Najdeme média v této položce
        item.classList.remove('active', 'prev', 'next');
        const video = item.querySelector('video');
        const iframe = item.querySelector('iframe');

        if (index === currentSpreadItemIndex) {
            // === TOTO JE AKTIVNÍ POLOŽKA ===
            item.classList.add('active');

            // Spustíme <video>
            if (video) video.play().catch(e => console.log("Autoplay byl zablokován prohlížečem."));

            // Spustíme <iframe> (Vimeo)
            if (iframe) {
                const currentSrc = iframe.dataset.src;
                if (currentSrc && iframe.src !== currentSrc) {
                    iframe.src = currentSrc;
                }
            }

        } else if (index === prevIndex && spreadItems.length > 1) {
            // === TOTO JE PŘEDCHOZÍ POLOŽKA ===
            item.classList.add('prev');
            if (video) video.pause();
            if (iframe) iframe.src = ''; // Zastavíme

        } else if (index === nextIndex && spreadItems.length > 1) {
            // === TOTO JE DALŠÍ POLOŽKA ===
            item.classList.add('next');
            if (video) video.pause();
            if (iframe) iframe.src = ''; // Zastavíme

        } else {
            // === VŠECHNY OSTATNÍ (skryté) ===
            if (video) video.pause();
            if (iframe) iframe.src = ''; // Zastavíme
        }
    });

    // --- 2. Aktualizace aktivního náhledu v liště ---
    const thumbnails = document.querySelectorAll('.reel-thumbnail');
    thumbnails.forEach((thumb, index) => {
        if (index === currentSpreadItemIndex) {
            thumb.classList.add('active');
            thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            thumb.classList.remove('active');
        }
    });

    // --- 3. Aktualizace aktivní tečky ---
    const dots = document.querySelectorAll('.lightbox-dot');
    dots.forEach((dot, index) => {
        if (index === currentSpreadItemIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    // --- 4. Aktualizace OVERLAY TEXTU (hledáme v #lightbox) ---
    const overlayTexts = lightbox.querySelectorAll('.lightbox-text-overlay');
    overlayTexts.forEach(textEl => {
        const textIndex = parseInt(textEl.dataset.index, 10);
        if (textIndex === currentSpreadItemIndex) {
            textEl.classList.add('active'); // Zobrazíme text pro aktivní položku
        } else {
            textEl.classList.remove('active'); // Skryjeme ostatní
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
        // Nejdříve načteme obsah lightboxu
        loadSpreadItems(targetSpread, null);
        // AŽ POTÉ spustíme animaci otáčení knihy
        animateTo(
            parseFloat(slider.value),
            targetSpread,
            CONFIG.animationDuration,
            null
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
                changeSpreadItem(deltaY < 0 ? 1 : -1);
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