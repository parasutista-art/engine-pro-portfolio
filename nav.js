function createNav(relativePath = '', activePage = '') {
    // Definice odkazù
    const links = {
        portfolio: `<a href="${relativePath}projects/book/bookengine.html">Portfolio SŠ/VŠ</a> (2024)`,
        projektB: `<a href="${relativePath}index.html">Projekt B</a> (2023)`,
        projektC: `<a href="${relativePath}index.html">Projekt C</a> (2022)`
    };

    // Zvýraznìní aktivní stránky
    if (activePage === 'portfolio') {
        links.portfolio = `<a href="#" class="active">Portfolio SŠ/VŠ</a> (2024)`;
    }

    // Celý HTML kód navigace jako text
    const navHTML = `
        <header class="site-header">
            <h1>JMÉNO PØÍJMENÍ</h1>
        </header>
        <nav class="project-list">
            <ul>
                <li>${links.portfolio}</li>
                <li>${links.projektB}</li>
                <li>${links.projektC}</li>
            </ul>
        </nav>
        <footer class="site-footer">
            <p>Design & Kód | <a href="${relativePath}index.html">Hlavní portfolio</a></p>
        </footer>
    `;

    // Najde kontejner a vloží do nìj HTML
    const placeholder = document.getElementById('nav-placeholder');
    if (placeholder) {
        placeholder.innerHTML = navHTML;
    }
}