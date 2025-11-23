/*
 * ============================================
 * === NOVÝ nav.js (Verze 14 - CSS šipka pro mobil) ===
 * ============================================
 */

function createNav(relativePath = '', activePageID = '') {

    // --- 1. Definice hlavních odkazů ---
    const mainLinks = {
        main: `<a href="${relativePath}index.html" 
                       class="name-link ${activePageID === 'main' ? 'active' : ''}">
                       Matyas Kunstmüller
                    </a>`,
        portfolio: `<a href="${relativePath}projects/book/bookengine.html" 
                       class="${activePageID.startsWith('portfolio') ? 'active' : ''}">
                       Portfolio
                    </a>`,
        projekty: `<a href="${relativePath}projects/projekty/projekty.html" 
                       class="${activePageID.startsWith('projekty') ? 'active' : ''}">
                       Projekty
                    </a>`
    };

    // Pod-menu Portfolio
    const portfolioSubNav = [
        { id: 'portfolio-s2', href: `${relativePath}projects/book/bookengine.html#spread=2`, text: 'S3B' },
        { id: 'portfolio-s3', href: `${relativePath}projects/book/bookengine.html#spread=3`, text: '360' },
        { id: 'portfolio-s4', href: `${relativePath}projects/book/bookengine.html#spread=4`, text: 'Piktogramy' },
        { id: 'portfolio-s5', href: `${relativePath}projects/book/bookengine.html#spread=5`, text: 'Povaleč' },
        { id: 'portfolio-s6', href: `${relativePath}projects/book/bookengine.html#spread=6`, text: 'Tousťák' },
        { id: 'portfolio-s7', href: `${relativePath}projects/book/bookengine.html#spread=7`, text: 'Busking / Ztohoven' },
        { id: 'portfolio-s8', href: `${relativePath}projects/book/bookengine.html#spread=8`, text: 'Typotrip' },
        { id: 'portfolio-s9', href: `${relativePath}projects/book/bookengine.html#spread=9`, text: 'Blokkada' },
        { id: 'portfolio-s13', href: `${relativePath}projects/book/bookengine.html#spread=13`, text: '1.TXT' }
    ];

    // Pod-menu Projekty
    const projektySubNav = [
        { id: 'projekty-1txt', href: `${relativePath}projects/1.txt/1.txt.html`, text: '1.TXT' },
        { id: 'projekty-bezfiltru', href: `${relativePath}projects/bez filtru/bez.filtru.html`, text: 'Bez filtru' },
        { id: 'projekty-blokkada', href: `${relativePath}projects/font/font.html`, text: 'Blokkada' },
        { id: 'projekty-citysmog', href: `${relativePath}projects/city smog super swag/city smog super swag.html`, text: 'City Smog Super Swag' }
    ];

    function buildSubNav(items) {
        let html = '<ul class="sub-nav">';
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

    // Jméno
    navHTML += `<li>${mainLinks.main}</li>`;
    navHTML += `<li class="nav-spacer"></li>`;

    // --- PORTFOLIO ---
    const isPortfolioOpen = activePageID.startsWith('portfolio') ? 'open' : '';
    navHTML += `<li class="has-submenu ${isPortfolioOpen}">`;
    navHTML += `<div class="nav-row">`;
    navHTML += mainLinks.portfolio;
    navHTML += `<span class="nav-expand-arrow" aria-label="Rozbalit Portfolio"></span>`;
    navHTML += `</div>`;
    navHTML += buildSubNav(portfolioSubNav);
    navHTML += `</li>`;

    // --- PROJEKTY ---
    const isProjektyOpen = activePageID.startsWith('projekty') ? 'open' : '';
    navHTML += `<li class="has-submenu ${isProjektyOpen}">`;
    navHTML += `<div class="nav-row">`;
    navHTML += mainLinks.projekty;
    navHTML += `<span class="nav-expand-arrow" aria-label="Rozbalit Projekty"></span>`;
    navHTML += `</div>`;
    navHTML += buildSubNav(projektySubNav);
    navHTML += `</li>`;

    navHTML += '</ul></nav>';

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
                <button class="mobile-toggle-btn" aria-label="Přepnout horní navigaci"></button>
                <div class="mobile-nav-content">
                    ${navHTML}
                </div>
            </div>
        `;
    }

    // --- Listenery ---
    const arrows = document.querySelectorAll('.nav-expand-arrow');
    arrows.forEach(arrow => {
        arrow.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const parentLi = arrow.closest('li');
            parentLi.classList.toggle('open');
        });
    });

    const desktopButton = document.querySelector('.desktop-toggle-btn');
    if (desktopButton) {
        desktopButton.addEventListener('click', () => {
            document.body.classList.toggle('desktop-nav-closed');
        });
    }

    const mobileButton = document.querySelector('.mobile-toggle-btn');
    if (mobileButton) {
        mobileButton.addEventListener('click', () => {
            document.body.classList.toggle('mobile-nav-open');
            // ZDE ODSTRANĚNA ZMĚNA TEXTU - řeší CSS
        });
    }

    if (window.innerWidth <= 768 || window.matchMedia("(orientation: portrait)").matches) {
        if (activePageID === 'main') {
            document.body.classList.add('mobile-nav-open');
        }
    }
}