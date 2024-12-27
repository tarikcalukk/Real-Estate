document.addEventListener('DOMContentLoaded', () => {
    const iscrtajButton = document.getElementById('iscrtaj');
    const izborStatistike = document.getElementById('izborStatistike');
    const periodiInput = document.getElementById('periodi');
    const rasponiCijenaInput = document.getElementById('rasponiCijena');
    const chartContainer = document.getElementById('chart-container');

    const listaNekretnina = [];
    const listaKorisnika = [];
    
    let nekretnine = SpisakNekretnina();
    nekretnine.init(listaNekretnina, listaKorisnika);
    let statistika = StatistikaNekretnina(nekretnine);

    document.getElementById('iscrtaj').style.display = 'none';
    document.getElementById("chart-container").style.display = "none";
    document.getElementById('dodajNekretninu').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'block';
    });

    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'none';
    });

    document.getElementById('closeModal_filter').addEventListener('click', () => {
        document.getElementById('modalUnos').style.display = 'none';
    });

    document.getElementById('dodajKorisnika').addEventListener('click', () => {
        document.getElementById('modalKorisnik').style.display = 'block';
    });

    document.getElementById('closeModalKorisnik').addEventListener('click', () => {
        document.getElementById('modalKorisnik').style.display = 'none';
    });

    document.getElementById('nekretnineForma').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('id').value, 10);
        const tip_nekretnine = document.getElementById('tip_nekretnine').value;
        const naziv = document.getElementById('naziv').value;
        const kvadratura = parseFloat(document.getElementById('kvadratura').value);
        const cijena = parseFloat(document.getElementById('cijena').value);
        const tip_grijanja = document.getElementById('tip_grijanja').value;
        const lokacija = document.getElementById('lokacija').value;
        const godina_izgradnje = parseInt(document.getElementById('godina_izgradnje').value, 10);
        const datum_objave = document.getElementById('datum_objave').value;
        const opis = document.getElementById('opis').value;

        listaNekretnina.push({
            id,
            tip_nekretnine,
            naziv,
            kvadratura,
            cijena,
            tip_grijanja,
            lokacija,
            godina_izgradnje,
            datum_objave,
            opis,
            upiti: []
        });

        document.getElementById('modal').style.display = 'none';
        document.getElementById('nekretnineForma').reset();
        alert('Nekretnina uspješno dodana!');
    });

    document.getElementById('korisnikForma').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const idKorisnika = parseInt(document.getElementById('idKorisnika').value, 10);
        const ime = document.getElementById('ime').value;
        const prezime = document.getElementById('prezime').value;
        const username = document.getElementById('username').value;
        
        listaKorisnika.push({
            id: idKorisnika,
            ime,
            prezime,
            username
        });
    
        document.getElementById('modalKorisnik').style.display = 'none';
        document.getElementById('korisnikForma').reset();
    
        alert('Korisnik uspješno dodan!');
    });

    document.getElementById("izborStatistike").addEventListener("change", function () {
        const izbor = this.value;
        
        document.getElementById("prosjecnaKvadratura").style.display = "none";
        document.getElementById("histogramCijena").style.display = "none";
        document.getElementById("outlier").style.display = "none";
        document.getElementById("mojeNekretnine").style.display = "none";

        
        if (izbor === "prosjecnaKvadratura") {
            document.getElementById("prosjecnaKvadratura").style.display = "block";
            document.getElementById("modalUnos").style.display = "block";
            document.getElementById('iscrtaj').style.display = 'none';
        }
        else if (izbor === "outlier") {
            document.getElementById("outlier").style.display = "block";
            document.getElementById("modalUnos").style.display = "block";
            document.getElementById("chart-container").style.display = "none";
        }
        else if (izbor === "histogramCijena") {
            document.getElementById("chart-container").style.display = "block";
            document.getElementById("histogramCijena").style.display = "block";
            document.getElementById("periodi").value = ""; 
            document.getElementById("rasponiCijena").value = "";
            document.getElementById("modalUnos").style.display = "none";
            document.getElementById('iscrtaj').style.display = 'block';

        } 
        else if (izbor === "mojeNekretnine") {
            document.getElementById("mojeNekretnine").style.display = "block";
            document.getElementById("modalUnos").style.display = "none";
            document.getElementById("chart-container").style.display = "none";
            document.getElementById('iscrtaj').style.display = 'block';
        }
    });

    document.getElementById("filtriranjeUnos").addEventListener("submit", function (event) {
        event.preventDefault();
        let kriterij = {};
        
        const formData = new FormData(event.target);
    
        formData.forEach((value, key) => {
            if (value.trim() !== "") {
                let keyWithoutFilter = key.replace('_filter', '');
                
                if (keyWithoutFilter.includes('datum_objave')) {
                    let date = new Date(value);
                    let day = String(date.getDate()).padStart(2, '0');
                    let month = String(date.getMonth() + 1).padStart(2, '0');
                    let year = date.getFullYear();
                
                    kriterij[keyWithoutFilter] = `${day}.${month}.${year}.`;
                } else {
                    kriterij[keyWithoutFilter] = value;
                }
            }
        });
    
        const izbor = izborStatistike.value;
    
        if (izbor === 'outlier') {
            const nazivSvojstva = document.getElementById('nazivSvojstva').value.trim();
            if (!nazivSvojstva) {
                alert('Molimo unesite naziv svojstva za outlier analizu!');
                return;
            }
    
            const outlieri = statistika.outlier(kriterij, nazivSvojstva);
    
            if (outlieri) {
                alert(`Outlier nekretnina: ${JSON.stringify(outlieri)}`);
            } else {
                alert('Nema nekretnina koje odgovaraju kriterijima za outlier analizu.');
            }
        } else {
            const prosjecnaKvadratura = statistika.prosjecnaKvadratura(kriterij);
            alert(`Prosječna kvadratura: ${prosjecnaKvadratura}`);
        }
    });
    
    iscrtajButton.addEventListener('click', () => {
    const izbor = izborStatistike.value;
    if (izbor === 'mojeNekretnine') {
        const id = prompt("Unesite ID korisnika:");
        const ime = prompt("Unesite ime korisnika:");
        const prezime = prompt("Unesite prezime korisnika:");
        const username = prompt("Unesite korisničko ime:");
    
        if (id && ime && prezime && username) {
            const korisnik = { id, ime, prezime, username };
            const nekretnine = statistika.mojeNekretnine(korisnik);
    
            if (nekretnine === "Nema korisnika.") {
                alert("Nema korisnika sa tim podacima.");
            } else if (nekretnine === "Ovaj korisnik nema nekretnine.") {
                alert("Ovaj korisnik nema nekretnine.");
            } else {
                let output = "<h3>Nekretnine korisnika " + korisnik.ime + " " + korisnik.prezime + ":</h3><ul>";
                
                nekretnine.forEach(nekretnina => {
                    output += `
                        <li>
                            <strong>Naziv:</strong> ${nekretnina.naziv} <br>
                            <strong>Tip:</strong> ${nekretnina.tip_nekretnine} <br>
                            <strong>Kvadratura:</strong> ${nekretnina.kvadratura} m² <br>
                            <strong>Cijena:</strong> ${nekretnina.cijena} <br>
                            <strong>Grijanje:</strong> ${nekretnina.tip_grijanja} <br>
                            <strong>Lokacija:</strong> ${nekretnina.lokacija} <br>
                            <strong>Godina izgradnje:</strong> ${nekretnina.godina_izgradnje} <br>
                        </li>
                    `;
                });
                output += "</ul>";
                
                document.getElementById("nekretnineDisplay").innerHTML = output;
            }
        } else {
            alert("Unesite sve podatke.");
        }
    }
    else if (izbor === 'histogramCijena') {
        const periodi = parsePeriodi(periodiInput.value);
        const rasponiCijena = parseRasponiCijena(rasponiCijenaInput.value);
        const histogram = statistika.histogramCijena(periodi, rasponiCijena);
        iscrtajHistogram(histogram, periodi, rasponiCijena);
    }
    });

    function parsePeriodi(input) {
        return input.split(',').map(period => {
            const [od, do_] = period.split('-').map(Number);
            return { od, do: do_ };
        });
    }

    function parseRasponiCijena(input) {
        return input.split(',').map(raspon => {
            const [od, do_] = raspon.split('-').map(Number);
            return { od, do: do_ };
        });
    }

    function iscrtajHistogram(histogram, periodi, rasponiCijena) {
        chartContainer.innerHTML = '';
        periodi.forEach((period, indeksPerioda) => {
            const data = [];
            rasponiCijena.forEach((raspon, indeksRaspona) => {
                const item = histogram.find(h =>
                    h.indeksPerioda === indeksPerioda &&
                    h.indeksRaspona === indeksRaspona
                );
                data.push(item ? item.brojNekretnina : 0);
            });

            const canvas = document.createElement('canvas');
            chartContainer.appendChild(canvas);

            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: rasponiCijena.map(r => `${r.od} - ${r.do}`),
                    datasets: [{
                        label: `Period: ${period.od} - ${period.do}`,
                        data,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Broj nekretnina'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Raspon cijena'
                            }
                        }
                    }
                }
            });
        });
    }
});
