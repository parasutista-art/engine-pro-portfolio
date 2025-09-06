// =================================================================
//  INITIALIZATION & CONFIGURATION
// =================================================================

// --- Konfigurace ---
const CONFIG = {
    animationDuration: 800,
    snapDuration: 500,
    wheelSensitivity: 0.0025,
    maxZoomScale: 5,
};

// --- Mapování GIFů na stránky ---
const gifOverlays = {
    5: 'assets/page-5-overlay.gif',
    7: 'assets/page-7-overlay.gif'
};

// --- DOM Elementy ---
// Používáme const, protože tyto elementy se v průběhu aplikace nemění.
const book = document.getElementById('book');
const slider = document.getElementById('pageSlider');
const interactiveLayer = document.getElementById('interactive-layer');
const lightbox = document.getElementById('lightbox');
const lightboxStage = document.getElementById('lightbox-stage');
const lightboxPlayButton = document.getElementById('lb-play');
const lightboxZoomButton = document.getElementById('lb-zoom');
const papers = Array.from(document.querySelectorAll('.paper')); // Převedeme na pole pro snazší práci

// --- Aplikační Stav ---
const state = {
    currentSpread: 0,
    maxSpread: papers.length,
    isAnimating: false,
    animationFrame: null,
    wheelAccumulator: 0,
    isWheelAnimating: false,
    touchStartX: null,
    touchStartY: null,
    currentMediaIndex: 0,
};

// --- Média pro Lightbox ---
// Tato data by mohla být také v samostatném souboru, pokud by se rozrostla.
let mediaItems = [
    { src: 'media/medium1_spread3.jpg' },
    { src: 'media/medium2_spread4.gif' },
    { src: 'media/medium3_spread4.gif' },
    { src: 'media/medium5_spread6_1114653811.vimeo' },
    { src: 'media/medium6_spread7_1114707280.vimeo' },
    { src: 'media/medium7_spread8.jpg' }
];


// =================================================================
//  PAGE STRUCTURE & GIF OVERLAY ENGINE
// =================================================================

/**
 * Zabalí obsah každé stránky do kontejneru .page-content pro správné vrstvení.
 */
function wrapPageImages() {
    papers.forEach(paper => {
        paper.querySelectorAll('.front, .back').forEach(side => {
            const image = side.querySelector('.page-image');
            if (image) {
                const wrapper = document.createElement('div');
                wrapper.className = 'page-content';
                side.appendChild(wrapper);
                wrapper.appendChild(image);
            }
        });
    });
}

/**
 * Automaticky vloží definované GIFy jako vrstvu nad obrázky stránek.
 */
function setupGifOverlays() {
    // Používáme modernější a bezpečnější Object.entries pro iteraci.
    Object.entries(gifOverlays).forEach(([pageNumStr, gifSrc]) => {
        const pageNumber = parseInt(pageNumStr, 10);
        const paperIndex = Math.floor(pageNumber / 2);
        const sideClass = (pageNumber % 2 === 1) ? '.back' : '.front'; // Opravená logika, liché stránky jsou vzadu

        const paperEl = papers[paperIndex];
        if (!paperEl) return;

        const contentWrapper = paperEl.querySelector(`${sideClass} .page-content`);
        if (!contentWrapper) return;

        const gifImg = document.createElement('img');
        gifImg.src = gifSrc;
        gifImg.className = 'gif-overlay';
        gifImg.alt = ''; // Alt atribut by neměl chybět, i když je prázdný
        contentWrapper.appendChild(gifImg);
    });
}


// =================================================================
//  CORE BOOK ENGINE
// =================================================================

/**
 * Aktualizuje rotaci stránek a jejich z-index na základě pozice slideru.
 * @param {number} progressValue - Aktuální hodnota (0 až maxSpread).
 */
function updateBook(progressValue) {
    papers.forEach((paper, i) => {
        const progress = progressValue - i;
        let zIndex;
        let transform;

        if (progress <= 0) {
            transform = 'rotateY(0deg)';
            zIndex = papers.length - i;
        } else if (progress >= 1) {
            transform = 'rotateY(-180deg)';
            zIndex = i;
        } else {
            transform = `rotateY(${-180 * progress}deg)`;
            zIndex = papers.length + 1; // Stránka v pohybu je vždy nahoře
        }

        paper.style.transform = transform;
        paper.style.zIndex = zIndex;
    });
}

/**
 * Funkce pro plynulý přechod mezi stavy (easing).
 */
function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}

/**
 * Plynule animuje knihu na cílovou dvoustranu.
 * @param {number} from - Počáteční hodnota.
 * @param {number} to - Cílová hodnota.
 * @param {number} duration - Délka animace v ms.
 */
