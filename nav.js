function createNav(relativePath = '', activePage = '') {
    // Definice odkaz�
    const links = {
        portfolio: `<a href="${relativePath}projects/book/bookengine.html">Portfolio S�/V�</a> (2024)`,
        projektB: `<a href="${relativePath}index.html">Projekt B</a> (2023)`,
        projektC: `<a href="${relativePath}index.html">Projekt C</a> (2022)`
    };

    // Zv�razn�n� aktivn� str�nky
    if (activePage === 'portfolio') {
        links.portfolio = `<a href="#" class="active">Portfolio S�/V�</a> (2024)`;
    }

    // Cel� HTML k�d navigace jako text
    const navHTML = `
        <header class="site-header">
            <h1>JM�NO P��JMEN�</h1>
        </header>
        <nav class="project-list">
            <ul>
                <li>${links.portfolio}</li>
                <li>${links.projektB}</li>
                <li>${links.projektC}</li>
            </ul>
        </nav>
        <footer class="site-footer">
            <p>Design & K�d | <a href="${relativePath}index.html">Hlavn� portfolio</a></p>
        </footer>
    `;

    // Najde kontejner a vlo�� do n�j HTML
    const placeholder = document.getElementById('nav-placeholder');
    if (placeholder) {
        placeholder.innerHTML = navHTML;
    }
}