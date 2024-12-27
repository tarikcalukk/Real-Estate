function postaviCarousel(glavniElement, sviElementi, indeks = 0) {
    if (!glavniElement || !Array.isArray(sviElementi) || sviElementi.length === 0 || indeks < 0 || indeks >= sviElementi.length) {
        return null;
    }

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
    }

    azurirajPrikaz();

    return { fnLijevo, fnDesno };
}
