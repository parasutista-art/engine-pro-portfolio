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

    // --- DEMO 1: PÍSKOVIŠTĚ ---
    const sandboxText = document.getElementById('sandbox-text');
    const sandboxWrapper = document.querySelector('.sandbox-wrapper');
    const weightSlider = document.getElementById('weight-slider');
    const heightSlider = document.getElementById('height-slider');

    function adjustSandboxFontSize() {
        if (!sandboxText || !sandboxWrapper) return;
        let fontSize = 200;
        sandboxText.style.fontSize = fontSize + 'px';
        while ((sandboxText.scrollWidth > sandboxWrapper.clientWidth || sandboxText.scrollHeight > sandboxWrapper.clientHeight) && fontSize > 10) {
            fontSize -= 5;
            sandboxText.style.fontSize = fontSize + 'px';
        }
    }

    function updateSandboxFont() {
        if (!sandboxText) return;
        const weight = weightSlider.value;
        const height = heightSlider.value;
        sandboxText.style.fontVariationSettings = `'wght' ${weight}, 'hght' ${height}`;
    }

    if (sandboxText && weightSlider && heightSlider) {
        weightSlider.addEventListener('input', updateSandboxFont);
        heightSlider.addEventListener('input', updateSandboxFont);
        sandboxText.addEventListener('input', adjustSandboxFontSize);
        window.addEventListener('resize', adjustSandboxFontSize);
        updateSandboxFont();
        setTimeout(adjustSandboxFontSize, 50);
    }

    // --- FUNKCE PRO DEMO 2 & 3 ---
    function setupInteractiveSentence(containerId, propertyToVary, baseValues, min, max) {
        const sentenceContainer = document.getElementById(containerId);
        if (!sentenceContainer || sentenceContainer.dataset.initialized) return;
        sentenceContainer.dataset.initialized = 'true';
        const text = sentenceContainer.textContent;
        sentenceContainer.innerHTML = '';
        const letters = text.split('').map(char => {
            const span = document.createElement('span');
            span.textContent = char;
            if (char === ' ') span.style.whiteSpace = 'pre';
            sentenceContainer.appendChild(span);
            return span;
        });
        sentenceContainer.addEventListener('mousemove', (e) => {
            const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
            if (!letters.includes(hoveredEl)) return;
            const hoveredIndex = letters.indexOf(hoveredEl);
            letters.forEach((span, index) => {
                const distance = Math.abs(index - hoveredIndex);
                const influence = Math.max(0, 1 - distance / 8);
                const value = min + (max - min) * influence;
                const settings = propertyToVary === 'wght'
                    ? `'wght' ${value}, 'hght' ${baseValues.height}`
                    : `'wght' ${baseValues.weight}, 'hght' ${value}`;
                span.style.fontVariationSettings = settings;
            });
        });
        sentenceContainer.addEventListener('mouseleave', () => {
            const defaultSettings = `'wght' ${baseValues.weight}, 'hght' ${baseValues.height}`;
            letters.forEach(span => span.style.fontVariationSettings = defaultSettings);
        });
        sentenceContainer.dispatchEvent(new Event('mouseleave'));
    }

    // --- PŘEPRACOVANÁ LOGIKA PRO DEMO 4 (CANVAS) ---
    function initializeLoremWall() {
        const canvas = document.getElementById('lorem-wall-canvas');
        if (!canvas || canvas.dataset.initialized) return;
        canvas.dataset.initialized = 'true';

        const ctx = canvas.getContext('2d');
        const FONT_SIZE = 28; // <<< ZVĚTŠENO
        const BASE_WEIGHT = 200;
        const MAX_WEIGHT = 900;
        const text = "lorem ipsum dolor sit amet ".repeat(50);

        let letters = [];
        let mouse = { x: -9999, y: -9999, radius: 150 };
        let ripples = [];

        function resizeAndPrepare() {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            ctx.font = `${BASE_WEIGHT} ${FONT_SIZE}px 'Blokkada VF'`;
            ctx.fillStyle = '#333';

            letters = [];
            let x = 0;
            let y = FONT_SIZE;
            const words = text.split(' ');

            for (const word of words) {
                const wordWidth = ctx.measureText(word).width;
                if (x + wordWidth > canvas.width / dpr) {
                    x = 0;
                    y += FONT_SIZE * 1.2;
                }
                for (const char of word) {
                    letters.push({ char, x, y, currentWeight: BASE_WEIGHT, targetWeight: BASE_WEIGHT });
                    x += ctx.measureText(char).width;
                }
                x += ctx.measureText(' ').width; // mezera
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Zpracování vln (kliknutí)
            ripples.forEach((ripple, index) => {
                ripple.radius += ripple.speed;
                ripple.strength *= 0.95; // Vlna slábne
                if (ripple.strength < 0.1) ripples.splice(index, 1);
            });

            letters.forEach(letter => {
                // Výpočet vlivu myši
                const dxMouse = letter.x - mouse.x;
                const dyMouse = letter.y - mouse.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                let totalInfluence = 0;
                if (distMouse < mouse.radius) {
                    totalInfluence = 1 - (distMouse / mouse.radius);
                }

                // Výpočet vlivu vln
                ripples.forEach(ripple => {
                    const dxRipple = letter.x - ripple.x;
                    const dyRipple = letter.y - ripple.y;
                    const distRipple = Math.sqrt(dxRipple * dxRipple + dyRipple * dyRipple);
                    const rippleEffect = Math.max(0, 1 - Math.abs(distRipple - ripple.radius) / ripple.width) * ripple.strength;
                    totalInfluence = Math.max(totalInfluence, rippleEffect);
                });

                // Nastavení cílové tloušťky a plynulý přechod
                letter.targetWeight = BASE_WEIGHT + (MAX_WEIGHT - BASE_WEIGHT) * totalInfluence;
                letter.currentWeight += (letter.targetWeight - letter.currentWeight) * 0.1;

                // Vykreslení písmene
                ctx.font = `'wght' ${letter.currentWeight}, 'hght' 500`;
                ctx.fillText(letter.char, letter.x, letter.y);
            });

            requestAnimationFrame(animate);
        }

        canvas.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        canvas.addEventListener('mouseleave', () => {
            mouse.x = -9999;
            mouse.y = -9999;
        });

        canvas.addEventListener('click', e => {
            const rect = canvas.getBoundingClientRect();
            ripples.push({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                radius: 0,
                speed: 5,
                strength: 1,
                width: 60
            });
        });

        window.addEventListener('resize', resizeAndPrepare);
        resizeAndPrepare();
        animate();
    }

    // Inicializace dem při prvním kliknutí
    document.querySelector('button[data-target="demo2"]')?.addEventListener('click', () => setupInteractiveSentence('sentence-weight', 'wght', { weight: 100, height: 500 }, 100, 900), { once: true });
    document.querySelector('button[data-target="demo3"]')?.addEventListener('click', () => setupInteractiveSentence('sentence-height', 'hght', { weight: 400, height: 500 }, 400, 800), { once: true });
    document.querySelector('button[data-target="demo4"]')?.addEventListener('click', initializeLoremWall, { once: true });
});