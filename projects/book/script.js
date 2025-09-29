// =================================================================
//  KONFIGURACE A PROMĚNNÉ
// =================================================================
const CONFIG = {
    animationDuration: 800,
    snapDuration: 500,
    wheelSensitivity: 0.0025,
    maxZoomScale: 5,
};

const mediaOverlays = {
    5: { type: 'webm', src: 'assets/page-5-overlay.webm' },
    7: { type: 'webm', src: 'assets/page-7-overlay.webm' }
};

const book = document.getElementById('book');
const slider = document.getElementById('pageSlider');
const interactiveLayer = document.getElementById('interactive-layer');
const lightbox = document.getElementById('lightbox');
const lightboxStage = document.getElementById('lightbox-stage');
const lightboxPlayButton = document.getElementById('lb-play');
const papers = Array.from(document.querySelectorAll('.paper'));

const state = {
    currentSpread: 0,
    maxSpread: papers.length,
    isAnimating: false,
    animationFrame: null,
    wheelAccumulator: 0,
    isWheelAnimating: false,
    touchStartX: null, touchStartY: null,
    currentMediaIndex: 0,
    isLightboxOpen: false
};

// ZÁZNAM PRO medium4 BYL ODSTRANĚN
let mediaItems = [
    { src: 'media/medium1_spread3.jpg' },
    { src: 'media/medium2_spread4.webm' },
    { src: 'media/medium3_spread4.webm' },
    { src: 'media/medium5_spread6_1114653811.vimeo' },
    { src: 'media/medium6_spread7_1114707280.vimeo' },
    { src: 'media/medium7_spread8.jpg' },
];

let currentVideo = null;
let vimeoPlayer = null;
// =================================================================
//  HLAVNÍ FUNKCE KNIHY
// =================================================================

function updateBook(spread) {
    papers.forEach((paper, i) => {
        const progress = Math.max(0, Math.min(1, spread - i));
        const rotation = -progress * 180;
        paper.style.transform = `rotateY(${rotation}deg)`;

        const zIndex = spread > i ? i : state.maxSpread - i;
        paper.style.zIndex = zIndex;
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
            element.setAttribute('aria-label', 'Otevřít odkaz v nové kartě');
        } else {
            element.setAttribute('role', 'button');
            element.setAttribute('aria-label', `Zobrazit médium ${data.mediaSrc}`);
            element.addEventListener('click', () => {
                const mediaIndex = mediaItems.findIndex(item => item.src === data.mediaSrc);
                if (mediaIndex !== -1) {
                    openLightbox(mediaIndex);
                }
            });
        }

        Object.assign(element.style, data.styles);
        interactiveLayer.appendChild(element);
    });
}


// =================================================================
//  LIGHTBOX (ZOBRAZENÍ MÉDIÍ)
// =================================================================

function openLightbox(index) {
    state.isLightboxOpen = true;
    lightbox.classList.add('show');
    document.body.style.overflow = 'hidden';
    loadMedia(index);
}

function closeLightbox() {
    state.isLightboxOpen = false;
    lightbox.classList.remove('show');
    document.body.style.overflow = '';
    lightboxStage.innerHTML = '';
}

