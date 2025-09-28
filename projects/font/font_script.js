document.addEventListener('DOMContentLoaded', () => {
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

        const MIN_WGHT = 100;
        const MIN_HGHT = 400;
        
        // --- Funkce pro opravu kurzoru ---
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
            traverse(element);
        }

        function getBaseVariationSettings() {
            let wght = weightSlider.value; let hght = heightSlider.value;
            if (activeMode === 'wght') wght = MIN_WGHT;
            else if (activeMode === 'hght') hght = MIN_HGHT;
            else if (activeMode === 'both') { wght = MIN_WGHT; hght = MIN_HGHT; }
            return `'wght' ${wght}, 'hght' ${hght}`;
        }

        function applyStylesToText(settings) {
            textElement.style.fontVariationSettings = settings;
            letters.forEach(span => { span.style.fontVariationSettings = settings; });
        }

        function updateText() {
            textElement.style.fontSize = `${sizeSlider.value}px`;
            const baseSettings = getBaseVariationSettings();
            applyStylesToText(baseSettings);
        }

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
            if (activeMode === 'off' || animationFrameId) return;
            const rect = textElement.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) { handleMouseLeave(); return; }
            const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
            if (!letters.includes(hoveredEl)) return;
            const hoveredIndex = letters.indexOf(hoveredEl);
            letters.forEach((span, index) => {
                const distance = Math.abs(index - hoveredIndex);
                const influence = Math.max(0, 1 - distance / 10);
                const wghtValue = (activeMode === 'wght' || activeMode === 'both') ? MIN_WGHT + (900 - MIN_WGHT) * influence : weightSlider.value;
                const hghtValue = (activeMode === 'hght' || activeMode === 'both') ? MIN_HGHT + (800 - MIN_HGHT) * influence : heightSlider.value;
                span.style.fontVariationSettings = `'wght' ${wghtValue}, 'hght' ${hghtValue}`;
            });
        }
        
        function handleTouchMove(e) { if (e.touches.length > 0) { handleMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY }); } }
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
        function stopWaveAnimation() {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
                waveToggle.innerHTML = '▶';
                waveToggle.classList.remove('playing');
                updateText();
            }
        }
        function toggleWaveAnimation() {
            if (animationFrameId) { stopWaveAnimation(); } 
            else {
                if (activeMode === 'off') { const bothBtn = switcher.querySelector('[data-mode="both"]'); if (bothBtn) bothBtn.click(); }
                waveToggle.innerHTML = '❚❚'; waveToggle.classList.add('playing'); waveAnimation();
            }
        }
        sizeSlider.addEventListener('input', updateText);
        weightSlider.addEventListener('input', updateText);
        heightSlider.addEventListener('input', updateText);
        textElement.addEventListener('input', () => { const pos = getCaretPosition(textElement); wrapLetters(); setCaretPosition(textElement, pos); });
        document.body.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.body.addEventListener('mouseleave', handleMouseLeave);
        document.body.addEventListener('touchend', handleMouseLeave);
        waveToggle.addEventListener('click', toggleWaveAnimation);
        switcher.addEventListener('click', e => {
            if (e.target.classList.contains('switch-btn')) {
                switcher.querySelector('.active').classList.remove('active'); e.target.classList.add('active'); activeMode = e.target.dataset.mode;
                if (activeMode === 'off' && animationFrameId) { stopWaveAnimation(); }
                weightSlider.disabled = (activeMode === 'wght' || activeMode === 'both');
                heightSlider.disabled = (activeMode === 'hght' || activeMode === 'both');
                weightSliderGroup.classList.toggle('disabled', weightSlider.disabled);
                heightSliderGroup.classList.toggle('disabled', heightSlider.disabled);
                updateText();
            }
        });

        // --- Inicializace ---
        const isMobile = window.innerWidth <= 768;
        if (isMobile) { sizeSlider.value = 90; } // Menší výchozí velikost na mobilu

        wrapLetters();
        updateText();
        const bothButton = switcher.querySelector('[data-mode="both"]');
        if (bothButton) { bothButton.click(); }
        waveToggle.click();
    })();

    // --- DEMO 3: STĚNA ---
    (function initializeLoremWall() {
        const canvas = document.getElementById('lorem-wall-canvas');
        if (!canvas) return;
        const button = document.querySelector('button[data-target="demo3"]');
        const init = () => {
            if (canvas.dataset.initialized) return;
            canvas.dataset.initialized = 'true';
            const ctx = canvas.getContext('2d', { alpha: false });
            const FONT_SIZE = 60; // Zmenšený text
            const BASE_WEIGHT = 100; const MAX_WEIGHT = 900;
            const word = "BLOKKADA";
            let letters = [];
            let mouse = { x: -9999, y: -9999, radius: 200 };
            let ripples = [];
            async function setup() {
                await document.fonts.load(`1em "Blokkada VF"`);
                const dpr = window.devicePixelRatio || 1;
                const rect = canvas.parentElement.getBoundingClientRect();
                canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr); letters = [];
                const margin = 50;
                const charWidth = FONT_SIZE * 0.65;
                const wordWidth = word.length * charWidth;
                const wordSpacing = FONT_SIZE * 0.7; // Zmenšená mezera mezi slovy
                const lineHeight = FONT_SIZE * 0.9;
                for (let y = FONT_SIZE / 2; y < rect.height + margin; y += lineHeight) {
                    const rowIndex = Math.floor(y / lineHeight);
                    const rowOffset = rowIndex % 2 === 0 ? 0 : -wordWidth / 2;
                    let currentX = -margin + rowOffset;
                    while (currentX < rect.width + margin) {
                        for (let i = 0; i < word.length; i++) { letters.push({ char: word[i], x: currentX + (i * charWidth), y: y, currentWeight: BASE_WEIGHT, }); }
                        currentX += wordWidth + wordSpacing;
                    }
                }
                if (!canvas.dataset.animated) { 
                    animate(); canvas.dataset.animated = "true";
                    const maxRadius = Math.max(rect.width, rect.height) + 200;
                    ripples.push({ x: rect.width / 2, y: rect.height / 2, radius: 0, speed: 20, width: 200, maxRadius, });
                }
            }
            function animate() {
                ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                ripples.forEach((ripple, index) => { ripple.radius += ripple.speed; if (ripple.radius > ripple.maxRadius) ripples.splice(index, 1); });
                letters.forEach(letter => {
                    const dxMouse = letter.x - mouse.x; const dyMouse = letter.y - mouse.y; const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                    let totalInfluence = 0;
                    if (distMouse < mouse.radius) { totalInfluence = Math.pow(1 - (distMouse / mouse.radius), 1.5); }
                    ripples.forEach(ripple => {
                        const dxRipple = letter.x - ripple.x; const dyRipple = letter.y - ripple.y; const distRipple = Math.sqrt(dxRipple * dxRipple + dyRipple * dyRipple);
                        const waveFront = Math.abs(distRipple - ripple.radius);
                        if (waveFront < ripple.width) { const normalizedPos = waveFront / ripple.width; const smoothstep = 0.5 - 0.5 * Math.cos(normalizedPos * Math.PI); totalInfluence = Math.max(totalInfluence, smoothstep); }
                    });
                    const targetWeight = BASE_WEIGHT + (MAX_WEIGHT - BASE_WEIGHT) * totalInfluence;
                    letter.currentWeight += (targetWeight - letter.currentWeight) * 0.1;
                    ctx.font = `normal ${letter.currentWeight} ${FONT_SIZE}px 'Blokkada VF'`;
                    const colorValue = 80 + 175 * totalInfluence;
                    ctx.fillStyle = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;
                    ctx.fillText(letter.char, letter.x, letter.y);
                });
                requestAnimationFrame(animate);
            }
            function handleInteractionMove(e) { const rect = canvas.getBoundingClientRect(); mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; }
            function handleTouchInteractionMove(e) { if (e.touches.length > 0) { const rect = canvas.getBoundingClientRect(); mouse.x = e.touches[0].clientX - rect.left; mouse.y = e.touches[0].clientY - rect.top; } }
            function handleInteractionEnd() { mouse.x = -9999; mouse.y = -9999; }
            canvas.addEventListener('mousemove', handleInteractionMove);
            canvas.addEventListener('mouseleave', handleInteractionEnd);
            canvas.addEventListener('touchmove', handleTouchInteractionMove, { passive: true });
            canvas.addEventListener('touchend', handleInteractionEnd);
            canvas.addEventListener('touchcancel', handleInteractionEnd);
            canvas.addEventListener('click', e => { const rect = canvas.getBoundingClientRect(); const maxRadius = Math.max(rect.width, rect.height) + 200; ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, radius: 0, speed: 25, width: 250, maxRadius, }); });
            window.addEventListener('resize', setup);
            setup();
        };
        button?.addEventListener('click', init, { once: true });
        if (document.getElementById('demo3').classList.contains('active')) { init(); }
    })();
});