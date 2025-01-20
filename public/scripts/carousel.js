function postaviCarousel(glavniElement, sviUpiti, indeks = 0, nekretninaId = null) {
    if (!glavniElement || !Array.isArray(sviUpiti) || sviUpiti.length === 0 || indeks < 0 || indeks >= sviUpiti.length) {
        return null;
    }

    let trenutnaStranica = 1;
    let kraj = false;

    function azurirajPrikaz() {
        const upit = sviUpiti[indeks];
        glavniElement.innerHTML = `
            <div class="upit">
                <p class="upit-tekst">${upit.tekst_upita || 'Tekst nije dostupan'}</p>
            </div>
        `;
    }

    function fnLijevo() {
        indeks = (indeks - 1 + sviUpiti.length) % sviUpiti.length;
        azurirajPrikaz();
    }

    function fnDesno() {
        indeks = (indeks + 1) % sviUpiti.length;
        azurirajPrikaz();

        if (!kraj && indeks >= sviUpiti.length - 1) {
            PoziviAjax.getNextUpiti(nekretninaId, trenutnaStranica, (error, noviUpiti) => {
                if (error || !noviUpiti || noviUpiti.length === 0) {
                    kraj = true;
                } else {
                    trenutnaStranica++;
                    sviUpiti.push(...noviUpiti);
                }
            });
        }
    }

    azurirajPrikaz();
    return { fnLijevo, fnDesno };
}