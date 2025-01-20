document.addEventListener('DOMContentLoaded', () => {
    const upitiContainer = document.getElementById('upiti');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const lokacijaLink = document.getElementById('lokacija-link');
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    let carousel = null;

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
            document.querySelector('#kolona1 p:nth-child(1)').textContent = `Tip grijanja: ${nekretnina.tip_grijanja}`;
            document.querySelector('#kolona1 p:nth-child(2) a').textContent = nekretnina.lokacija;
            document.querySelector('#kolona2 p:nth-child(1)').textContent = `Godina izgradnje: ${nekretnina.godina_izgradnje}`;
            document.querySelector('#kolona2 p:nth-child(2)').textContent = `Datum objave oglasa: ${nekretnina.datum_objave}`;
            document.querySelector('#opis p').textContent = nekretnina.opis;

            if (nekretnina.upiti && nekretnina.upiti.length > 0) {
                carousel = postaviCarousel(upitiContainer, nekretnina.upiti, 0, id);
            } else {
                upitiContainer.innerHTML = '<p>Nema dostupnih upita za ovu nekretninu.</p>';
            }
        });
    } else {
        alert('ID nekretnine nije definisan.');
    }

    if (prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            if (carousel) carousel.fnLijevo();
        });
        nextButton.addEventListener('click', () => {
            if (carousel) carousel.fnDesno();
        });
    }

    lokacijaLink.addEventListener('click', (e) => {
        e.preventDefault();
        const lokacija = lokacijaLink.textContent;
    
        PoziviAjax.getTop5Nekretnina(lokacija, (error, nekretnine) => {
            if (error) {
                alert('Došlo je do greške prilikom dohvaćanja nekretnina.');
                return;
            }
    
            // Spremi nekretnine u `sessionStorage` za prenos na novu stranicu
            sessionStorage.setItem('top5Nekretnina', JSON.stringify(nekretnine));
            sessionStorage.setItem('lokacija', lokacija);
    
            // Preusmjeri na novu stranicu
            window.location.href = 'top5.html';
        });
    });
});