function createNav(relativePath = '', activePage = '') {
    // Definice odkazů
    const links = {
        portfolio: `<a href="${relativePath}projects/book/bookengine.html">portfolio</a>`,
        font: `<a href="${relativePath}projects/font/font.html">Variable Font</a>`,
        projektC: `<a href="${relativePath}index.html">Projekt C</a>`
    };

    // Zvýraznění aktivní stránky
    if (activePage === 'font') {
        links.font = `<a href="#" class="active">Variable Font</a>`;
    } else if (activePage === 'portfolio') {
        links.portfolio = `<a href="#" class="active">portfolio</a>`;
    }

    // HTML kód pro postranní lištu
    const navHTML = `
        <header class="site-header"><h1>Matyas Kunstmüller</h1></header>
        <nav class="project-list">
            <ul>
                <li>${links.portfolio}</li>
                <li>${links.font}</li>
                <li>${links.projektC}</li>
            </ul>
        </nav>
        <footer class="site-footer">
            <p>bruh| <a href="${relativePath}index.html">Domovská stránka</a></p>
        </footer>
        <button id="nav-toggle-collapse" class="nav-toggle-btn" aria-label="Skrýt navigaci">←</button>
    `;

    const placeholder = document.getElementById('nav-placeholder');
    if (placeholder) {
        placeholder.innerHTML = navHTML;
    }

    // Vytvoření tlačítka pro rozbalení (musí být mimo #nav-placeholder)
    if (!document.getElementById('nav-toggle-expand')) {
        const expandButton = document.createElement('button');
        expandButton.id = 'nav-toggle-expand';
        expandButton.className = 'nav-toggle-btn';
        expandButton.setAttribute('aria-label', 'Zobrazit navigaci');
        expandButton.innerHTML = '&#9776;'; // Hamburger icon
        document.body.appendChild(expandButton);
    }

    // Funkcionalita sklápění
    const body = document.body;
    const collapseBtn = document.getElementById('nav-toggle-collapse');
    const expandBtn = document.getElementById('nav-toggle-expand');

    const collapseNav = () => body.classList.add('nav-collapsed');
    const expandNav = () => body.classList.remove('nav-collapsed');

    if (collapseBtn) collapseBtn.addEventListener('click', collapseNav);
    if (expandBtn) expandBtn.addEventListener('click', expandNav);
}