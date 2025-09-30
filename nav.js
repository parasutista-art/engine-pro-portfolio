function createNav(relativePath = '', activePage = '') {
    const links = {
        main: `<a href="${relativePath}index.html" class="name-link">Matyas Kunstmüller</a>`,
        portfolio: `<a href="${relativePath}projects/book/bookengine.html">portfolio</a>`,
        font: `<a href="${relativePath}projects/font/font.html">Blokkada</a>`,
        projektC: `<a href="${relativePath}index.html">Projekt C</a>`
    };

    if (activePage === 'font') links.font = `<a href="#" class="active">Blokkada</a>`;
    else if (activePage === 'portfolio') links.portfolio = `<a href="#" class="active">portfolio</a>`;
    else if (activePage === 'main') links.main = `<a href="#" class="active name-link">Matyas Kunstmüller</a>`;

    const navLinksHTML = `
        <nav class="project-list">
            <ul>
                <li>${links.main}</li>
                <li>${links.portfolio}</li>
                <li>${links.font}</li>
                <li>${links.projektC}</li>
            </ul>
        </nav>
    `;

    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        navPlaceholder.innerHTML = `
            <div id="desktop-nav">
                <button class="desktop-toggle-btn" aria-label="Přepnout postranní navigaci"></button>
                <div class="desktop-nav-content">
                    ${navLinksHTML}
                </div>
            </div>

            <div id="mobile-nav">
                <button class="mobile-toggle-btn" aria-label="Přepnout horní navigaci">↓</button>
                <div class="mobile-nav-content">
                    ${navLinksHTML}
                </div>
            </div>
        `;
    }

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
            const isOpen = document.body.classList.contains('mobile-nav-open');
            mobileButton.textContent = isOpen ? '↑' : '↓';
        });
    }

    // Na mobilu...
    if (window.innerWidth <= 768) {
        // ...pokud jsme na hlavní stránce ('main')...
        if (activePage === 'main') {
            // ...přidáme třídu, která otevře lištu.
            document.body.classList.add('mobile-nav-open');
            // A změníme text tlačítka na šipku nahoru.
            if (mobileButton) mobileButton.textContent = '↑';
        }
    }
}