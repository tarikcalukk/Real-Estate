document.addEventListener('DOMContentLoaded', () => {
    const upitiContainer = document.getElementById('upiti');
    const sviUpiti = Array.from(upitiContainer.getElementsByClassName('upit'));
    const carouselNav = document.querySelector('.carousel-nav');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');

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

    if (carousel) {
        prevButton.addEventListener('click', carousel.fnLijevo);
        nextButton.addEventListener('click', carousel.fnDesno);
    }

    window.addEventListener('resize', azurirajPrikazPoSirini);

    azurirajPrikazPoSirini();
});