function animateTo(from, to, duration = CONFIG.animationDuration) {
    if (state.isAnimating) return;
    state.isAnimating = true;

    if (state.animationFrame) cancelAnimationFrame(state.animationFrame);
    hideButtons();

    const target = Math.max(0, Math.min(state.maxSpread, to));
    const diff = target - from;
    const startTime = performance.now();

    function tick(currentTime) {
        let elapsed = (currentTime - startTime) / duration;
        if (elapsed > 1) elapsed = 1;

        const easedProgress = easeOutCubic(elapsed);
        const currentValue = from + diff * easedProgress;

        slider.value = currentValue;
        updateBook(currentValue);

        if (elapsed < 1) {
            state.animationFrame = requestAnimationFrame(tick);
        } else {
            state.currentSpread = target;
            slider.value = state.currentSpread;
            updateBook(state.currentSpread);
            state.animationFrame = null;
            state.isAnimating = false;
            renderButtons(state.currentSpread);
        }
    }
    state.animationFrame = requestAnimationFrame(tick);
}

/**
 * Přejde na specifickou dvoustranu.
 * @param {number} spreadIndex - Index cílové dvoustrany.
 */
function goTo(spreadIndex) {
    if (spreadIndex !== state.currentSpread) {
        animateTo(state.currentSpread, spreadIndex);
    }
}

function next() {
    goTo(state.currentSpread + 1);
}

function prev() {
    goTo(state.currentSpread - 1);
}


// =================================================================
//  INTERACTIVE BUTTONS
// =================================================================

function hideButtons() {
    if (interactiveLayer) {
        interactiveLayer.innerHTML = '';
    }
}

function renderButtons(spreadIndex) {
    hideButtons();
    const buttonsForSpread = buttonData.filter(btn => btn.spread === spreadIndex);

    buttonsForSpread.forEach(data => {
        const btn = document.createElement('div');
        btn.className = 'interactive-button';
        Object.assign(btn.style, data.styles);

        if (data.clipPath) {
            btn.style.clipPath = data.clipPath;
        }

        const action = data.url
            ? () => window.open(data.url, '_blank')
            : () => openLightbox(data.mediaSrc);

        btn.addEventListener('click', action);
        interactiveLayer.appendChild(btn);
    });
}


// =================================================================
//  LIGHTBOX
// =================================================================

/**
 * Získá příponu souboru z cesty.
 * @param {string} path - Cesta k souboru.
 * @returns {string} Přípona souboru.
 */
function getFileExtension(path) {
    return path.split('.').pop().toLowerCase();
}

function openLightbox(src) {
    let mediaIndex = mediaItems.findIndex(m => m.src === src);
    if (mediaIndex === -1) {
        mediaItems.push({ src });
        mediaIndex = mediaItems.length - 1;
    }
    state.currentMediaIndex = mediaIndex;
    showMedia(state.currentMediaIndex);
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxStage.innerHTML = '';
    lightboxPlayButton.classList.remove('show');
}

function showMedia(index) {
    if (index < 0 || index >= mediaItems.length) return;
    state.currentMediaIndex = index;
    const { src } = mediaItems[index];

    lightboxStage.innerHTML = '';
    lightboxZoomButton.style.display = 'none';
    lightboxPlayButton.classList.remove('show');

    const extension = getFileExtension(src);

    if (['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(extension)) {
        const img = document.createElement('img');
        img.src = src;
        img.draggable = false;
        lightboxStage.appendChild(img);
        setupImageZoom(img);
    } else if (extension === 'gif') {
        const img = document.createElement('img');
        img.src = src;
        img.draggable = false;
        lightboxStage.appendChild(img);
    } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.playsInline = true;
        lightboxStage.appendChild(video);
        lightboxPlayButton.classList.add('show');
        lightboxPlayButton.onclick = () => {
            lightboxPlayButton.classList.remove('show');
            video.play();
        };
    } else if (['youtube', 'vimeo'].includes(extension)) {
        const idMatch = src.match(/_([0-9]{6,})(?:-h([A-Za-z0-9]+))?\.(youtube|vimeo)$/i);
        if (idMatch) {
            const [, id, h, type] = idMatch;
            let embedUrl = '';
            if (type === 'youtube') {
                embedUrl = `https://www.youtube-nocookie.com/embed/${id}?autoplay=0&controls=1&modestbranding=1&rel=0`;
            } else {
                const hParam = h ? `&h=${h}` : '';
                embedUrl = `https://player.vimeo.com/video/${id}?autoplay=1&loop=1&title=0&byline=0${hParam}`;
            }
            const iframe = document.createElement('iframe');
            iframe.src = embedUrl;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
            iframe.allowFullscreen = true;
            lightboxStage.appendChild(iframe);
        }
    }
}

