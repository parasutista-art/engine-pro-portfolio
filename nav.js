function createNav(relativePath = '', activePage = '') {
    // Definice odkazů
    const links = {
        portfolio: `<a href="${relativePath}projects/book/bookengine.html">portfolio</a>`,
        font: `<a href="${relativePath}projects/font/font.html\">Variable Font</a>`,
        projektC: `<a href="${relativePath}index.html">Projekt C</a>`
    };

    // Zvýraznění aktivní stránky
    if (activePage === 'font') links.font = `<a href="#" class="active">Variable Font</a>`;
    else if (activePage === 'portfolio') links.portfolio = `<a href="#" class="active">portfolio</a>`;

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
    `;

    const placeholder = document.getElementById('nav-placeholder');
    if (placeholder) {
        placeholder.innerHTML = navHTML;
    }

    const body = document.body;

    // Odebrání starých tlačítek, pokud existují
    document.querySelector('.nav-toggle-strip-container')?.remove();

    // Vytvoření kontejneru pro nové lišty
    const stripContainer = document.createElement('div');
    stripContainer.className = 'nav-toggle-strip-container';

    const strip1 = document.createElement('div');
    strip1.className = 'nav-toggle-strip strip-1';

    const strip2 = document.createElement('div');
    strip2.className = 'nav-toggle-strip strip-2';

    stripContainer.appendChild(strip1);
    stripContainer.appendChild(strip2);
    body.appendChild(stripContainer);

    stripContainer.addEventListener('click', () => {
        body.classList.toggle('nav-collapsed');
    });

    // Automatické sbalení na menších obrazovkách
    if (window.innerWidth <= 800) {
        body.classList.add('nav-collapsed');
    }
}