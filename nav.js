function createNav(relativePath = '', activePage = '') {
    // Definice odkaz
    const links = {
        portfolio: `<a href="${relativePath}projects/book/bookengine.html">portfolio`,
        projektB: `<a href="${relativePath}index.html">Projekt B`,
        projektC: `<a href="${relativePath}index.html">Projekt C`
    };

    // Zv�razn�n� aktivn� str�nky
    if (activePage === 'portfolio') {
        links.portfolio = `<a href="#" class="active">portfolio`;
    }

    // Cel� HTML k�d navigace jako text
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
    `;

    // Najde kontejner a vlo�� do n�j HTML
    const placeholder = document.getElementById('nav-placeholder');
    if (placeholder) {
        placeholder.innerHTML = navHTML;
    }
}