function setupImageZoom(img) {
    lightboxZoomButton.style.display = 'block';
    lightboxZoomButton.classList.remove('active');

    let zoomState = {
        isActive: false,
        scale: 1,
        posX: 0,
        posY: 0,
        isDragging: false,
        startX: 0,
        startY: 0
    };

    const applyTransform = () => {
        img.style.transform = `translate(${zoomState.posX}px, ${zoomState.posY}px) scale(${zoomState.scale})`;
    };

    const resetZoom = () => {
        zoomState.scale = 1;
        zoomState.posX = 0;
        zoomState.posY = 0;
        applyTransform();
    };

    lightboxZoomButton.onclick = () => {
        zoomState.isActive = !zoomState.isActive;
        lightboxZoomButton.classList.toggle('active', zoomState.isActive);
        img.style.cursor = zoomState.isActive ? 'grab' : 'default';
        if (!zoomState.isActive) resetZoom();
    };

    img.addEventListener("wheel", e => {
        if (!zoomState.isActive) return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoomState.scale = Math.min(Math.max(1, zoomState.scale + delta), CONFIG.maxZoomScale);
        applyTransform();
    });

    img.addEventListener("dblclick", () => {
        if (!zoomState.isActive) return;
        zoomState.scale = zoomState.scale > 1 ? 1 : 2;
        if (zoomState.scale === 1) resetZoom();
        else applyTransform();
    });

    img.addEventListener("mousedown", e => {
        if (!zoomState.isActive || zoomState.scale <= 1) return;
        zoomState.isDragging = true;
        zoomState.startX = e.clientX - zoomState.posX;
        zoomState.startY = e.clientY - zoomState.posY;
        img.style.cursor = "grabbing";
    });

    // Posluchače pro pohyb a puštění myši dáváme na `window`,
    // abychom mohli táhnout i mimo obrázek.
    window.addEventListener("mousemove", e => {
        if (!zoomState.isDragging) return;
        zoomState.posX = e.clientX - zoomState.startX;
        zoomState.posY = e.clientY - zoomState.startY;
        applyTransform();
    });

    window.addEventListener("mouseup", () => {
        if (zoomState.isDragging) {
            zoomState.isDragging = false;
            img.style.cursor = "grab";
        }
    });
}

function lightboxNext() {
    if (state.currentMediaIndex < mediaItems.length - 1) {
        showMedia(state.currentMediaIndex + 1);
    }
}

function lightboxPrev() {
    if (state.currentMediaIndex > 0) {
        showMedia(state.currentMediaIndex - 1);
    }
}

// =================================================================
//  EVENT LISTENERS
// =================================================================

function setupEventListeners() {
    // Navigace v knize
    document.getElementById('arrowLeft').addEventListener('click', prev);
    document.getElementById('arrowRight').addEventListener('click', next);

    // Slider
    slider.addEventListener('input', () => {
        if (!state.isAnimating) {
            hideButtons();
            updateBook(parseFloat(slider.value));
        }
    });
    slider.addEventListener('change', () => {
        if (!state.isAnimating) {
            const target = Math.round(parseFloat(slider.value));
            animateTo(parseFloat(slider.value), target, CONFIG.snapDuration);
        }
    });

    // Kolečko myši
    window.addEventListener('wheel', e => {
        if (lightbox.classList.contains('show')) return;
        e.preventDefault();
        state.wheelAccumulator += e.deltaY * CONFIG.wheelSensitivity;
        if (!state.isWheelAnimating) {
            hideButtons();
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

    // Dotykové ovládání (swipe)
    book.addEventListener('touchstart', e => {
        if (e.touches.length === 1) {
            state.touchStartX = e.touches[0].clientX;
            state.touchStartY = e.touches[0].clientY;
        }
    });
    book.addEventListener('touchend', e => {
        if (state.touchStartX === null) return;
        const dx = e.changedTouches[0].clientX - state.touchStartX;
        const dy = e.changedTouches[0].clientY - state.touchStartY;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) next();
            else prev();
        }
        state.touchStartX = null;
        state.touchStartY = null;
    });

    // Lightbox ovládání
    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });
    document.querySelector('.lightbox-arrow.left').addEventListener('click', lightboxPrev);
    document.querySelector('.lightbox-arrow.right').addEventListener('click', lightboxNext);

    window.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('show')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') lightboxNext();
        if (e.key === 'ArrowLeft') lightboxPrev();
    });

    // Ovládací prvky pro ladění (pokud existují)
    document.querySelectorAll('.sidebar button[onclick]').forEach(button => {
        const command = button.getAttribute('onclick');
        button.removeAttribute('onclick');
        if (command.startsWith('goTo')) {
            const page = parseInt(command.match(/\d+/)[0], 10);
            button.addEventListener('click', () => goTo(page));
        }
    });
    document.querySelectorAll('.rightbar button[onclick]').forEach(button => {
        const command = button.getAttribute('onclick');
        button.removeAttribute('onclick');
        if (command.startsWith('openLightbox')) {
            const src = command.match(/'([^']+)'/)[1];
            button.addEventListener('click', () => openLightbox(src));
        }
    });
}

// =================================================================
//  APPLICATION START
// =================================================================

function main() {
    // Nastavení počáteční hodnoty slideru
    slider.min = 0;
    slider.max = state.maxSpread;
    slider.value = 0;

    wrapPageImages();
    setupGifOverlays();
    updateBook(0);
    renderButtons(0);
    setupEventListeners();
}

// Spustíme aplikaci po načtení celého DOMu.
document.addEventListener('DOMContentLoaded', main);