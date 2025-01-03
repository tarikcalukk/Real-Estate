document.addEventListener('DOMContentLoaded', () => {
    const upitiContainer = document.getElementById('upiti');
    const sviUpiti = Array.from(upitiContainer.getElementsByClassName('upit'));
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const lokacijaLink = document.getElementById('lokacija-link');
    const carousel = postaviCarousel(upitiContainer, sviUpiti);

    lokacijaLink.addEventListener('click', (e) => {
        e.preventDefault();
        const lokacija = lokacijaLink.textContent;

        PoziviAjax.getTop5Nekretnina(lokacija, (error, nekretnine) => {
            if (error) {
                alert('Došlo je do greške prilikom dohvaćanja nekretnina.');
                return;
            }

            upitiContainer.innerHTML = '';
            nekretnine.forEach(nekretnina => {
                const div = document.createElement('div');
                div.className = 'upit';
                div.innerHTML = `
                    <p><strong>${nekretnina.naziv}</strong></p>
                    <p>${nekretnina.opis}</p>
                `;
                upitiContainer.appendChild(div);
            });
        });
    });

    if (carousel) {
        prevButton.addEventListener('click', carousel.fnLijevo);
        nextButton.addEventListener('click', carousel.fnDesno);
    }
});