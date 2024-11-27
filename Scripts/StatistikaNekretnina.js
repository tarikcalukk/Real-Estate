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
        let rezultat = [];

        periodi.forEach((period, indeksPerioda) => {
            let nekretnineUPeriodu = SpisakNekretnina.listaNekretnina.filter(nekretnina =>
                nekretnina.godina_objave >= period.od && nekretnina.godina_objave <= period.do
            );

            rasponiCijena.forEach((raspon, indeksRasponaCijena) => {
                let brojNekretnina = nekretnineUPeriodu.filter(nekretnina =>
                    nekretnina.cijena >= raspon.od && nekretnina.cijena <= raspon.do
                ).length;

                rezultat.push({
                    indeksPerioda: indeksPerioda,
                    indeksRasponaCijena: indeksRasponaCijena,
                    brojNekretnina: brojNekretnina
                });
            });
        });
        return rezultat;
    };


    return {
        init: init,
        prosjecnaKvadratura: prosjecnaKvadratura,
        outlier: outlier,
        mojeNekretnine: mojeNekretnine,
        histogramCijena: histogramCijena
    };
};