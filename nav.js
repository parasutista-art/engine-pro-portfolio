/*
 * ============================================
 * === NOVÝ nav.js (Verze 10 - Opravená HTML struktura) ===
 * ============================================
 */

/**
 * Vytvoří a vloží navigaci do stránky.
 * @param {string} relativePath - Relativní cesta zpět (např. '../../')
 * @param {string} activePageID - Unikátní ID (např. 'portfolio-s9', 'projekty-citysmog', 'blokkada')
 */
function createNav(relativePath = '', activePageID = '') {

    // --- 1. Definice všech odkazů ---

    const mainLinks = {
        main: `<a href="${relativePath}index.html" 
                       class="name-link ${activePageID === 'main' ? 'active' : ''}">
                       Matyas Kunstmüller
                    </a>`,
        portfolio: `<a href="${relativePath}projects/book/bookengine.html" 
                       class="${activePageID.startsWith('portfolio') ? 'active' : ''}">
                       Portfolio
                    </a>`,
        blokkada: `<a href="${relativePath}projects/font/font.html" 
                       class="${activePageID === 'blokkada' ? 'active' : ''}">
                       Blokkada
                    </a>`,
        projekty: `<a href="${relativePath}projects/projekty/projekty.html" 
                       class="${activePageID.startsWith('projekty') ? 'active' : ''}">
                       Projekty
                    </a>`
    };

    // Pod-menu Portfolio (Doplněno podle tvých souborů)

    const portfolioSubNav = [

        { id: 'portfolio-s2', href: `${relativePath}projects/book/bookengine.html#spread=2`, text: 'S3B' },

        { id: 'portfolio-s3', href: `${relativePath}projects/book/bookengine.html#spread=3`, text: '360' },

        { id: 'portfolio-s4', href: `${relativePath}projects/book/bookengine.html#spread=4`, text: 'Piktogramy' },

        { id: 'portfolio-s5', href: `${relativePath}projects/book/bookengine.html#spread=5`, text: 'Povaleč' },

        { id: 'portfolio-s6', href: `${relativePath}projects/book/bookengine.html#spread=6`, text: 'Tousťák' },

        { id: 'portfolio-s6', href: `${relativePath}projects/book/bookengine.html#spread=7`, text: 'Busking / Ztohoven' },

        { id: 'portfolio-s8', href: `${relativePath}projects/book/bookengine.html#spread=8`, text: 'Typotrip' },

        { id: 'portfolio-s9', href: `${relativePath}projects/book/bookengine.html#spread=9`, text: 'Blokkada' },

        { id: 'portfolio-s13', href: `${relativePath}projects/book/bookengine.html#spread=13`, text: '1.TXT' }
    ];

    // Pod-menu Projekty
    const projektySubNav = [
        { id: 'projekty-1txt', href: `${relativePath}projects/1.txt/1.txt.html`, text: '1.TXT' },
        { id: 'projekty-citysmog', href: `${relativePath}projects/city smog super swag/city smog super swag.html`, text: 'City Smog Super Swag' }
    ];

    // --- 2. Sestavení HTML ---

    function buildSubNav(items, activeID) {
        let html = '<ul class="sub-nav">'; // Toto je pod-seznam
        for (const item of items) {
            const isActive = (item.id === activePageID);
            html += `<li class="sub-nav-item">
                         <a href="${item.href}" class="${isActive ? 'active-sub' : ''}">
                           ${item.text}
                         </a>
                     </li>`;
        }
        html += '</ul>';
        return html;
    }

    let navHTML = '<nav class="project-list"><ul>';

    // Matyas Kunstmuller (bez entru před)
    navHTML += `<li>${mainLinks.main}</li>`;

    // Volný řádek (mezera za)
    navHTML += `<li class="nav-spacer"></li>`;

    // --- ZMĚNA STRUKTURY ZDE ---
    // Portfolio + jeho pod-menu
    navHTML += `<li>`; // Otevřeme LI
    navHTML += mainLinks.portfolio; // Vložíme hlavní odkaz
    if (activePageID.startsWith('portfolio')) {
        navHTML += buildSubNav(portfolioSubNav, activePageID); // Vložíme pod-seznam DOVNITŘ <li>
    }
    navHTML += `</li>`; // Zavřeme LI

    // Blokkada (ta je jednoduchá)
    navHTML += `<li>${mainLinks.blokkada}</li>`;

    // Projekty + jeho pod-menu
    navHTML += `<li>`; // Otevřeme LI
    navHTML += mainLinks.projekty; // Vložíme hlavní odkaz
    if (activePageID.startsWith('projekty')) {
        navHTML += buildSubNav(projektySubNav, activePageID); // Vložíme pod-seznam DOVNITŘ <li>
    }
    navHTML += `</li>`; // Zavřeme LI
    // --- KONEC ZMĚNY STRUKTURY ---

    navHTML += '</ul></nav>';


    // --- 3. Vložení do stránky ---

    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        navPlaceholder.innerHTML = `
            <div id="desktop-nav">
                <button class="desktop-toggle-btn" aria-label="Přepnout postranní navigaci"></button>
                <div class="desktop-nav-content">
                    ${navHTML} 
                </div>
            </div>

            <div id="mobile-nav">
                <button class="mobile-toggle-btn" aria-label="Přepnout horní navigaci\">↓</button>
                <div class="mobile-nav-content">
                    ${navHTML}
                </div>
            </div>
        `;
    }

    // Listener pro desktop
    const desktopButton = document.querySelector('.desktop-toggle-btn');
    if (desktopButton) {
        desktopButton.addEventListener('click', () => {
            document.body.classList.toggle('desktop-nav-closed');
        });
    }

    // Listener pro mobil
    const mobileButton = document.querySelector('.mobile-toggle-btn');
    if (mobileButton) {
        mobileButton.addEventListener('click', () => {
            document.body.classList.toggle('mobile-nav-open');
            const isOpen = document.body.classList.contains('mobile-nav-open');
            mobileButton.textContent = isOpen ? '↑' : '↓';
        });
    }

    // Logika zobrazení na mobilu
    if (window.innerWidth <= 768 || window.matchMedia("(orientation: portrait)").matches) {
        if (activePageID === 'main') {
            document.body.classList.add('mobile-nav-open');
            if (mobileButton) mobileButton.textContent = '↑';
        }
    }
}