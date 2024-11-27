document.addEventListener('DOMContentLoaded', () => {
    const iscrtajButton = document.getElementById('iscrtaj');
    const periodiInput = document.getElementById('periodi');
    const rasponiCijenaInput = document.getElementById('rasponiCijena');
    const chartContainer = document.getElementById('chart-container');

    const nekretnine = listaNekretnina;

    iscrtajButton.addEventListener('click', () => {
        const periodi = parsePeriodi(periodiInput.value);
        const rasponiCijena = parseRasponiCijena(rasponiCijenaInput.value);

        if (!periodi || !rasponiCijena) {
            alert('Molimo unesite ispravan format za periode i raspone cijena.');
            return;
        }

        const histogram = histogramCijena(nekretnine, periodi, rasponiCijena);
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

    function histogramCijena(nekretnine, periodi, rasponiCijena) {
        const histogram = [];
        periodi.forEach((period, indeksPerioda) => {
            rasponiCijena.forEach((raspon, indeksRaspona) => {
                const brojNekretnina = nekretnine.filter(n => {
                    const godinaObjave = new Date(n.datum_objave).getFullYear();
                    return (
                        godinaObjave >= period.od && 
                        godinaObjave <= period.do && 
                        n.cijena >= raspon.od && 
                        n.cijena <= raspon.do
                    );
                }).length;
                histogram.push({
                    indeksPerioda,
                    indeksRaspona,
                    brojNekretnina
                });
            });
        });
        return histogram;
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
