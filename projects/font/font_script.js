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
    (function setupSandbox() {
        const text = document.getElementById('sandbox-text');
        const sizeSlider = document.getElementById('size-slider-1');
        const weightSlider = document.getElementById('weight-slider-1');
        const heightSlider = document.getElementById('height-slider-1');
        if (!text || !sizeSlider || !weightSlider || !heightSlider) return;

        function updateFont() {
            text.style.fontSize = `${sizeSlider.value}px`;
            text.style.fontVariationSettings = `'wght' ${weightSlider.value}, 'hght' ${heightSlider.value}`;
        }
        sizeSlider.addEventListener('input', updateFont);
        weightSlider.addEventListener('input', updateFont);
        heightSlider.addEventListener('input', updateFont);
        updateFont();
    })();

    // --- DEMO 2: INTERAKTIVNÍ TEXT ---
    (function setupInteractiveSentence() {
        const sentence = document.getElementById('sentence-interactive');
        const wrapper = document.querySelector('.interactive-sentence-wrapper');
        const sizeSlider = document.getElementById('size-slider-2');
        const switcher = document.querySelector('.switcher');
        const waveToggle = document.getElementById('wave-toggle');
        if (!sentence || !wrapper || !sizeSlider || !switcher || !waveToggle) return;

        let letters = [];
        let animationFrameId = null;
        let activeMode = 'wght';

        function updateFontSize() { sentence.style.fontSize = `${sizeSlider.value}px`; }

        function checkAndResizeText() {
            if ((sentence.scrollWidth > wrapper.clientWidth || sentence.scrollHeight > wrapper.clientHeight) && parseFloat(sizeSlider.value) > 20) {
                sizeSlider.value = parseFloat(sizeSlider.value) - 5;
                updateFontSize();
            }
        }

        function wrapLetters() {
            const text = sentence.textContent;
            const selection = window.getSelection();
            let cursorPos = 0;
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const preCaretRange = range.cloneRange();
                preCaretRange.selectNodeContents(sentence);
                preCaretRange.setEnd(range.endContainer, range.endOffset);
                cursorPos = preCaretRange.toString().length;
            }
            sentence.innerHTML = '';
            letters = text.split('').map(char => {
                const span = document.createElement('span');
                span.textContent = char;
                if (char.trim() === '') span.style.whiteSpace = 'pre';
                sentence.appendChild(span);
                return span;
            });

            if (letters.length > 0) {
                const newRange = document.createRange();
                let charCount = 0;
                for (const span of letters) {
                    if (cursorPos <= charCount + span.textContent.length) {
                        newRange.setStart(span.firstChild || span, cursorPos - charCount);
                        newRange.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                        return;
                    }
                    charCount += span.textContent.length;
                }
                const lastSpan = letters[letters.length - 1];
                newRange.selectNodeContents(lastSpan);
                newRange.collapse(false);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
            requestAnimationFrame(checkAndResizeText);
        }

        sentence.addEventListener('input', wrapLetters);
        sizeSlider.addEventListener('input', updateFontSize);

        sentence.addEventListener('mousemove', e => {
            if (animationFrameId) return;
            const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
            if (!letters.includes(hoveredEl)) return;
            const hoveredIndex = letters.indexOf(hoveredEl);
            letters.forEach((span, index) => {
                const distance = Math.abs(index - hoveredIndex);
                const influence = Math.max(0, 1 - distance / 10);
                const wght = 100 + 800 * (activeMode === 'wght' || activeMode === 'both' ? influence : 0);
                const hght = 400 + 400 * (activeMode === 'hght' || activeMode === 'both' ? influence : 0);
                span.style.fontVariationSettings = `'wght' ${wght}, 'hght' ${hght}`;
            });
        });

        sentence.addEventListener('mouseleave', () => {
            if (animationFrameId) return;
            letters.forEach(span => span.style.fontVariationSettings = `'wght' 400, 'hght' 500`);
        });

        switcher.addEventListener('click', e => {
            if (e.target.classList.contains('switch-btn')) {
                switcher.querySelector('.active').classList.remove('active');
                e.target.classList.add('active');
                activeMode = e.target.dataset.mode;
            }
        });

        function waveAnimation() {
            const time = Date.now() * 0.002;
            letters.forEach((span, index) => {
                const influence = (Math.sin(time - index * 0.2) + 1) / 2;
                const wght = 100 + 800 * (activeMode === 'wght' || activeMode === 'both' ? influence : 0);
                const hght = 400 + 400 * (activeMode === 'hght' || activeMode === 'both' ? influence : 0);
                span.style.fontVariationSettings = `'wght' ${wght}, 'hght' ${hght}`;
            });
            animationFrameId = requestAnimationFrame(waveAnimation);
        }

        waveToggle.addEventListener('click', () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
                waveToggle.innerHTML = '▶';
                waveToggle.classList.remove('playing');
                sentence.dispatchEvent(new Event('mouseleave'));
            } else {
                waveToggle.innerHTML = '❚❚';
                waveToggle.classList.add('playing');
                waveAnimation();
            }
        });

        wrapLetters();
        updateFontSize();
    })();

    // --- DEMO 3: TEXTOVÁ STĚNA ---
    (function initializeLoremWall() {
        const canvas = document.getElementById('lorem-wall-canvas');
        if (!canvas) return;
        const button = document.querySelector('button[data-target="demo3"]');

        const init = () => {
            if (canvas.dataset.initialized) return;
            canvas.dataset.initialized = 'true';
            const ctx = canvas.getContext('2d', { alpha: false });

            const FONT_SIZE = 90;
            const BASE_WEIGHT = 100;
            const MAX_WEIGHT = 900;
            const text = "BLOKKADA";

            let letters = [];
            let mouse = { x: -9999, y: -9999, radius: 250 };
            let ripples = [];

            async function setup() {
                await document.fonts.load(`1em "Blokkada VF"`);
                const dpr = window.devicePixelRatio || 1;
                const rect = canvas.parentElement.getBoundingClientRect();
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr);

                letters = [];
                const margin = 100;
                let charIndex = 0;
                const charWidth = FONT_SIZE * 0.7;
                const lineHeight = FONT_SIZE * 1.1;

                for (let y = 0; y < rect.height + margin; y += lineHeight) {
                    let currentX = -margin;
                    while (currentX < rect.width + margin) {
                        letters.push({
                            char: text[charIndex % text.length],
                            x: currentX, y, currentWeight: BASE_WEIGHT,
                        });
                        currentX += charWidth;
                        charIndex++;
                    }
                }
                if (!canvas.dataset.animated) { animate(); canvas.dataset.animated = "true"; }
            }

            function animate() {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ripples.forEach((ripple, index) => {
                    ripple.radius += ripple.speed;
                    if (ripple.radius > ripple.maxRadius) {
                        ripples.splice(index, 1);
                    }
                });

                letters.forEach(letter => {
                    const dxMouse = letter.x - mouse.x;
                    const dyMouse = letter.y - mouse.y;
                    const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
                    let totalInfluence = 0;

                    if (distMouse < mouse.radius) {
                        totalInfluence = Math.pow(1 - (distMouse / mouse.radius), 1.5);
                    }

                    ripples.forEach(ripple => {
                        const dxRipple = letter.x - ripple.x;
                        const dyRipple = letter.y - ripple.y;
                        const distRipple = Math.sqrt(dxRipple * dxRipple + dyRipple * dyRipple);
                        const waveFront = Math.abs(distRipple - ripple.radius);
                        if (waveFront < ripple.width) {
                            const normalizedPos = waveFront / ripple.width;
                            const smoothstep = 0.5 - 0.5 * Math.cos(normalizedPos * Math.PI);
                            const rippleEffect = smoothstep;
                            totalInfluence = Math.max(totalInfluence, rippleEffect);
                        }
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

            canvas.addEventListener('mousemove', e => {
                const rect = canvas.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
            });
            canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
            canvas.addEventListener('click', e => {
                const rect = canvas.getBoundingClientRect();
                const maxRadius = Math.max(rect.width, rect.height) + 200;
                ripples.push({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    radius: 0, speed: 25, width: 250, maxRadius,
                });
            });

            window.addEventListener('resize', setup);
            setup();
        };
        button?.addEventListener('click', init, { once: true });
    })();
});