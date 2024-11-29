let StatistikaNekretnina = function (SpisakNekretnina) {
    // Privatni atributi modula

    // Implementacija metoda
    let init = function (listaNekretnina, listaKorisnika) {
        SpisakNekretnina.init(listaNekretnina, listaKorisnika);
    };

    let prosjecnaKvadratura = function (kriterij) {
        let filtriraneNekretnine = SpisakNekretnina.filtrirajNekretnine(kriterij);

        if (filtriraneNekretnine.length === 0) {
            return 0;
        }

        let ukupnaKvadratura = filtriraneNekretnine.reduce((suma, nekretnina) => suma + nekretnina.kvadratura, 0);
        return ukupnaKvadratura / filtriraneNekretnine.length;
    };

    let outlier = function (kriterij, nazivSvojstva) {
        let filtriraneNekretnine = SpisakNekretnina.filtrirajNekretnine(kriterij);
    
        if (filtriraneNekretnine.length === 0) {
            return null;
        }
    
        let sveNekretnine = SpisakNekretnina.listaNekretnina;
    
        let srednjaVrijednost = sveNekretnine.reduce((suma, nekretnina) => suma + nekretnina[nazivSvojstva], 0) / sveNekretnine.length;
    
        let outlier = filtriraneNekretnine[0];
    
        for (let nekretnina of filtriraneNekretnine) {
            let odstupanje = Math.abs(nekretnina[nazivSvojstva] - srednjaVrijednost);
            let maxOdstupanje = Math.abs(outlier[nazivSvojstva] - srednjaVrijednost);
            
            if (odstupanje > maxOdstupanje) {
                outlier = nekretnina;
            }
        }
        return outlier;
    };
    

    let mojeNekretnine = function (korisnik) {
        let nekretnineSaUpitima = SpisakNekretnina.listaNekretnina.filter(nekretnina =>
            nekretnina.upiti && nekretnina.upiti.some(upit => upit.korisnik === korisnik)
        );

        return nekretnineSaUpitima.sort((a, b) => b.upiti.length - a.upiti.length);
    };

    let histogramCijena = function (periodi, rasponiCijena) {
        let histogram = [];
    
        if (!SpisakNekretnina || !SpisakNekretnina.listaNekretnina) {
            console.error("Lista nekretnina nije dostupna.");
            return histogram;
        }
    
        periodi.forEach((period, indeksPerioda) => {
            rasponiCijena.forEach((raspon, indeksRaspona) => {
                const brojNekretnina = SpisakNekretnina.listaNekretnina.filter(n => {
                    let datumObjave = n.datum_objave;
    
                    if (datumObjave.endsWith('.')) {
                        datumObjave = datumObjave.slice(0, -1);
                    }
    
                    const deloviDatuma = datumObjave.split('.');
                    const reformiraniDatum = `${deloviDatuma[2]}-${deloviDatuma[1]}-${deloviDatuma[0]}`;
    
                    const godinaObjave = new Date(reformiraniDatum).getFullYear();
    
                    if (isNaN(godinaObjave)) {
                        console.error("Neispravan datum za nekretninu!");
                        return false;
                    }
                    
                    const godinaUnutarPerioda = godinaObjave >= period.od && godinaObjave <= period.do;
                    const cijenaUnutarRaspona = n.cijena >= raspon.od && n.cijena <= raspon.do;                    
                    return godinaUnutarPerioda && cijenaUnutarRaspona;
                }).length;
    
                histogram.push({
                    indeksPerioda,
                    indeksRaspona,
                    brojNekretnina
                });
            });
        });
        return histogram;
    };

    return {
        init: init,
        prosjecnaKvadratura: prosjecnaKvadratura,
        outlier: outlier,
        mojeNekretnine: mojeNekretnine,
        histogramCijena: histogramCijena
    };
};