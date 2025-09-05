// ====== Page Structure & GIF Overlay Engine ======

/**
 * Projde všechny stránky a zabalí jejich obsah (<img>) do nového 
 * kontejneru <div class="page-content">. To je klíčové pro správné
 * fungování vrstvení (z-index) a pozicování GIFů.
 * Musí se spustit jako první.
 */
function wrapPageImages() {
    const papers = document.querySelectorAll('.paper');
    papers.forEach(paper => {
        const sides = paper.querySelectorAll('.front, .back');
        sides.forEach(side => {
            const image = side.querySelector('.page-image');
            if (image) {
                const wrapper = document.createElement('div');
                wrapper.className = 'page-content';
                // Přesuneme obrázek do nového wrapperu
                side.appendChild(wrapper);
                wrapper.appendChild(image);
            }
        });
    });
}

// ZAVOLÁME NOVOU FUNKCI HNED NA ZAČÁTKU
wrapPageImages();


// Zde definujte, na které stránce (podle čísla v názvu souboru, např. page-5.jpg)
// se má zobrazit jaký GIF. Můžete jich přidat kolik chcete.
const gifOverlays = {
    5: 'assets/page-5-overlay.gif',
    7: 'assets/page-7-overlay.gif'
};

/**
 * Tato funkce automaticky vloží definované GIFy jako vrstvu
 * přímo nad obrázky stránek do nově vytvořeného kontejneru.
 */
function setupGifOverlays() {
    for (const pageNumStr in gifOverlays) {
        const pageNumber = parseInt(pageNumStr, 10);
        const gifSrc = gifOverlays[pageNumStr];

        const paperIndex = Math.floor(pageNumber / 2);
        const sideClass = (pageNumber % 2 === 0) ? '.front' : '.back';

        const paperEl = document.getElementById(`p${paperIndex}`);
        if (!paperEl) continue;

        // Cílíme na nový kontejner .page-content uvnitř .front nebo .back
        const contentWrapper = paperEl.querySelector(`${sideClass} .page-content`);
        if (!contentWrapper) continue;

        const gifImg = document.createElement('img');
        gifImg.src = gifSrc;
        gifImg.className = 'gif-overlay';
        gifImg.setAttribute('alt', '');

        contentWrapper.appendChild(gifImg);
    }
}

// Zavoláme funkci pro vložení GIFů.
setupGifOverlays();


// ====== Core book engine (v14 base) ======
// (Tato část je váš původní, funkční kód)
const book = document.getElementById('book');
const slider = document.getElementById('pageSlider');
const papers = [];
for (let i = 0; i <= 11; i++) {
    const p = document.getElementById(`p${i}`);
    if (p) papers.push(p);
}
const MAX_SPREAD = parseFloat(slider.max);
let currentSpread = 0;

const btnJump = document.getElementById('btn-jump');
const interactiveLayer = document.getElementById('interactive-layer');

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
        btn.onclick = () => {
            openLightbox(data.mediaSrc);
        };
        interactiveLayer.appendChild(btn);
    });
}

btnJump.onclick = () => {
    openLightbox('media/medium7_spread8.jpg');
};

