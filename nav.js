function createNav(relativePath = '', activePage = '') {
    const links = {
        main: `<a href="${relativePath}index.html">Matyas Kunstmüller</a>`,
        portfolio: `<a href="${relativePath}projects/book/bookengine.html">portfolio</a>`,
        font: `<a href="${relativePath}projects/font/font.html">Blokkada</a>`,
        projektC: `<a href="${relativePath}index.html">Projekt C</a>`
    };

    // Zvýraznění aktivní stránky
    if (activePage === 'font') {
        links.font = `<a href="#" class="active">Blokkada</a>`;
    } else if (activePage === 'portfolio') {
        links.portfolio = `<a href="#" class="active">portfolio</a>`;
    } else if (activePage === 'main') {
        links.main = `<a href="#" class="active">Matyas Kunstmüller</a>`;
    }

    const navHTML = `
        <div class="nav-container">
            <button class="nav-toggle-btn" aria-label="Přepnout navigaci"></button>
            
            <div class="nav-content">
                <nav class="project-list">
                    <ul>
                        <li>${links.main}</li>
                        <li>${links.portfolio}</li>
                        <li>${links.font}</li>
                        <li>${links.projektC}</li>
                    </ul>
                </nav>
            </div>
        </div>
    `;

    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        navPlaceholder.innerHTML = navHTML;
    }

    const toggleButton = document.querySelector('.nav-toggle-btn');
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            document.body.classList.toggle('nav-closed');
        });
    }

    if (window.innerWidth <= 768) {
        document.body.classList.add('nav-closed');
    }
}