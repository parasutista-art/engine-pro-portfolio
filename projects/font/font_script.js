document.addEventListener('DOMContentLoaded', () => {
    // --- DEMO 1: SANDBOX (PLNĚ FUNKČNÍ) ---
    (function setupInteractiveDemo1() {
        const textElement = document.getElementById('interactive-text');
        const weightSlider = document.getElementById('weight-slider');
        const heightSlider = document.getElementById('height-slider');
        const weightSliderGroup = document.getElementById('weight-slider-group');
        const heightSliderGroup = document.getElementById('height-slider-group');
        const switcher = document.querySelector('#demo1 .switcher');
        const waveToggle = document.getElementById('wave-toggle');
        const tooltip = document.getElementById('disabled-slider-tooltip');

        if (!textElement || !weightSlider || !heightSlider || !switcher || !waveToggle || !tooltip) return;

        let letters = [];
        let animationFrameId = null;
        let activeMode = switcher.querySelector('.active')?.dataset.mode || 'off';
        const MIN_WGHT = 100, MIN_HGHT = 400;

        function getCaretPosition(element) { let position = 0; const selection = window.getSelection(); if (selection.rangeCount > 0) { const range = selection.getRangeAt(0); const preCaretRange = range.cloneRange(); preCaretRange.selectNodeContents(element); preCaretRange.setEnd(range.endContainer, range.endOffset); position = preCaretRange.toString().length; } return position; }
        function setCaretPosition(element, position) { const range = document.createRange(); const selection = window.getSelection(); let charCount = 0; let found = false; function traverse(node) { if (found) return; if (node.nodeType === Node.TEXT_NODE) { const len = node.length; if (charCount + len >= position) { range.setStart(node, position - charCount); range.collapse(true); selection.removeAllRanges(); selection.addRange(range); found = true; } else { charCount += len; } } else { for (const child of node.childNodes) { traverse(child); } } } if (element.childNodes.length > 0) traverse(element); }
        function getBaseVariationSettings() { let wght = weightSlider.value, hght = heightSlider.value; if (['wght', 'both'].includes(activeMode)) wght = MIN_WGHT; if (['hght', 'both'].includes(activeMode)) hght = MIN_HGHT; return `'wght' ${wght}, 'hght' ${hght}`; }
        function applyStylesToText(settings) { letters.forEach(span => { span.style.fontVariationSettings = settings; }); }

        function adjustFontSizeToFit() {
            const container = textElement.parentElement;
            const computedStyle = window.getComputedStyle(container);
            const paddingLeft = parseFloat(computedStyle.paddingLeft);
            const paddingRight = parseFloat(computedStyle.paddingRight);
            const maxWidth = container.clientWidth - paddingLeft - paddingRight;

            if (!textElement.textContent.trim()) { textElement.style.fontSize = '10px'; return; }

            textElement.style.visibility = 'hidden';

            let minFont = 10;
            let maxFont = container.clientHeight;
            let bestSize = minFont;

            while (minFont <= maxFont) {
                let midFont = Math.floor((minFont + maxFont) / 2);
                if (midFont <= 0) break;
                textElement.style.fontSize = midFont + 'px';

                if (textElement.scrollWidth <= maxWidth) {
                    bestSize = midFont;
                    minFont = midFont + 1;
                } else {
                    maxFont = midFont - 1;
                }
            }
            textElement.style.fontSize = bestSize + 'px';
            textElement.style.visibility = 'visible';
        }

        function updateText() {
            adjustFontSizeToFit();
            applyStylesToText(getBaseVariationSettings());
        }

        function wrapLetters(shouldUpdate = true) {
            let text = textElement.textContent.replace(/(\r\n|\n|\r)/gm, "");
            if (text !== textElement.textContent) {
                textElement.textContent = text;
            }
            textElement.innerHTML = '';
            letters = text.split('').map(char => { const span = document.createElement('span'); span.textContent = char; if (char.trim() === '') span.style.whiteSpace = 'pre'; textElement.appendChild(span); return span; });

            if (shouldUpdate) {
                updateText();
            }
        }

        // --- OPRAVA: Funkce sjednocena pro myš i dotyk ---
        function handleInteraction(e) {
            if (activeMode === 'off' || animationFrameId) return;

            // Získá souřadnice z myši nebo dotyku
            const point = e.touches ? e.touches[0] : e;
            if (!point) return;

            const hoveredEl = document.elementFromPoint(point.clientX, point.clientY);

            if (!textElement.contains(hoveredEl)) {
                handleInteractionEnd();
                return;
            }
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

        // --- OPRAVA: Funkce pro ukončení interakce (myš i dotyk) ---
        function handleInteractionEnd() {
            if (activeMode === 'off' || animationFrameId) return;
            updateText();
        }

        function waveAnimation() { const time = Date.now() * 0.002; letters.forEach((span, index) => { const influence = (Math.sin(time - index * 0.2) + 1) / 2; const wghtValue = (['wght', 'both'].includes(activeMode)) ? MIN_WGHT + (900 - MIN_WGHT) * influence : weightSlider.value; const hghtValue = (['hght', 'both'].includes(activeMode)) ? MIN_HGHT + (800 - MIN_HGHT) * influence : heightSlider.value; span.style.fontVariationSettings = `'wght' ${wghtValue}, 'hght' ${hghtValue}`; }); animationFrameId = requestAnimationFrame(waveAnimation); }
        function stopWaveAnimation() { if (animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; waveToggle.innerHTML = '▶'; waveToggle.classList.remove('playing'); updateText(); } }
        function startWaveAnimation() { if (!animationFrameId && activeMode !== 'off') { waveToggle.innerHTML = '❚❚'; waveToggle.classList.add('playing'); waveAnimation(); } }

        function setInteractionMode(newMode) {
            switcher.querySelector('.active')?.classList.remove('active');
            switcher.querySelector(`[data-mode="${newMode}"]`)?.classList.add('active');
            activeMode = newMode;
            if (activeMode === 'off') { stopWaveAnimation(); }
            weightSlider.disabled = ['wght', 'both'].includes(activeMode);
            heightSlider.disabled = ['hght', 'both'].includes(activeMode);
            weightSliderGroup.classList.toggle('disabled', weightSlider.disabled);
            heightSliderGroup.classList.toggle('disabled', heightSlider.disabled);
            updateText();
        }

        weightSlider.addEventListener('input', updateText);
        heightSlider.addEventListener('input', updateText);
        textElement.addEventListener('input', () => { const pos = getCaretPosition(textElement); wrapLetters(); setCaretPosition(textElement, pos); });

        // --- OPRAVA: Přidány listenery pro myš i dotyk ---
        document.body.addEventListener('mousemove', handleInteraction);
        document.body.addEventListener('touchmove', handleInteraction, { passive: true });
        document.body.addEventListener('mouseleave', handleInteractionEnd);
        document.body.addEventListener('touchend', handleInteractionEnd);

        waveToggle.addEventListener('click', () => {
            if (animationFrameId) {
                stopWaveAnimation();
            } else {
                if (activeMode === 'off') {
                    setInteractionMode('both');
                }
                startWaveAnimation();
            }
        });

        switcher.addEventListener('click', e => {
            if (e.target.classList.contains('switch-btn')) {
                setInteractionMode(e.target.dataset.mode);
            }
        });

        const resizeObserver = new ResizeObserver(() => { if (textElement.textContent) { updateText(); } });
        resizeObserver.observe(textElement.parentElement);

        weightSlider.disabled = ['wght', 'both'].includes(activeMode);
        heightSlider.disabled = ['hght', 'both'].includes(activeMode);
        weightSliderGroup.classList.toggle('disabled', weightSlider.disabled);
        heightSliderGroup.classList.toggle('disabled', heightSlider.disabled);

        wrapLetters(false);

        setTimeout(() => {
            updateText();
            if (activeMode !== 'off') {
                startWaveAnimation();
            }
        }, 100);
    })();

    // Zbytek kódu (navigace, demo 3) zůstává beze změny
    const navButtons = document.querySelectorAll('.demo-nav-btn');
    const demoPanels = document.querySelectorAll('.demo-panel');
    const wallControls = document.querySelector('.wall-controls');

    function updateWallControlsVisibility(targetId) {
        if (wallControls) {
            wallControls.style.display = (targetId === 'demo3') ? 'flex' : 'none';
        }
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            demoPanels.forEach(panel => panel.classList.remove('active'));

            button.classList.add('active');
            const targetId = button.getAttribute('data-target');
            document.getElementById(targetId)?.classList.add('active');

            updateWallControlsVisibility(targetId);
        });
    });

    const initialActiveButton = document.querySelector('.demo-nav-btn.active');
    if (initialActiveButton) {
        updateWallControlsVisibility(initialActiveButton.getAttribute('data-target'));
    }

    (function initializeLoremWall() {
        const canvas = document.getElementById('lorem-wall-canvas');
        if (!canvas) return;
        const button = document.querySelector('button[data-target="demo3"]');
        const toggleButton = document.getElementById('wall-animation-toggle');
        const soundButton = document.getElementById('wall-sound-toggle');

        const init = () => {
            if (canvas.dataset.initialized) return;
            canvas.dataset.initialized = 'true';
            const isMobile = /Mobi|Android/i.test(navigator.userAgent);
            const ctx = canvas.getContext('2d', { alpha: false });
            const FONT_SIZE = isMobile ? 40 : 50;
            const BASE_WEIGHT = 100, MAX_WEIGHT = 900;
            const word = "BLOKKADA";
            let letters = [];
            let effects = [];
            let animationFrameId = null;
            let currentAnimationMode = 'off';
            let clickEffectMode = 0;
            let lastAutoClickTime = 0;
            let isMuted = true;
            let audioCtx, mainGain, reverb;

            async function createReverb() { const convolver = audioCtx.createConvolver(); const noiseBuffer = audioCtx.createBuffer(2, 3 * audioCtx.sampleRate, audioCtx.sampleRate); const left = noiseBuffer.getChannelData(0); const right = noiseBuffer.getChannelData(1); for (let i = 0; i < noiseBuffer.length; i++) { const val = (Math.random() * 2 - 1) * Math.pow(1 - i / noiseBuffer.length, 5); left[i] = val; right[i] = val; } convolver.buffer = noiseBuffer; return convolver; }
            async function initAudio() { if (!audioCtx) { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); mainGain = audioCtx.createGain(); mainGain.gain.value = isMuted ? 0 : 1; mainGain.connect(audioCtx.destination); reverb = await createReverb(); reverb.connect(mainGain); } }
            function playSound(soundFunc, time, position) { if (isMuted || !audioCtx) return; const reverbAmount = 0.8; soundFunc(time, reverbAmount); }
            const sounds = { deep: (time, reverbAmount) => { const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); const reverbGain = audioCtx.createGain(); const delay = audioCtx.createDelay(1.0); const feedback = audioCtx.createGain(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(60, time); osc.frequency.exponentialRampToValueAtTime(30, time + 1.5); gain.gain.setValueAtTime(0.5, time); gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5); delay.delayTime.value = 60 / 90 / 2; feedback.gain.value = 0.7; reverbGain.gain.value = reverbAmount; osc.connect(gain); gain.connect(delay); delay.connect(feedback); feedback.connect(delay); gain.connect(mainGain); delay.connect(mainGain); gain.connect(reverbGain); reverbGain.connect(reverb); osc.start(time); osc.stop(time + 1.5); }, grossBeat: (time, reverbAmount) => { const gain = audioCtx.createGain(); const reverbGain = audioCtx.createGain(); gain.gain.setValueAtTime(0.15, time); gain.gain.exponentialRampToValueAtTime(0.001, time + 1); reverbGain.gain.value = reverbAmount; const noise = audioCtx.createBufferSource(); const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 1, audioCtx.sampleRate); const data = buffer.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1; noise.buffer = buffer; noise.connect(gain); gain.connect(mainGain); gain.connect(reverbGain); reverbGain.connect(reverb); noise.start(time); noise.stop(time + 1); for (let i = 0; i < 16; i++) { gain.gain.setValueAtTime(0, time + i * 0.0625); gain.gain.setValueAtTime(0.15, time + i * 0.0625 + 0.03); } }, worm: (time, reverbAmount) => { const osc = audioCtx.createOscillator(); const lfo = audioCtx.createOscillator(); const gain = audioCtx.createGain(); const lfoGain = audioCtx.createGain(); const reverbGain = audioCtx.createGain(); osc.type = 'square'; osc.frequency.setValueAtTime(120, time); lfo.type = 'sine'; lfo.frequency.setValueAtTime(15, time); lfoGain.gain.setValueAtTime(40, time); gain.gain.setValueAtTime(0.2, time); gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2); reverbGain.gain.value = reverbAmount; lfo.connect(lfoGain).connect(osc.frequency); osc.connect(gain); gain.connect(mainGain); gain.connect(reverbGain); reverbGain.connect(reverb); osc.start(time); lfo.start(time); osc.stop(time + 1.2); lfo.stop(time + 1.2); }, crystal: (time, reverbAmount) => { for (let i = 0; i < 6; i++) { const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain(); const reverbGain = audioCtx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(600 * Math.pow(1.5, i), time); gain.gain.setValueAtTime(0.1, time); gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5); reverbGain.gain.value = reverbAmount; osc.connect(gain); gain.connect(mainGain); gain.connect(reverbGain); reverbGain.connect(reverb); osc.start(time + i * 0.04); osc.stop(time + 1.5 + i * 0.04); } } };

            async function setup() {
                await document.fonts.load(`1em "Blokkada VF"`);
                const dpr = window.devicePixelRatio || 1;
                const rect = canvas.parentElement.getBoundingClientRect();
                canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr);
                letters = [];
                ctx.font = `normal ${BASE_WEIGHT} ${FONT_SIZE}px 'Blokkada VF'`;
                const spaceWidth = ctx.measureText(' ').width * 2;
                const lineHeight = FONT_SIZE * 1.3;
                for (let y = FONT_SIZE * 0.8; y < rect.height + FONT_SIZE; y += lineHeight) {
                    let x = Math.random() * -150;
                    while (x < rect.width + FONT_SIZE) {
                        for (let i = 0; i < word.length; i++) { const char = word[i]; const charWidth = ctx.measureText(char).width; letters.push({ char, x, y, currentWeight: BASE_WEIGHT, targetWeight: BASE_WEIGHT }); x += charWidth; }
                        x += spaceWidth;
                    }
                }
                if (!animationFrameId) animate();
            }

            const waveTypes = [{ type: 'ripple', sound: 'deep' }, { type: 'checkerboard', sound: 'grossBeat' }, { type: 'worm', sound: 'worm' }, { type: 'fractal', sound: 'crystal' },];
            function triggerWave(x, y, time) { if (!audioCtx) initAudio(); const currentWave = waveTypes[clickEffectMode]; playSound(sounds[currentWave.sound], time, x); effects.push({ x, y, radius: 0, speed: 25, width: 400, lifespan: 180, texture: currentWave.type, angle: 0 }); clickEffectMode = (clickEffectMode + 1) % waveTypes.length; if (!animationFrameId) animate(); }
            function animate() {
                animationFrameId = requestAnimationFrame(animate);
                if (currentAnimationMode === 'loop' && audioCtx) { const now = audioCtx.currentTime; const beatDuration = 60 / 90; if (now >= lastAutoClickTime) { const rect = canvas.parentElement.getBoundingClientRect(); triggerWave(rect.width / 2, rect.height / 2, now); lastAutoClickTime = now + beatDuration; } }
                effects = effects.filter(e => { e.radius += e.speed; e.lifespan--; return e.lifespan > 0; });
                letters.forEach(letter => {
                    let maxInfluence = 0;
                    effects.forEach(effect => {
                        const dist = Math.sqrt(Math.pow(letter.x - effect.x, 2) + Math.pow(letter.y - effect.y, 2));
                        let influence = 0;
                        if (dist < effect.radius + effect.width && dist > effect.radius - effect.width) {
                            influence = Math.exp(-Math.pow(dist - effect.radius, 2) / (2 * Math.pow(effect.width / 2, 2)));
                            const time = Date.now() * 0.01;
                            switch (effect.texture) {
                                case 'checkerboard': const gridSize = 70; if ((Math.floor(letter.x / gridSize) + Math.floor(letter.y / gridSize)) % 2 === 0) influence = 0; break;
                                case 'worm': influence *= (Math.sin(dist * 0.05 + time * 2) + 1) / 2; break;
                                case 'fractal': const fractal = Math.sin(letter.x * 0.03 + time) * Math.cos(letter.y * 0.03 + time); if (fractal < 0.1) influence = 0; influence *= (fractal + 1) / 2; break;
                            }
                        }
                        if (influence > maxInfluence) maxInfluence = influence;
                    });
                    letter.targetWeight = BASE_WEIGHT + (MAX_WEIGHT - BASE_WEIGHT) * maxInfluence;
                    letter.currentWeight += (letter.targetWeight - letter.currentWeight) * 0.2;
                });
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                letters.forEach(letter => { const weight = Math.round(letter.currentWeight); if (isNaN(weight)) return; const colorVal = Math.round(80 + 175 * ((Math.max(BASE_WEIGHT, weight) - BASE_WEIGHT) / (MAX_WEIGHT - BASE_WEIGHT))); if (isNaN(colorVal)) return; ctx.font = `normal ${weight} ${FONT_SIZE}px 'Blokkada VF'`; ctx.fillStyle = `rgb(${colorVal},${colorVal},${colorVal})`; ctx.fillText(letter.char, letter.x, letter.y); });
            }

            function startAnimationLoop() { initAudio(); currentAnimationMode = 'loop'; toggleButton.innerHTML = '❚❚'; toggleButton.classList.add('playing'); lastAutoClickTime = audioCtx ? audioCtx.currentTime : 0; if (!animationFrameId) animate(); }
            function stopAnimationLoop() { currentAnimationMode = 'off'; toggleButton.innerHTML = '▶'; toggleButton.classList.remove('playing'); }

            canvas.addEventListener('click', e => { if (currentAnimationMode === 'loop') return; initAudio(); const rect = canvas.getBoundingClientRect(); triggerWave(e.clientX - rect.left, e.clientY - rect.top, audioCtx ? audioCtx.currentTime : 0); });
            toggleButton.addEventListener('click', () => { if (currentAnimationMode === 'loop') stopAnimationLoop(); else startAnimationLoop(); });
            soundButton.addEventListener('click', () => { isMuted = !isMuted; if (!audioCtx) initAudio(); if (mainGain) mainGain.gain.value = isMuted ? 0 : 1; soundButton.textContent = isMuted ? '🔇' : '🔊'; });

            const resizeObserver = new ResizeObserver(() => { setTimeout(setup, 50); });
            resizeObserver.observe(canvas.parentElement);
            setup();
        };

        button?.addEventListener('click', init, { once: true });
        if (document.getElementById('demo3').classList.contains('active')) {
            init();
        }
    })();
});