function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
function updateBook(v) {
    papers.forEach((paper, i) => {
        const progress = v - i;
        if (progress <= 0) { paper.style.transform = 'rotateY(0deg)'; paper.style.zIndex = 100 + (papers.length - i); }
        else if (progress >= 1) { paper.style.transform = 'rotateY(-180deg)'; paper.style.zIndex = 100 + i; }
        else { paper.style.transform = `rotateY(${-180 * progress}deg)`; paper.style.zIndex = 2000; }
    });
}
let animFrame = null, isAnimating = false;
function stopAnimation() { if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; } }
function animateTo(from, to, dur = 800) {
    if (isAnimating) return;
    isAnimating = true;
    stopAnimation();
    hideButtons();
    const target = Math.max(0, Math.min(MAX_SPREAD, to));
    const diff = target - from;
    const start = performance.now();
    function tick(t) {
        let u = (t - start) / dur;
        if (u > 1) u = 1;
        const eased = easeOutCubic(u);
        const val = from + diff * eased;
        slider.value = val;
        updateBook(val);
        if (u < 1) {
            animFrame = requestAnimationFrame(tick);
        } else {
            currentSpread = target;
            slider.value = currentSpread;
            updateBook(currentSpread);
            animFrame = null;
            isAnimating = false;
            renderButtons(currentSpread);
        }
    }
    animFrame = requestAnimationFrame(tick);
}
function goTo(sp) { if (sp !== currentSpread) animateTo(currentSpread, sp, 800); }
function next() { goTo(currentSpread + 1); }
function prev() { goTo(currentSpread - 1); }
slider.addEventListener('input', e => { if (!isAnimating) hideButtons(); updateBook(parseFloat(slider.value)); });
slider.addEventListener('change', e => { if (!isAnimating) { const target = Math.round(parseFloat(slider.value)); animateTo(parseFloat(slider.value), target, 500); } });
function handleSliderTap(clientX) { const rect = slider.getBoundingClientRect(); const x = clientX - rect.left; const pct = x / rect.width; const target = Math.round(pct * MAX_SPREAD); goTo(target); }
slider.addEventListener('mousedown', e => { if (e.target === slider) handleSliderTap(e.clientX); });
slider.addEventListener('touchstart', e => { if (e.target === slider && e.touches.length === 1) { handleSliderTap(e.touches[0].clientX); e.preventDefault(); } }, { passive: false });
let wheelAccum = 0, wheelAnimating = false;
function animateWheel() {
    if (Math.abs(wheelAccum) < 0.001) { wheelAnimating = false; const target = Math.round(parseFloat(slider.value)); animateTo(parseFloat(slider.value), target, 500); return; }
    const current = parseFloat(slider.value); const step = wheelAccum * 0.15; wheelAccum -= step;
    const nextVal = Math.max(0, Math.min(MAX_SPREAD, current + step)); slider.value = nextVal; updateBook(nextVal); requestAnimationFrame(animateWheel);
}
window.addEventListener('wheel', e => { if (lightbox.classList.contains('show')) return; e.preventDefault(); wheelAccum += e.deltaY * 0.0025; if (!wheelAnimating) { hideButtons(); wheelAnimating = true; requestAnimationFrame(animateWheel); } }, { passive: false });
let tSX = null, tSY = null;
book.addEventListener('touchstart', e => { if (e.touches.length === 1) { tSX = e.touches[0].clientX; tSY = e.touches[0].clientY; } });
book.addEventListener('touchend', e => { if (tSX === null) return; const dx = e.changedTouches[0].clientX - tSX; const dy = e.changedTouches[0].clientY - tSY; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) { if (dx < 0) next(); else prev(); } tSX = null; tSY = null; });

