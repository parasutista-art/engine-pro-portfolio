function createNav(relativePath = '', activePage = '') {
    // --- ČÁST 1: VYTVOŘENÍ HTML ---

    // Definice odkazů
    const links = {
        portfolio: `<a href="${relativePath}projects/book/bookengine.html">portfolio</a>`,
        projektB: `<a href="${relativePath}index.html">Projekt B</a>`,
        projektC: `<a href="${relativePath}index.html">Projekt C</a>`
    };

    // Zvýraznění aktivní stránky
    if (activePage === 'portfolio') {
        links.portfolio = `<a href="#" class="active">portfolio</a>`;
    }

    // HTML kód pro postranní lištu
    const navHTML = `
        <header class="site-header">
            <h1>Matyas Kunstmüller</h1>
        </header>
        <nav class="project-list">
            <ul>
                <li>${links.portfolio}</li>
                <li>${links.projektB}</li>
                <li>${links.projektC}</li>
            </ul>
        </nav>
        <footer class="site-footer">
            <p>bruh| <a href="${relativePath}index.html">Domovská stránka</a></p>
        </footer>
        <button id="nav-toggle-collapse" class="nav-toggle-btn" aria-label="Skrýt navigaci">←</button>
    `;

    // Najde kontejner a vloží do něj HTML lišty
    const placeholder = document.getElementById('nav-placeholder');
    if (placeholder) {
        placeholder.innerHTML = navHTML;
    }

    // Vytvoření a vložení tlačítka pro rozbalení (hamburger ikona)
    const expandButton = document.createElement('button');
    expandButton.id = 'nav-toggle-expand';
    expandButton.className = 'nav-toggle-btn expand';
    expandButton.setAttribute('aria-label', 'Zobrazit navigaci');
    expandButton.innerHTML = '&#9776;'; // Hamburger icon
    document.body.appendChild(expandButton);


    // --- ČÁST 2: FUNKCIONALITA SKLÁPĚNÍ ---

    const body = document.body;
    const collapseBtn = document.getElementById('nav-toggle-collapse');
    const expandBtn = document.getElementById('nav-toggle-expand');
    const mobileBreakpoint = 800; // Šířka v px, pod kterou se menu chová jako mobilní

    // Funkce pro sbalení navigace
    const collapseNav = () => body.classList.add('nav-collapsed');

    // Funkce pro rozbalení navigace
    const expandNav = () => body.classList.remove('nav-collapsed');

    // Přiřazení událostí tlačítkům
    if (collapseBtn) {
        collapseBtn.addEventListener('click', collapseNav);
    }
    if (expandBtn) {
        expandBtn.addEventListener('click', expandNav);
    }

    // Zkontroluje šířku okna při načtení a případně sbalí navigaci
    // POUZE POKUD JSME NA STRÁNCE S PORTFOLIEM
    if (activePage === 'portfolio' && window.innerWidth <= mobileBreakpoint) {
        collapseNav();
    }
}