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
    async function impl_getKorisnik(fnCallback) {
        try {
            const result = await pool.query('SELECT * FROM korisnici WHERE username = $1', [req.session.username]);
            if (result.rows.length === 0) {
                return fnCallback("error", null);
            }
            fnCallback(null, result.rows[0]);
        } catch (err) {
            fnCallback(err, null);
        }
    }

    // ažurira podatke loginovanog korisnika
    async function impl_putKorisnik(noviPodaci, fnCallback) {
        try {
            const { ime, prezime, username, password } = noviPodaci;

            const result = await pool.query(
                'UPDATE korisnici SET ime = $1, prezime = $2, password = $3 WHERE username = $4 RETURNING *',
                [ime, prezime, password, req.session.username]
            );

            if (result.rowCount === 0) {
                return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
            }

            fnCallback(null, { poruka: 'Podaci su uspješno ažurirani' });
        } catch (err) {
            fnCallback(err, null);
        }
    }

    // dodaje novi upit za trenutno loginovanog korisnika
    async function impl_postUpit(nekretnina_id, tekst_upita, fnCallback) {
        try {
            const korisnik = await pool.query('SELECT id FROM korisnici WHERE username = $1', [req.session.username]);
            if (korisnik.rows.length === 0) {
                return fnCallback({ status: 401, statusText: 'Neautorizovan pristup' }, null);
            }

            const nekretnina = await pool.query('SELECT * FROM nekretnine WHERE id = $1', [nekretnina_id]);
            if (nekretnina.rows.length === 0) {
                return fnCallback({ status: 400, statusText: `Nekretnina sa id-em ${nekretnina_id} ne postoji` }, null);
            }

            await pool.query(
                'INSERT INTO upiti (korisnik_id, nekretnina_id, tekst_upita) VALUES ($1, $2, $3)',
                [korisnik.rows[0].id, nekretnina_id, tekst_upita]
            );

            fnCallback(null, { poruka: 'Upit je uspješno dodan' });
        } catch (err) {
            fnCallback(err, null);
        }
    }

    async function impl_getNekretnine(fnCallback) {
        try {
            const result = await pool.query('SELECT * FROM nekretnine');
            fnCallback(null, result.rows);
        } catch (err) {
            fnCallback(err, null);
        }
    }

    async function impl_postLogin(username, password, fnCallback) {
        try {
            const result = await pool.query('SELECT * FROM korisnici WHERE username = $1 AND password = $2', [username, password]);

            if (result.rows.length === 0) {
                return fnCallback({ status: 401, statusText: 'Neispravni kredencijali' }, null);
            }

            req.session.username = username;
            fnCallback(null, { poruka: 'Prijava uspješna' });
        } catch (err) {
            fnCallback(err, null);
        }
    }

    async function impl_postLogout(fnCallback) {
        try {
            req.session.destroy((err) => {
                if (err) {
                    return fnCallback(err, null);
                }
                fnCallback(null, { poruka: 'Odjava uspješna' });
            });
        } catch (err) {
            fnCallback(err, null);
        }
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

    function getNextUpiti(nekretnina_id, page, fnCallback) {
    const url = `/next/upiti/nekretnina${encodeURIComponent(nekretnina_id)}?page=${encodeURIComponent(page)}`;
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
        getNextUpiti
    };
})();