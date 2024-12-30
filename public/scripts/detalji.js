document.addEventListener('DOMContentLoaded', () => {
    const upitiContainer = document.getElementById('upiti');
    const sviUpiti = Array.from(upitiContainer.getElementsByClassName('upit'));
    const carouselNav = document.querySelector('.carousel-nav');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');

    let trenutnaStranica = 1; // Početna stranica za dohvaćanje upita
    let kraj = false; // Indikator da li su svi upiti učitani

    const carousel = postaviCarousel(upitiContainer, sviUpiti);

    function azurirajPrikazPoSirini() {
        if (window.innerWidth > 600) {
            // Prikazuje oba upita iznad 600px
            upitiContainer.innerHTML = '';
            sviUpiti.forEach(upit => upitiContainer.appendChild(upit));
            carouselNav.style.display = 'none';
        } else {
            carouselNav.style.display = 'flex';
            if (carousel) carousel.fnDesno();
        }
    }

    function dohvatitiDodatneUpite() {
        if (kraj) return; // Ako su svi upiti učitani, nema daljeg poziva

        PoziviAjax.getNextUpiti(nekretnina_id, trenutnaStranica, (error, upiti) => {
            if (error || upiti.length === 0) {
                kraj = true; // Postavlja indikator da su svi upiti učitani
                return;
            }

            upiti.forEach(upit => {
                const noviUpit = document.createElement('div');
                noviUpit.className = 'upit';
                noviUpit.innerHTML = `<p>${upit.tekst_upita}</p>`;
                upitiContainer.appendChild(noviUpit);
            });

            trenutnaStranica++; // Uvećava trenutnu stranicu za sledeći poziv
        });
    }

    if (carousel) {
        prevButton.addEventListener('click', carousel.fnLijevo);
        nextButton.addEventListener('click', () => { carousel.fnDesno();
            const scrollRight = upitiContainer.scrollLeft + upitiContainer.clientWidth;
            if (scrollRight >= upitiContainer.scrollWidth - 1) {
                dohvatitiDodatneUpite();
            }
        });
    }

    window.addEventListener('resize', azurirajPrikazPoSirini);

    azurirajPrikazPoSirini();
});