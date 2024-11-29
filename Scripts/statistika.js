document.addEventListener('DOMContentLoaded', () => {
    const iscrtajButton = document.getElementById('iscrtaj');
    const periodiInput = document.getElementById('periodi');
    const rasponiCijenaInput = document.getElementById('rasponiCijena');
    const chartContainer = document.getElementById('chart-container');

    const listaNekretnina = [{
        id: 1,
        tip_nekretnine: "Stan",
        naziv: "Useljiv stan Sarajevo",
        kvadratura: 58,
        cijena: 232000,
        tip_grijanja: "plin",
        lokacija: "Novo Sarajevo",
        godina_izgradnje: 2019,
        datum_objave: "01.10.2023.",
        opis: "Sociis natoque penatibus.",
        upiti: [{
            korisnik_id: 1,
            tekst_upita: "Nullam eu pede mollis pretium."
        },
        {
            korisnik_id: 2,
            tekst_upita: "Phasellus viverra nulla."
        }]
    },{
        id: 1,
        tip_nekretnine: "Stan",
        naziv: "Useljiv stan Sarajevo",
        kvadratura: 58,
        cijena: 32000,
        tip_grijanja: "plin",
        lokacija: "Novo Sarajevo",
        godina_izgradnje: 2019,
        datum_objave: "01.10.2009.",
        opis: "Sociis natoque penatibus.",
        upiti: [{
            korisnik_id: 1,
            tekst_upita: "Nullam eu pede mollis pretium."
        },
        {
            korisnik_id: 2,
            tekst_upita: "Phasellus viverra nulla."
        }]
    },{
        id: 1,
        tip_nekretnine: "Stan",
        naziv: "Useljiv stan Sarajevo",
        kvadratura: 58,
        cijena: 232000,
        tip_grijanja: "plin",
        lokacija: "Novo Sarajevo",
        godina_izgradnje: 2019,
        datum_objave: "01.10.2003.",
        opis: "Sociis natoque penatibus.",
        upiti: [{
            korisnik_id: 1,
            tekst_upita: "Nullam eu pede mollis pretium."
        },
        {
            korisnik_id: 2,
            tekst_upita: "Phasellus viverra nulla."
        }]
    },
    {
        id: 2,
        tip_nekretnine: "Kuća",
        naziv: "Mali poslovni prostor",
        kvadratura: 20,
        cijena: 70000,
        tip_grijanja: "struja",
        lokacija: "Centar",
        godina_izgradnje: 2005,
        datum_objave: "20.08.2023.",
        opis: "Magnis dis parturient montes.",
        upiti: [{
            korisnik_id: 2,
            tekst_upita: "Integer tincidunt."
        }
        ]
    },
    {
        id: 3,
        tip_nekretnine: "Kuća",
        naziv: "Mali poslovni prostor",
        kvadratura: 20,
        cijena: 70000,
        tip_grijanja: "struja",
        lokacija: "Centar",
        godina_izgradnje: 2005,
        datum_objave: "20.08.2023.",
        opis: "Magnis dis parturient montes.",
        upiti: [{
            korisnik_id: 2,
            tekst_upita: "Integer tincidunt."
        }
        ]
    },
    {
        id: 4,
        tip_nekretnine: "Kuća",
        naziv: "Mali poslovni prostor",
        kvadratura: 20,
        cijena: 70000,
        tip_grijanja: "struja",
        lokacija: "Centar",
        godina_izgradnje: 2005,
        datum_objave: "20.08.2023.",
        opis: "Magnis dis parturient montes.",
        upiti: [{
            korisnik_id: 2,
            tekst_upita: "Integer tincidunt."
        }
        ]
    }]
    
    const listaKorisnika = [{
        id: 1,
        ime: "Neko",
        prezime: "Nekic",
        username: "username1",
    },
    {
        id: 2,
        ime: "Neko2",
        prezime: "Nekic2",
        username: "username2",
    }]
    
    let nekretnine = SpisakNekretnina();
    nekretnine.init(listaNekretnina, listaKorisnika);

    let statistika = StatistikaNekretnina(nekretnine);

    iscrtajButton.addEventListener('click', () => {
        const periodi = parsePeriodi(periodiInput.value);
        const rasponiCijena = parseRasponiCijena(rasponiCijenaInput.value);

        if (!periodi || !rasponiCijena) {
            alert('Molimo unesite ispravan format za periode i raspone cijena.');
            return;
        }

        const histogram = statistika.histogramCijena(periodi, rasponiCijena);
        iscrtajHistogram(histogram, periodi, rasponiCijena);
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
                    h.indeksRaspona === indeksRaspona // ispravljeno poređenje
                );
                data.push(item ? item.brojNekretnina : 0); // Ako nema podatka, staviti 0
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
