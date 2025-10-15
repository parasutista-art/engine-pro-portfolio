// =================================================================
//  KONFIGURACE A GLOBÁLNÍ PROMĚNNÉ
// =================================================================

const CONFIG = {
    animationDuration: 800,
    snapDuration: 500,
    wheelSensitivity: 0.0025,
    touchSwipeThreshold: 50,
};

const mediaOverlays = {
    5: { type: 'webm', src: 'assets/page-5-overlay.webm' },
    7: { type: 'webm', src: 'assets/page-7-overlay.webm' }
};

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
    currentGalleryIndex: 0,
};

let galleryItems = [];

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
            element.addEventListener('click', () => {
                const galleryIndex = galleryItems.findIndex(item => item === data);
                if (galleryIndex !== -1) {
                    openLightbox(galleryIndex);
                }
            });
        }
        Object.assign(element.style, data.styles);
        interactiveLayer.appendChild(element);
    });
}

// =================================================================
//  LIGHTBOX PRO SJEDNOCENOU GALERII
// =================================================================

function openLightbox(index) {
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
    loadGalleryItem(index);
}

function closeLightbox() {
    lightbox.classList.remove('show');
    document.body.style.overflow = '';
    lightboxStage.innerHTML = '';
}

function loadGalleryItem(index) {
    state.currentGalleryIndex = index;
    lightboxStage.innerHTML = '';

    if (galleryItems.length === 0) return;

    const showArrows = galleryItems.length > 1;
    lightboxPrevBtn.style.display = showArrows ? 'block' : 'none';
    lightboxNextBtn.style.display = showArrows ? 'block' : 'none';

    const itemData = galleryItems[index];

    const targetSpread = itemData.spread;
    const currentBookSpread = Math.round(parseFloat(slider.value));
    if (targetSpread !== undefined && targetSpread !== currentBookSpread) {
        animateTo(parseFloat(slider.value), targetSpread, CONFIG.animationDuration);
    }

    if (itemData.mediaSrc) {
        const srcParts = itemData.mediaSrc.split('.');
        const type = srcParts[srcParts.length - 1];
        const isVimeo = type === 'vimeo';

        let content;
        if (isVimeo) {
            const vimeoId = itemData.mediaSrc.split('_').pop().split('.')[0];
            content = document.createElement('iframe');
            content.src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&autopause=0&muted=1`;
            Object.assign(content, { frameborder: '0', allow: 'autoplay; fullscreen; picture-in-picture', allowfullscreen: true });
        } else {
            const isVideo = ['mp4', 'webm', 'gif'].includes(type);
            content = document.createElement(isVideo ? 'video' : 'img');
            content.src = itemData.mediaSrc;
            if (isVideo) {
                Object.assign(content, { autoplay: true, loop: true, muted: true, playsInline: true });
            }
        }
        content.className = 'lightbox-media';
        lightboxStage.appendChild(content);
    }

    if (itemData.text) {
        const textElement = document.createElement('div');
        textElement.className = 'lightbox-text';
        textElement.innerHTML = itemData.text.replace(/\n/g, '<br>');
        lightboxStage.appendChild(textElement);
        if (!itemData.mediaSrc) {
            lightboxStage.classList.add('text-only');
        } else {
            lightboxStage.classList.remove('text-only');
        }
    } else {
        lightboxStage.classList.remove('text-only');
    }
}

function changeGalleryItem(delta) {
    if (galleryItems.length <= 1) return;
    const newIndex = (state.currentGalleryIndex + delta + galleryItems.length) % galleryItems.length;
    loadGalleryItem(newIndex);
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
            if (event.key === 'ArrowLeft') changeGalleryItem(-1);
            if (event.key === 'ArrowRight') changeGalleryItem(1);
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

function changeSpread(delta) {
    if (state.isAnimating) return;
    const current = Math.round(parseFloat(slider.value));
    const target = Math.max(0, Math.min(state.maxSpread, current + delta));
    if (current !== target) {
        animateTo(parseFloat(slider.value), target, CONFIG.animationDuration);
    }
}

function animateTo(start, end, duration) {
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
    lightboxPrevBtn.addEventListener('click', () => changeGalleryItem(-1));
    lightboxNextBtn.addEventListener('click', () => changeGalleryItem(1));

    // === ZDE JE PŘIDANÁ FUNKCE ===
    lightbox.addEventListener('click', (event) => {
        // Zkontroluje, jestli se kliklo přímo na pozadí (lightbox)
        // a ne na nějaký jeho prvek uvnitř (obrázek, text, šipky...).
        if (event.target === lightbox) {
            closeLightbox();
        }
    });
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