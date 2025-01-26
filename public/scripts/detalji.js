document.addEventListener('DOMContentLoaded', () => {
    const upitiContainer = document.getElementById('upiti');
    const zahtjeviContainer = document.getElementById('zahtjevi');
    const ponudeContainer = document.getElementById('ponude');
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (id) {
        PoziviAjax.getNekretnina(id, (error, response) => {
            if (error || !response) {
                alert('Došlo je do greške ili nekretnina nije pronađena.');
                return;
            }
            const { nekretnina, upiti, zahtjevi, ponude } = response;
            document.querySelector('#osnovno img').src = `../resources/${nekretnina.id}.jpg`;
            document.querySelector('#osnovno p:nth-child(2)').textContent = `Naziv: ${nekretnina.naziv}`;
            document.querySelector('#osnovno p:nth-child(3)').textContent = `Kvadratura: ${nekretnina.kvadratura} m²`;
            document.querySelector('#osnovno p:nth-child(4)').textContent = `Cijena: ${nekretnina.cijena} BAM`;
            document.querySelector('#kolona1 p:nth-child(1)').textContent = `Tip grijanja: ${nekretnina.tip_grijanja}`;
            document.querySelector('#kolona1 p:nth-child(2) a').textContent = nekretnina.lokacija;
            document.querySelector('#kolona2 p:nth-child(1)').textContent = `Godina izgradnje: ${nekretnina.godina_izgradnje}`;
            document.querySelector('#kolona2 p:nth-child(2)').textContent = `Datum objave oglasa: ${nekretnina.datum_objave}`;
            document.querySelector('#opis p').textContent = nekretnina.opis;

            PoziviAjax.getNekretninaInteresovanja(id, (error, interesovanja) => {
                if (error) {
                    console.error('Došlo je do greške prilikom dohvaćanja interesovanja.');
                    return;
                }

                postaviCarousel(upitiContainer, upiti, 0, id);
                postaviCarousel(zahtjeviContainer, zahtjevi, 0, id);
                postaviCarousel(ponudeContainer, ponude, 0, id);
            });
        });
    } else {
        alert('Pogrešan ID.');
    }
});