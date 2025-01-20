document.addEventListener('DOMContentLoaded', () => {
    const lokacija = sessionStorage.getItem('lokacija');
    const top5Nekretnina = JSON.parse(sessionStorage.getItem('top5Nekretnina'));

    const lokacijaNaziv = document.getElementById('lokacija-naziv');
    const nekretnineLista = document.getElementById('nekretnine-lista');

    if (lokacija) {
        lokacijaNaziv.textContent = lokacija;
    } else {
        lokacijaNaziv.textContent = 'Nepoznata lokacija';
    }

    if (top5Nekretnina && top5Nekretnina.length > 0) {
        nekretnineLista.innerHTML = '';
        top5Nekretnina.forEach(nekretnina => {
            const div = document.createElement('div');
            div.className = 'nekretnina';
            div.innerHTML = `
                <h2>${nekretnina.naziv}</h2>
                <p>${nekretnina.opis}</p>
            `;
            nekretnineLista.appendChild(div);
        });
    } else {
        nekretnineLista.innerHTML = '<p>Nema dostupnih nekretnina za ovu lokaciju.</p>';
    }
});