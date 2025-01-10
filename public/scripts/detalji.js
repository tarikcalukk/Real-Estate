document.addEventListener('DOMContentLoaded', () => {
    const upitiContainer = document.getElementById('upiti');
    const sviUpiti = Array.from(upitiContainer.getElementsByClassName('upit'));
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const lokacijaLink = document.getElementById('lokacija-link');
    const carousel = postaviCarousel(upitiContainer, sviUpiti);
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

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

    if (id) {
        PoziviAjax.getNekretnina(id, (error, nekretnina) => {
            if (error || !nekretnina) {
                alert('Došlo je do greške ili nekretnina nije pronađena.');
                return;
            }

            document.querySelector('#osnovno img').src = `../resources/${nekretnina.id}.jpg`;
            document.querySelector('#osnovno p:nth-child(2)').textContent = `Naziv: ${nekretnina.naziv}`;
            document.querySelector('#osnovno p:nth-child(3)').textContent = `Kvadratura: ${nekretnina.kvadratura} m²`;
            document.querySelector('#osnovno p:nth-child(4)').textContent = `Cijena: ${nekretnina.cijena} BAM`;
            document.querySelector('#kolona1 p:nth-child(1)').textContent = `Tip grijanja: ${nekretnina.tipGrijanja}`;
            document.querySelector('#kolona1 p:nth-child(2) a').textContent = nekretnina.lokacija;
            document.querySelector('#kolona2 p:nth-child(1)').textContent = `Godina izgradnje: ${nekretnina.godinaIzgradnje}`;
            document.querySelector('#kolona2 p:nth-child(2)').textContent = `Datum objave oglasa: ${nekretnina.datumObjave}`;
            document.querySelector('#opis p').textContent = nekretnina.opis;
        });
    } else {
        alert('ID nekretnine nije definisan.');
    }
});