// ====== Lightbox with media (images, gifs, mp4/webm, youtube/vimeo) ======
const lightbox = document.getElementById('lightbox');
const stage = document.getElementById('lightbox-stage');
const lbPlay = document.getElementById('lb-play');
const arrowLeft = document.getElementById('arrowLeft');
const arrowRight = document.getElementById('arrowRight');
let mediaItems = [
    { src: 'media/medium1_spread3.jpg' }, { src: 'media/medium2_spread4.gif' }, { src: 'media/medium3_spread4.gif' },
    { src: 'media/medium5_spread6_1114653811.vimeo' }, { src: 'medium6_spread7_1114707280.vimeo' }, { src: 'media/medium7_spread8.jpg' }
];
let currentMediaIndex = 0;
function parseSpreadFromFilename(filename) { const m = filename.match(/_spread(\d+)/); if (m) return parseInt(m[1]); }
function ext(path) { const m = path.match(/\.([a-z0-9]+)$/i); return m ? m[1].toLowerCase() : ''; }
function openLightbox(src) {
    let idx = mediaItems.findIndex(m => m.src === src);
    if (idx === -1) { mediaItems.push({ src }); idx = mediaItems.length - 1; }
    currentMediaIndex = idx;
    showMedia(idx);
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
    arrowLeft.style.display = 'none'; arrowRight.style.display = 'none';
}
function closeLightbox() {
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
    stage.innerHTML = '';
    lbPlay.classList.remove('show');
    arrowLeft.style.display = 'block'; arrowRight.style.display = 'block';
}
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
window.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('show')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') lightboxNext();
    if (e.key === 'ArrowLeft') lightboxPrev();
});
function showMedia(index) {
    if (index < 0 || index >= mediaItems.length) return;
    currentMediaIndex = index;
    const item = mediaItems[index];
    const source = item.src;
    stage.innerHTML = '';
    const spread = parseSpreadFromFilename(source);
    if (spread !== undefined && spread !== currentSpread) goTo(spread);
    const e = ext(source);
    const lbZoom = document.getElementById('lb-zoom');
    if (lbZoom) lbZoom.style.display = 'none';
    if (['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(e)) {
        const img = document.createElement('img');
        img.src = source;
        img.draggable = false;
        stage.appendChild(img);
        lbPlay.classList.remove('show');
        if (lbZoom) {
            lbZoom.style.display = 'block';
            lbZoom.classList.remove('active');
        }
        let zoomMode = false, scale = 1, posX = 0, posY = 0, isDragging = false, startX, startY;
        function applyTransform() { img.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`; }
        if (lbZoom) {
            lbZoom.onclick = () => {
                zoomMode = !zoomMode;
                if (zoomMode) {
                    lbZoom.classList.add('active');
                    scale = 1; posX = 0; posY = 0;
                    applyTransform();
                    img.style.cursor = "grab";
                } else {
                    lbZoom.classList.remove('active');
                    scale = 1; posX = 0; posY = 0;
                    applyTransform();
                    img.style.cursor = "default";
                }
            };
        }
        img.addEventListener("wheel", (ev) => {
            if (!zoomMode) return;
            ev.preventDefault();
            ev.stopPropagation();
            const delta = ev.deltaY > 0 ? -0.1 : 0.1;
            scale = Math.min(Math.max(1, scale + delta), 5);
            applyTransform();
        });
        img.addEventListener("dblclick", () => {
            if (!zoomMode) return;
            if (scale === 1) { scale = 2; img.style.cursor = "grab"; }
            else { scale = 1; posX = 0; posY = 0; img.style.cursor = "default"; }
            applyTransform();
        });
        img.addEventListener("mousedown", (ev) => {
            if (!zoomMode || scale <= 1) return;
            isDragging = true;
            startX = ev.clientX - posX;
            startY = ev.clientY - posY;
            img.style.cursor = "grabbing";
        });
        window.addEventListener("mousemove", (ev) => {
            if (!isDragging) return;
            posX = ev.clientX - startX;
            posY = ev.clientY - startY;
            applyTransform();
        });
        window.addEventListener("mouseup", () => {
            if (isDragging) { isDragging = false; img.style.cursor = "grab"; }
        });
    } else if (['gif'].includes(e)) {
        const img = document.createElement('img');
        img.src = source;
        img.draggable = false;
        stage.appendChild(img);
        lbPlay.classList.remove('show');
        if (lbZoom) lbZoom.style.display = 'none';
    } else if (['mp4', 'webm', 'ogg'].includes(e)) {
        const video = document.createElement('video');
        video.src = source;
        video.controls = true;
        video.playsInline = true;
        video.autoplay = false;
        stage.appendChild(video);
        lbPlay.classList.add('show');
        lbPlay.onclick = () => { lbPlay.classList.remove('show'); video.play(); };
        if (lbZoom) lbZoom.style.display = 'none';
    } else if (['youtube', 'vimeo'].includes(e)) {
        const idMatch = source.match(/_([0-9]{6,})(?:-h([A-Za-z0-9]+))?\.(youtube|vimeo)$/i);
        let embed = null;
        if (idMatch) {
            const id = idMatch[1];
            if (e === 'youtube') {
                embed = `https://www.youtube-nocookie.com/embed/${id}?autoplay=0&controls=1&modestbranding=1&rel=0`;
            } else {
                const h = idMatch[2] ? `&h=${idMatch[2]}` : '';
                embed = `https://player.vimeo.com/video/${id}?autoplay=1&loop=1&title=0&byline=0${h}`;
            }
        }
        if (embed) {
            const iframe = document.createElement('iframe');
            iframe.src = embed;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen';
            iframe.allowFullscreen = true;
            iframe.width = '960';
            iframe.height = '540';
            stage.appendChild(iframe);
            lbPlay.classList.remove('show');
        }
    }
}
function lightboxNext() { if (currentMediaIndex < mediaItems.length - 1) { showMedia(currentMediaIndex + 1); } }
function lightboxPrev() { if (currentMediaIndex > 0) { showMedia(currentMediaIndex - 1); } }
lightbox.addEventListener('wheel', e => { if (!lightbox.classList.contains('show')) return; e.preventDefault(); if (e.deltaY > 0) lightboxNext(); else lightboxPrev(); }, { passive: false });
slider.value = 0; updateBook(0);