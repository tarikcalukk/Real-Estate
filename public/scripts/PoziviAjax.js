const PoziviAjax = (() => {

    // fnCallback se u svim metodama poziva kada stigne
    // odgovor sa servera putem Ajax-a
    // svaki callback kao parametre ima error i data,
    // error je null ako je status 200 i data je tijelo odgovora
    // ako postoji greška, poruka se prosljeđuje u error parametru
    // callback-a, a data je tada null

    function ajaxRequest(method, url, data, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(null, xhr.responseText);
                } else {
                    callback({ status: xhr.status, statusText: xhr.statusText }, null);
                }
            }
        };
        xhr.send(data ? JSON.stringify(data) : null);
    }

    // vraća korisnika koji je trenutno prijavljen na sistem
    function impl_getKorisnik(fnCallback) {
        let ajax = new XMLHttpRequest();

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    console.log('Uspješan zahtjev, status 200');
                    fnCallback(null, JSON.parse(ajax.responseText));
                } else if (ajax.status == 401) {
                    console.log('Neuspješan zahtjev, status 401');
                    fnCallback("error", null);
                } else {
                    console.log('Nepoznat status:', ajax.status);
                }
            }
        };

        ajax.open("GET", "http://localhost:3000/korisnik/", true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send();
    }

    // ažurira podatke loginovanog korisnika
    async function impl_putKorisnik(noviPodaci, fnCallback) {
        if (!req.session.username) {
            return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
        }

        const { ime, prezime, username, password } = noviPodaci;

        try {
            const loggedInUser = await db.Korisnik.findOne({
                where: { username: req.session.username },
            });

            if (!loggedInUser) {
                return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
            }

            if (ime) loggedInUser.ime = ime;
            if (prezime) loggedInUser.prezime = prezime;
            if (username) loggedInUser.username = username;
            if (password) loggedInUser.password = password;

            await loggedInUser.save();

            fnCallback(null, { poruka: 'Podaci su uspješno ažurirani' });
        } catch (err) {
            console.error('Greška pri ažuriranju korisnika:', err);
            fnCallback({ status: 500, statusText: 'Greška na serveru' }, null);
        }
    }

    // dodaje novi upit za trenutno loginovanog korisnika
    async function impl_postUpit(nekretnina_id, tekst_upita, fnCallback) {
        try {
            // Pretpostavljamo da je `req.session.username` dostupno, a korisnik je autentifikovan
            const loggedInUser = await getLoggedInUser();  // Pretpostavimo da je ovo funkcija koja vraća trenutnog korisnika na osnovu sesije
    
            if (!loggedInUser) {
                return fnCallback({ status: 401, statusText: "Neautorizovan pristup" }, null);
            }
    
            // Provjeravamo da li postoji nekretnina sa navedenim id-jem
            const [nekretnina] = await db.promise().query('SELECT * FROM Nekretnina WHERE id = ?', [nekretnina_id]);
    
            if (!nekretnina) {
                return fnCallback({ status: 400, statusText: `Nekretnina sa id-em ${nekretnina_id} ne postoji` }, null);
            }
    
            // Kreiramo upit u bazi podataka
            await db.promise().query('INSERT INTO Upit (korisnik_id, nekretnina_id, tekst) VALUES (?, ?, ?)', [
                loggedInUser.id, nekretnina.id, tekst_upita
            ]);
    
            fnCallback(null, { poruka: "Upit je uspješno dodan" });
        } catch (error) {
            console.error("Greška:", error);
            fnCallback({ status: 500, statusText: "Internal Server Error" }, null);
        }
    }    

    function impl_getNekretnine(fnCallback) {
        // Koristimo AJAX poziv da bismo dohvatili podatke s servera
        ajaxRequest('GET', '/nekretnine', null, (error, data) => {
            // Ako se dogodi greška pri dohvaćanju podataka, proslijedi grešku kroz callback
            if (error) {
                fnCallback(error, null);
            } else {
                // Ako su podaci uspješno dohvaćeni, parsiraj JSON i proslijedi ih kroz callback
                try {
                    const nekretnine = JSON.parse(data);
                    fnCallback(null, nekretnine);
                } catch (parseError) {
                    // Ako se dogodi greška pri parsiranju JSON-a, proslijedi grešku kroz callback
                    fnCallback(parseError, null);
                }
            }
        });
    }

    function impl_postLogin(username, password, fnCallback) {
        var ajax = new XMLHttpRequest()

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                fnCallback(null, ajax.response)
            }
            else if (ajax.readyState == 4) {
                //desio se neki error
                fnCallback(ajax.statusText, null)
            }
        }
        ajax.open("POST", "http://localhost:3000/login", true)
        ajax.setRequestHeader("Content-Type", "application/json")
        var objekat = {
            "username": username,
            "password": password
        }
        forSend = JSON.stringify(objekat)
        ajax.send(forSend)
    }

    function impl_postLogout(fnCallback) {
        let ajax = new XMLHttpRequest()

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                fnCallback(null, ajax.response)
            }
            else if (ajax.readyState == 4) {
                //desio se neki error
                fnCallback(ajax.statusText, null)
            }
        }
        ajax.open("POST", "http://localhost:3000/logout", true)
        ajax.send()
    }

    function getTop5Nekretnina(lokacija, fnCallback) {
        ajaxRequest('GET', `/nekretnine/top5?lokacija=${encodeURIComponent(lokacija)}`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const top5Nekretnina = JSON.parse(data);
                    fnCallback(null, top5Nekretnina);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }    

    function getMojiUpiti(fnCallback) {
        ajaxRequest('GET', '/upiti/moji', null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const upiti = JSON.parse(data);
                    fnCallback(null, upiti);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    } 

    function getNekretnina(nekretnina_id, fnCallback) {
        const url = `/nekretnina/${encodeURIComponent(nekretnina_id)}`;
        ajaxRequest('GET', url, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const nekretnina = JSON.parse(data);
                    fnCallback(null, nekretnina);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }    

    function getNextUpiti(nekretnina_id, fnCallback) {
        const url = `/next/upiti/nekretnina${encodeURIComponent(nekretnina_id)}`;
        ajaxRequest('GET', url, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const nextUpiti = JSON.parse(data);
                    fnCallback(null, nextUpiti);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }    

    function impl_getNekretninaInteresovanja(nekretnina_id,fnCallback) {
        ajaxRequest('GET', `/nekretnina/${encodeURIComponent(nekretnina_id)}/interesovanja`, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const interesovanja = JSON.parse(data);
                    fnCallback(null, interesovanja);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }
    
    function impl_postPonuda(nekretnina_id, tekst, ponudaCijene,datumPotvrde,vezanePonude,odbijenaPonuda, fnCallback) {
        const ponudaData = {
            tekst,
            ponudaCijene,
            datumPonude: datumPotvrde,
            vezanePonude,
            odbijenaPonuda
        };

        ajaxRequest('POST', `/nekretnina/${encodeURIComponent(nekretnina_id)}/ponuda`, ponudaData, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const novaPonuda = JSON.parse(data);
                    fnCallback(null, novaPonuda);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }
    
    function impl_postZahtjev(nekretnina_id, zahtjevData, fnCallback) {
        ajaxRequest('POST', `/nekretnina/${encodeURIComponent(nekretnina_id)}/zahtjev`, zahtjevData, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const zahtjev = JSON.parse(data);
                    fnCallback(null, zahtjev);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }
    
    function impl_putZahtjev(nekretnina_id, zahtjevId, updateData, fnCallback) {
        ajaxRequest('PUT', `/nekretnina/${encodeURIComponent(nekretnina_id)}/zahtjev/${encodeURIComponent(zahtjevId)}`, updateData, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const updatedZahtjev = JSON.parse(data);
                    fnCallback(null, updatedZahtjev);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    return {
        postLogin: impl_postLogin,
        postLogout: impl_postLogout,
        getKorisnik: impl_getKorisnik,
        putKorisnik: impl_putKorisnik,
        postUpit: impl_postUpit,
        getNekretnine: impl_getNekretnine,
        getTop5Nekretnina,
        getMojiUpiti,
        getNekretnina,
        getNextUpiti,
        getNekretninaInteresovanja: impl_getNekretninaInteresovanja,
        postPonuda: impl_postPonuda,
        postZahtjev: impl_postZahtjev,
        putZahtjev: impl_putZahtjev
    };
})();