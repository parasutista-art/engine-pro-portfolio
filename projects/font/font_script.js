document.addEventListener('DOMContentLoaded', () => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // --- LOGIKA PŘEPÍNÁNÍ ZÁLOŽEK ---
    const navButtons = document.querySelectorAll('.demo-nav-btn');
    const demoPanels = document.querySelectorAll('.demo-panel');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            demoPanels.forEach(panel => panel.classList.remove('active'));
            button.classList.add('active');
            const targetId = button.getAttribute('data-target');
            document.getElementById(targetId)?.classList.add('active');
        });
    });

    // --- DEMO 1: SANDBOX ---
    (function setupInteractiveDemo1() {
        const textElement = document.getElementById('interactive-text');
        const sizeSlider = document.getElementById('size-slider');
        const weightSlider = document.getElementById('weight-slider');
        const heightSlider = document.getElementById('height-slider');
        const weightSliderGroup = document.getElementById('weight-slider-group');
        const heightSliderGroup = document.getElementById('height-slider-group');
        const switcher = document.querySelector('#demo1 .switcher');
        const waveToggle = document.getElementById('wave-toggle');
        const tooltip = document.getElementById('disabled-slider-tooltip');

        if (!textElement || !sizeSlider || !weightSlider || !heightSlider || !switcher || !waveToggle || !tooltip) return;

        let letters = [];
        let animationFrameId = null;
        let activeMode = 'off';
        const MIN_WGHT = 100, MIN_HGHT = 400;

        function getCaretPosition(element) {
            let position = 0;
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(element);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                position = preCaretRange.toString().length;
            }
            return position;
        }

        function setCaretPosition(element, position) {
            const range = document.createRange();
            const selection = window.getSelection();
            let charCount = 0; let found = false;
            function traverse(node) {
                if (found) return;
                if (node.nodeType === Node.TEXT_NODE) {
                    const len = node.length;
                    if (charCount + len >= position) {
                        range.setStart(node, position - charCount);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        found = true;
                    } else { charCount += len; }
                } else { for (const child of node.childNodes) { traverse(child); } }
            }
            if (element.childNodes.length > 0) traverse(element);
        }

        function getBaseVariationSettings() {
            let wght = weightSlider.value, hght = heightSlider.value;
            if (activeMode === 'wght' || activeMode === 'both') wght = MIN_WGHT;
            if (activeMode === 'hght' || activeMode === 'both') hght = MIN_HGHT;
            return `'wght' ${wght}, 'hght' ${hght}`;
        }

        function applyStylesToText(settings) { letters.forEach(span => { span.style.fontVariationSettings = settings; }); }
        function updateText() { textElement.style.fontSize = `${sizeSlider.value}px`; applyStylesToText(getBaseVariationSettings()); }

        function wrapLetters() {
            const text = textElement.textContent;
            textElement.innerHTML = '';
            letters = text.split('').map(char => {
                const span = document.createElement('span');
                span.textContent = char;
                if (char.trim() === '') span.style.whiteSpace = 'pre';
                textElement.appendChild(span);
                return span;
            });
            updateText();
        }

        function handleMouseMove(e) {
            if (isMobile || activeMode === 'off' || animationFrameId) return;
            const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
            if (!textElement.contains(hoveredEl)) { handleMouseLeave(); return; }
            const hoveredIndex = letters.indexOf(hoveredEl);
            if (hoveredIndex === -1) return;
            letters.forEach((span, index) => {
                const distance = Math.abs(index - hoveredIndex);
                const influence = Math.max(0, 1 - distance / 10);
                const wghtValue = (activeMode === 'wght' || activeMode === 'both') ? MIN_WGHT + (900 - MIN_WGHT) * influence : weightSlider.value;
                const hghtValue = (activeMode === 'hght' || activeMode === 'both') ? MIN_HGHT + (800 - MIN_HGHT) * influence : heightSlider.value;
                span.style.fontVariationSettings = `'wght' ${wghtValue}, 'hght' ${hghtValue}`;
            });
        }

        function handleMouseLeave() { if (activeMode === 'off' || animationFrameId) return; updateText(); }

        function waveAnimation() {
            const time = Date.now() * 0.002;
            letters.forEach((span, index) => {
                const influence = (Math.sin(time - index * 0.2) + 1) / 2;
                const wghtValue = (activeMode === 'wght' || activeMode === 'both') ? MIN_WGHT + (900 - MIN_WGHT) * influence : weightSlider.value;
                const hghtValue = (activeMode === 'hght' || activeMode === 'both') ? MIN_HGHT + (800 - MIN_HGHT) * influence : heightSlider.value;
                span.style.fontVariationSettings = `'wght' ${wghtValue}, 'hght' ${hghtValue}`;
            });
            animationFrameId = requestAnimationFrame(waveAnimation);
        }

        function stopWaveAnimation() { if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; waveToggle.innerHTML = '▶'; waveToggle.classList.remove('playing'); updateText(); } }
        function startWaveAnimation() { if (!animationFrameId) { waveToggle.innerHTML = '❚❚'; waveToggle.classList.add('playing'); waveAnimation(); } }

        function setupTooltip(group, slider) {
            if (isMobile) return;
            group.addEventListener('mouseover', () => { if (slider.disabled) tooltip.style.display = 'block'; });
            group.addEventListener('mousemove', (e) => { if (slider.disabled) { tooltip.style.left = `${e.clientX}px`; tooltip.style.top = `${e.clientY}px`; } });
            group.addEventListener('mouseout', () => { tooltip.style.display = 'none'; });
        }

        sizeSlider.addEventListener('input', updateText);
        weightSlider.addEventListener('input', updateText);
        heightSlider.addEventListener('input', updateText);
        textElement.addEventListener('input', () => { const pos = getCaretPosition(textElement); wrapLetters(); setCaretPosition(textElement, pos); });
        document.body.addEventListener('mousemove', handleMouseMove);

        waveToggle.addEventListener('click', () => { if (animationFrameId) stopWaveAnimation(); else startWaveAnimation(); });

        switcher.addEventListener('click', e => {
            if (e.target.classList.contains('switch-btn')) {
                switcher.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');
                activeMode = e.target.dataset.mode;

                // Mobilní logika pro animaci
                if (isMobile) {
                    if (activeMode !== 'off') {
                        startWaveAnimation();
                    } else {
                        stopWaveAnimation();
                    }
                }

                // Desktop logika
                if (activeMode === 'off' && animationFrameId && !isMobile) { stopWaveAnimation(); }
                weightSlider.disabled = ['wght', 'both'].includes(activeMode) && !isMobile; // Na mobilu nikdy nedeaktivovat
                heightSlider.disabled = ['hght', 'both'].includes(activeMode) && !isMobile;
                weightSliderGroup.classList.toggle('disabled', weightSlider.disabled);
                heightSliderGroup.classList.toggle('disabled', heightSlider.disabled);
                updateText();
            }
        });

        setupTooltip(weightSliderGroup, weightSlider);
        setupTooltip(heightSliderGroup, heightSlider);
        if (isMobile) { sizeSlider.value = 90; }
        wrapLetters();
    })();

    // --- DEMO 3: STĚNA (Přepracované vlny) ---
    (function initializeLoremWall() {
        const canvas = document.getElementById('lorem-wall-canvas');
        if (!canvas) return;
        const button = document.querySelector('button[data-target="demo3"]');

        const init = () => {
            if (canvas.dataset.initialized) return;
            canvas.dataset.initialized = 'true';

            const ctx = canvas.getContext('2d', { alpha: false });
            const FONT_SIZE = isMobile ? 40 : 50; // Menší text na mobilu
            const BASE_WEIGHT = 100, MAX_WEIGHT = 900;
            const word = "BLOKKADA";
            let letters = [];
            let ripples = [];
            let lastFrameTime = 0;
            const FRAME_INTERVAL = 1000 / 24; // Stabilní FPS

            async function setup() {
                await document.fonts.load(`1em "Blokkada VF"`);
                const dpr = window.devicePixelRatio || 1;
                const rect = canvas.parentElement.getBoundingClientRect();
                canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr);
                letters = [];
                ctx.font = `normal ${BASE_WEIGHT} ${FONT_SIZE}px 'Blokkada VF'`;

                const spaceWidth = ctx.measureText(' ').width * 1.5;
                const lineHeight = FONT_SIZE * 1.0;

                for (let y = FONT_SIZE * 0.8; y < rect.height; y += lineHeight) {
                    let x = Math.random() * -100;
                    while (x < rect.width) {
                        for (let i = 0; i < word.length; i++) {
                            const char = word[i];
                            const charWidth = ctx.measureText(char).width;
                            letters.push({ char: char, x: x + (Math.random() - 0.5) * 3, y: y, currentWeight: BASE_WEIGHT, });
                            x += charWidth;
                        }
                        x += spaceWidth;
                    }
                }

                if (!canvas.dataset.animated) {
                    requestAnimationFrame(animate);
                    canvas.dataset.animated = "true";
                }
            }

            // Funkce pro Gaussovu křivku - definuje profil vlny
            function gaussian(x, peak, width) {
                return Math.exp(-Math.pow(x - peak, 2) / (2 * Math.pow(width, 2)));
            }

            function animate(timestamp) {
                requestAnimationFrame(animate);
                if (timestamp - lastFrameTime < FRAME_INTERVAL) return;
                lastFrameTime = timestamp;

                ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                ripples.forEach((ripple, index) => {
                    ripple.radius += ripple.speed;
                    if (ripple.radius > ripple.maxRadius) ripples.splice(index, 1);
                });

                letters.forEach(letter => {
                    let totalInfluence = 0;
                    ripples.forEach(ripple => {
                        const distFromEpicenter = Math.hypot(letter.x - ripple.x, letter.y - ripple.y);
                        // Použijeme Gaussovu křivku pro plynulý profil vlny
                        const influence = gaussian(distFromEpicenter, ripple.radius, ripple.width / 2);
                        if (influence > totalInfluence) totalInfluence = influence;
                    });

                    const targetWeight = BASE_WEIGHT + (MAX_WEIGHT - BASE_WEIGHT) * totalInfluence;
                    if (Math.abs(targetWeight - letter.currentWeight) > 1) {
                        letter.currentWeight += (targetWeight - letter.currentWeight) * 0.2;
                    }

                    ctx.font = `normal ${letter.currentWeight} ${FONT_SIZE}px 'Blokkada VF'`;
                    const colorValue = 80 + 175 * totalInfluence;
                    ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
                    ctx.fillText(letter.char, letter.x, letter.y);
                });
            }

            canvas.addEventListener('click', e => {
                const rect = canvas.getBoundingClientRect();
                const maxRadius = Math.max(rect.width, rect.height) + 100;
                ripples.push({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    radius: 0,
                    speed: 15,
                    width: isMobile ? 40 : 60, // Šířka vlny
                    maxRadius,
                });
            });

            const resizeObserver = new ResizeObserver(() => { setTimeout(setup, 50); });
            resizeObserver.observe(canvas.parentElement);

            setup();
        };

        button?.addEventListener('click', init, { once: true });
        if (document.getElementById('demo3').classList.contains('active')) { init(); }
    })();
});