document.addEventListener('DOMContentLoaded', function () {
    const glavniElement = document.querySelector('#upiti');
    const sviElementi = Array.from(glavniElement.getElementsByClassName('upit'));

    const { fnLijevo, fnDesno } = postaviCarousel(glavniElement, sviElementi);

    document.querySelector('#prev').addEventListener('click', fnLijevo);
    document.querySelector('#next').addEventListener('click', fnDesno);
});
