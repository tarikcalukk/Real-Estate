function postaviCarousel(glavniElement, sviUpiti, indeks = 0, nekretnina_id = null) {
    if (!glavniElement || !Array.isArray(sviUpiti) || sviUpiti.length === 0 || indeks < 0 || indeks >= sviUpiti.length) {
        return null;
    }

    let kraj = false;

    let carouselContainer = glavniElement.querySelector('.carousel-container');
    if (!carouselContainer) {
        carouselContainer = document.createElement('div');
        carouselContainer.classList.add('carousel-container');
        glavniElement.appendChild(carouselContainer);
    }

    function azurirajPrikaz() {
        const upit = sviUpiti[indeks];
        carouselContainer.innerHTML = `
            <div class="upit">
                <p class="upit-tekst">${upit.tekst || 'Tekst nije dostupan'}</p>
            </div>
        `;

        const currentUpit = carouselContainer.querySelector('.upit');
        setTimeout(() => {
            currentUpit.classList.add('visible');
        }, 10);
    }

    function fnLijevo() {
        indeks = (indeks - 1 + sviUpiti.length) % sviUpiti.length;
        azurirajPrikaz();
    }

    function fnDesno() {
        indeks = (indeks + 1) % sviUpiti.length;
        azurirajPrikaz();

        if (!kraj && indeks >= sviUpiti.length - 1) {
            PoziviAjax.getNextUpiti(nekretnina_id, (error, noviUpiti) => {
                if (error || !noviUpiti || noviUpiti.length === 0) {
                    kraj = true;
                } else {
                    sviUpiti.push(...noviUpiti);
                }
            });
        }
    }

    let prevButton = glavniElement.querySelector('.prev-button');
    if (!prevButton) {
        prevButton = document.createElement('button');
        prevButton.classList.add('prev-button');
        prevButton.textContent = '▶';
        prevButton.addEventListener('click', fnLijevo);
        glavniElement.appendChild(prevButton);
    }

    let nextButton = glavniElement.querySelector('.next-button');
    if (!nextButton) {
        nextButton = document.createElement('button');
        nextButton.classList.add('next-button');
        nextButton.textContent = '◀';
        nextButton.addEventListener('click', fnDesno);
        glavniElement.appendChild(nextButton);
    }

    azurirajPrikaz();

    return { fnLijevo, fnDesno };
}