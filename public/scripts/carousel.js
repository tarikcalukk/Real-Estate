function postaviCarousel(glavniElement, sviUpiti, indeks = 0, nekretnina_id = null) {
    if (!glavniElement || !Array.isArray(sviUpiti) || sviUpiti.length === 0 || indeks < 0 || indeks >= sviUpiti.length) {
        return null;
    }

    let kraj = false;

    glavniElement.innerHTML = `
        <div class="carousel-wrapper">
            <button class="carousel-button prev-button">◀</button>
            <div class="carousel-container">
                <div class="carousel-item"></div>
            </div>
            <button class="carousel-button next-button">▶</button>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .carousel-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin: 20px auto;
            max-width: 600px;
        }

        .carousel-container {
            flex: 1;
            overflow: hidden;
            background-color: #f9f9f9;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100px;
            padding: 10px;
        }

        .carousel-item {
            text-align: center;
            font-size: 16px;
            color: #333;
            transition: transform 0.3s ease, opacity 0.3s ease;
            opacity: 0;
        }

        .carousel-item.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .carousel-button {
            background-color: #007BFF;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        .carousel-button:hover {
            background-color: #0056b3;
        }

        .carousel-button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);

    const carouselContainer = glavniElement.querySelector('.carousel-container');
    const carouselItem = carouselContainer.querySelector('.carousel-item');
    const prevButton = glavniElement.querySelector('.prev-button');
    const nextButton = glavniElement.querySelector('.next-button');

    function azurirajPrikaz() {
        const upit = sviUpiti[indeks];
        carouselItem.textContent = upit.tekst || 'Tekst nije dostupan';

        carouselItem.classList.remove('visible');
        setTimeout(() => {
            carouselItem.classList.add('visible');
        }, 10);
    }

    function fnLijevo() {
        indeks = (indeks - 1 + sviUpiti.length) % sviUpiti.length;
        azurirajPrikaz();
    }

    function fnDesno() {
        indeks = (indeks + 1) % sviUpiti.length;
        azurirajPrikaz();

        if (!kraj && indeks >= sviUpiti.length - 1) {
            PoziviAjax.getNextUpiti(nekretnina_id, (error, noviUpiti) => {
                if (error || !noviUpiti || noviUpiti.length === 0) {
                    kraj = true;
                } else {
                    sviUpiti.push(...noviUpiti);
                }
            });
        }
    }

    prevButton.addEventListener('click', fnLijevo);
    nextButton.addEventListener('click', fnDesno);

    azurirajPrikaz();

    return { fnLijevo, fnDesno };
}