function loadMedia(index) {
    state.currentMediaIndex = index;
    lightboxStage.innerHTML = '';
    const media = mediaItems[index];

    // Tato část synchronizuje knihu na pozadí s aktuálním médiem
    const button = buttonData.find(b => b.mediaSrc === media.src);
    if (button) {
        const targetSpread = button.spread;
        if (state.currentSpread !== targetSpread) {
            animateTo(parseFloat(slider.value), targetSpread, CONFIG.animationDuration);
        }
    }

    const srcParts = media.src.split('.');
    const type = srcParts[srcParts.length - 1];
    const isVimeo = type === 'vimeo';

    if (isVimeo) {
        const vimeoId = media.src.split('_').pop().split('.')[0];
        lightboxStage.innerHTML = `<iframe src="https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&autopause=0&muted=1" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
        lightboxPlayButton.classList.remove('show');
    } else {
        const isVideo = ['mp4', 'webm', 'gif'].includes(type);
        const content = document.createElement(isVideo ? 'video' : 'img');
        content.src = media.src;

        if (content.tagName === 'VIDEO') {
            Object.assign(content, { autoplay: true, loop: true, muted: true, playsInline: true });
            lightboxPlayButton.classList.remove('show');
        }
        lightboxStage.appendChild(content);
    }
}

function setupLightboxControls() {
    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    document.getElementById('lightboxPrev').addEventListener('click', () => changeMedia(-1));
    document.getElementById('lightboxNext').addEventListener('click', () => changeMedia(1));

    lightboxPlayButton.addEventListener('click', () => {
        const video = lightboxStage.querySelector('video');
        if (video) {
            video.paused ? (video.play(), lightboxPlayButton.textContent = '❚❚') : (video.pause(), lightboxPlayButton.textContent = '▶');
        }
    });
}

function changeMedia(delta) {
    const newIndex = (state.currentMediaIndex + delta + mediaItems.length) % mediaItems.length;
    loadMedia(newIndex);
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

    document.addEventListener('keydown', (e) => {
        if (state.isLightboxOpen) {
            if (e.key === 'ArrowLeft') changeMedia(-1);
            if (e.key === 'ArrowRight') changeMedia(1);
            if (e.key === 'Escape') closeLightbox();
        } else {
            if (e.key === 'ArrowLeft') changeSpread(-1);
            if (e.key === 'ArrowRight') changeSpread(1);
        }
    });

    setupWheel();
    setupLightboxControls();
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
        if (progress < 1) {
            requestAnimationFrame(frame);
        } else {
            state.isAnimating = false;
            slider.value = end;
            updateBook(end);
            renderButtons(end);
            state.currentSpread = end;
            history.pushState(null, '', `#spread=${end}`);
        }
    };
    requestAnimationFrame(frame);
}

function setupWheel() {
    book.parentElement.addEventListener('wheel', e => {
        e.preventDefault();
        state.wheelAccumulator += e.deltaY * CONFIG.wheelSensitivity;
        if (!state.isWheelAnimating) {
            state.isWheelAnimating = true;
            animateWheel();
        }
    }, { passive: false });

    function animateWheel() {
        if (Math.abs(state.wheelAccumulator) < 0.001) {
            state.isWheelAnimating = false;
            const target = Math.round(parseFloat(slider.value));
            animateTo(parseFloat(slider.value), target, CONFIG.snapDuration);
            return;
        }
        const current = parseFloat(slider.value);
        const step = state.wheelAccumulator * 0.15;
        state.wheelAccumulator -= step;
        const nextVal = Math.max(0, Math.min(state.maxSpread, current + step));
        slider.value = nextVal;
        updateBook(nextVal);
        requestAnimationFrame(animateWheel);
    }
}

// =================================================================
//  POMOCNÉ FUNKCE
// =================================================================

function wrapPageImages() {
    document.querySelectorAll('.page-image').forEach(img => {
        const wrapper = document.createElement('div');
        wrapper.className = 'page-image-wrapper';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
    });
}

function setupMediaOverlays() {
    for (const pageNum in mediaOverlays) {
        const overlayData = mediaOverlays[pageNum];
        const pageElement = document.querySelector(`#p${Math.floor((pageNum - 1) / 2)} ${pageNum % 2 !== 0 ? '.back' : '.front'} .page-image-wrapper`);
        if (pageElement) {
            const video = document.createElement('video');
            video.className = 'media-overlay';
            Object.assign(video, { src: overlayData.src, autoplay: true, muted: true, loop: true, playsInline: true });
            pageElement.appendChild(video);
        }
    }
}

// =================================================================
//  SPUŠTĚNÍ APLIKACE
// =================================================================

function main() {
    createNav('../../', 'portfolio');

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
    state.currentSpread = initialSpread;
    slider.value = initialSpread;
    updateBook(initialSpread);
    renderButtons(initialSpread);
}

document.addEventListener('DOMContentLoaded', main);