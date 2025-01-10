function postaviCarousel(glavniElement, sviElementi, indeks = 0, nekretninaId = null) {
    if (!glavniElement || !Array.isArray(sviElementi) || sviElementi.length === 0 || indeks < 0 || indeks >= sviElementi.length) {
        return null;
    }

    let trenutnaStranica = 1;
    let kraj = false;
    let brojUcitavanja = 0;

    function azurirajPrikaz() {
        glavniElement.innerHTML = sviElementi[indeks].innerHTML;
    }

    function fnLijevo() {
        indeks = (indeks - 1 + sviElementi.length) % sviElementi.length;
        azurirajPrikaz();
    }

    function fnDesno() {
        indeks = (indeks + 1) % sviElementi.length;
        azurirajPrikaz();

        if (indeks === 2 && nekretninaId && !kraj) {
            PoziviAjax.getNextUpiti(nekretninaId, trenutnaStranica, (error, noviUpiti) => {
                if (error || !noviUpiti || noviUpiti.length === 0) {
                    kraj = true; // Svi upiti su učitani
                } else {
                    trenutnaStranica++;
                    noviUpiti.forEach(upit => {
                        const noviElement = document.createElement('div');
                        noviElement.className = 'upit';
                        noviElement.innerHTML = `<p>${upit.tekst_upita}</p>`;
                        sviElementi.push(noviElement);
                        brojUcitavanja++;
                    });
                }
            });
        }
    }

    azurirajPrikaz();

    return { fnLijevo, fnDesno };
}