const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises; // Using asynchronus API for file read and write
const bcrypt = require('bcrypt');
const db = require('./data/db.js')
const moment = require('moment');

const app = express();
const PORT = 3000;
const LOG_FILE = path.join(__dirname, 'data', 'prijave.txt');
const BLOCK_TIME = 60000;
const MAX_ATTEMPTS = 3;

app.use(session({
  secret: 'tajna sifra',
  resave: true,
  saveUninitialized: true
}));

app.use(express.static(__dirname + '/public'));

// Enable JSON parsing without body-parser
app.use(express.json());

/* ---------------- SERVING HTML -------------------- */

// Async function for serving html files
async function serveHTMLFile(req, res, fileName) {
  const htmlPath = path.join(__dirname, 'public/html', fileName);
  try {
    const content = await fs.readFile(htmlPath, 'utf-8');
    res.send(content);
  } catch (error) {
    console.error('Error serving HTML file:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
}

// Array of HTML files and their routes
const routes = [
  { route: '/nekretnine.html', file: 'nekretnine.html' },
  { route: '/detalji.html', file: 'detalji.html' },
  { route: '/meni.html', file: 'meni.html' },
  { route: '/prijava.html', file: 'prijava.html' },
  { route: '/profil.html', file: 'profil.html' },
  // Practical for adding more .html files as the project grows
];

// Loop through the array so HTML can be served
routes.forEach(({ route, file }) => {
  app.get(route, async (req, res) => {
    await serveHTMLFile(req, res, file);
  });
});

/* ----------- SERVING OTHER ROUTES --------------- */

// Async function for reading json data from data folder 
async function readJsonFile(filename) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    const rawdata = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawdata);
  } catch (error) {
    throw error;
  }
}

// Async function for reading json data from data folder 
async function saveJsonFile(filename, data) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    throw error;
  }
}


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
      const korisnik = await db.Korisnik.findOne({ where: { username } });

      if (!korisnik || !(await bcrypt.compare(password, korisnik.password))) {
        return res.status(401).json({ greska: 'Neispravno korisničko ime ili lozinka' });
      }

      req.session.username = korisnik.username;
      req.session.role = korisnik.role;
      res.json({ poruka: 'Uspješna prijava' });
    } catch (err) {
      res.status(500).json({ greska: 'Greška na serveru' });
    }
});


/*
Delete everything from the session.
*/
app.post('/logout', (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ greska: 'Greška prilikom odjave' });
    } else {
      res.json({ poruka: 'Uspješno ste se odjavili' });
    }
  });
});

/*
Returns currently logged user data. First takes the username from the session and grabs other data
from the base.
*/
app.get('/korisnik', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  try {
    const korisnik = await db.Korisnik.findOne({ where: { username: req.session.username } });
    if (!korisnik) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen' });
    }

    res.status(200).json({
      id: korisnik.id,
      ime: korisnik.ime,
      prezime: korisnik.prezime,
      username: korisnik.username
    });
  } catch (error) {
    res.status(500).json({ greska: 'Greška na serveru' });
  }
});

/*
Allows logged user to make a request for a property
*/
app.post('/upit', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const { nekretnina_id, tekst_upita } = req.body;

  try {
    const korisnik = await db.Korisnik.findOne({ where: { username: req.session.username } });
    const nekretnina = await db.Nekretnina.findByPk(nekretnina_id);

    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina ne postoji' });
    }

    await db.Upit.create({
      korisnik_id: korisnik.id,
      nekretnina_id: nekretnina_id,
      tekst: tekst_upita
    });

    res.json({ poruka: 'Upit je uspješno kreiran' });
  } catch (err) {
    res.status(500).json({ greska: 'Greška na serveru' });
  }
});

/*
Updates any user field
*/
app.put('/korisnik', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  const { ime, prezime, username, password } = req.body;

  try {
    const korisnik = await db.Korisnik.findOne({ where: { username: req.session.username } });

    if (!korisnik) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen' });
    }

    if (ime) korisnik.ime = ime;
    if (prezime) korisnik.prezime = prezime;
    if (username) {
      korisnik.username = username;
      req.session.username = username;
    }
    if (password) korisnik.password = await bcrypt.hash(password, 10);

    await korisnik.save();

    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    res.status(500).json({ greska: 'Greška na serveru' });
  }
});

/*
Returns all properties from the file.
*/
app.get('/nekretnine', async (req, res) => {
  try {
    const nekretnine = await db.Nekretnina.findAll();
    res.json(nekretnine);
  } catch (err) {
    res.status(500).json({ greska: 'Greška na serveru' });
  }
});

/* ----------------- MARKETING ROUTES ----------------- */

// Route that increments value of pretrage for one based on list of ids in nizNekretnina
app.post('/marketing/nekretnine', async (req, res) => {
  const { nizNekretnina } = req.body;

  try {
    // Load JSON data
    let preferencije = await readJsonFile('preferencije');

    // Check format
    if (!preferencije || !Array.isArray(preferencije)) {
      console.error('Neispravan format podataka u preferencije.json.');
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Init object for search
    preferencije = preferencije.map((nekretnina) => {
      nekretnina.pretrage = nekretnina.pretrage || 0;
      return nekretnina;
    });

    // Update atribute pretraga
    nizNekretnina.forEach((id) => {
      const nekretnina = preferencije.find((item) => item.id === id);
      if (nekretnina) {
        nekretnina.pretrage += 1;
      }
    });

    // Save JSON file
    await saveJsonFile('preferencije', preferencije);

    res.status(200).json({});
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/nekretnina/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const nekretninaData = preferencije.find((item) => item.id === parseInt(id, 10));

    if (nekretninaData) {
      // Update clicks
      nekretninaData.klikovi = (nekretninaData.klikovi || 0) + 1;

      // Save JSON file
      await saveJsonFile('preferencije', preferencije);

      res.status(200).json({ success: true, message: 'Broj klikova ažuriran.' });
    } else {
      res.status(404).json({ error: 'Nekretnina nije pronađena.' });
    }
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/pretrage', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, pretrage: nekretninaData ? nekretninaData.pretrage : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/marketing/osvjezi/klikovi', async (req, res) => {
  const { nizNekretnina } = req.body || { nizNekretnina: [] };

  try {
    // Read JSON 
    const preferencije = await readJsonFile('preferencije');

    // Finding the needed objects based on id
    const promjene = nizNekretnina.map((id) => {
      const nekretninaData = preferencije.find((item) => item.id === id);
      return { id, klikovi: nekretninaData ? nekretninaData.klikovi : 0 };
    });

    res.status(200).json({ nizNekretnina: promjene });
  } catch (error) {
    console.error('Greška prilikom čitanja ili pisanja JSON datoteke:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/nekretnine/top5', async (req, res) => {
  const { Nekretnina } = require('./data/db');
  const lokacija = req.query.lokacija;

  if (!lokacija) {
      return res.status(400).json({ error: 'Lokacija nije specificirana.' });
  }

  try {
      const nekretnine = await db.Nekretnina.findAll({
          where: { lokacija },
          order: [['datum_objave', 'DESC']],
          limit: 5,
      });
      return res.status(200).json(nekretnine);
  } catch (error) {
      console.error('Greška prilikom obrade podataka:', error);
      return res.status(500).json({ error: 'Greška na serveru.' });
  }
});

app.get('/upiti/moji', async (req, res) => {
  if (!req.session.username) {
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  try {
      const korisnik = await db.Korisnik.findOne({
          where: { username: req.session.username },
      });

      if (!korisnik) {
          return res.status(404).json({ greska: 'Korisnik nije pronađen' });
      }

      const upiti = await db.Upit.findAll({
          where: { korisnik_id: korisnik.id },
          attributes: ['nekretnina_id', 'tekst'],
      });

      return res.status(200).json(upiti);
  } catch (error) {
      console.error('Greška prilikom obrade upita:', error);
      return res.status(500).json({ greska: 'Greška na serveru.' });
  }
});

app.get('/nekretnina/:id', async (req, res) => {
  const nekretnina_id = parseInt(req.params.id, 10);

  try {
      const nekretnina = await db.Nekretnina.findByPk(nekretnina_id);

      if (!nekretnina) {
          console.log(`Nekretnina sa ID ${nekretnina_id} nije pronađena.`);
          return res.status(404).json({ greska: 'Nekretnina nije pronađena' });
      }

      const upiti = await db.Upit.findAll({ where: { nekretnina_id } });
      const zahtjevi = await db.Zahtjev.findAll({
          where: { nekretnina_id },
          order: [['datumKreiranja', 'DESC']],
      });
      const ponude = await db.Ponuda.findAll({
          where: { nekretnina_id },
          order: [['datumKreiranja', 'DESC']],
      });

      res.status(200).json({
          nekretnina: nekretnina.toJSON(),
          upiti: upiti.map(u => u.toJSON()),
          zahtjevi: zahtjevi.map(z => z.toJSON()),
          ponude: ponude.map(p => p.toJSON()),
      });
  } catch (error) {
      console.error('Greška prilikom dohvaćanja podataka:', error);
      res.status(500).json({ greska: 'Greška na serveru.' });
  }
});

app.get('/next/upiti/nekretnina/:id', async (req, res) => { 
    const nekretnina_id = parseInt(req.params.id, 10);

    try {
        const upiti = await db.Upit.findAll({
            where: { nekretnina_id },
            order: [['datumKreiranja', 'DESC']],
        });

        if (upiti.length === 0) {
            return res.status(404).json([]);
        }

        return res.status(200).json(upiti);
    } catch (error) {
        console.error('Greška prilikom obrade upita:', error);
        return res.status(500).json({ greska: 'Greška na serveru.' });
    }
});

app.get('/nekretnina/:id/interesovanja', async (req, res) => {
  const nekretnina_id = parseInt(req.params.id, 10);

  if (isNaN(nekretnina_id)) {
      return res.status(400).json({ error: "Neispravan ID nekretnine" });
  }

  try {
      const ponude = await db.Ponuda.findAll({
          where: { nekretnina_id },
          include: [
              { model: db.Korisnik, as: 'korisnik', attributes: ['id', 'username', 'ime', 'prezime'] }
          ]
      });

      const upiti = await db.Upit.findAll({
          where: { nekretnina_id },
          include: [
              { model: db.Korisnik, as: 'korisnik', attributes: ['id', 'username', 'ime', 'prezime'] }
          ]
      });

      const zahtjevi = await db.Zahtjev.findAll({
          where: { nekretnina_id },
          include: [
              { model: db.Korisnik, as: 'korisnik', attributes: ['id', 'username', 'ime', 'prezime'] }
          ]
      });

      const user = req.session.username ? await db.Korisnik.findOne({ where: { username: req.session.username } }) : null;

      const interesovanja = [
          ...ponude.map(ponuda => ({
              ...ponuda.dataValues,
              tip: 'ponuda'
          })),
          ...upiti.map(upit => ({
              ...upit.dataValues,
              tip: 'upit'
          })),
          ...zahtjevi.map(zahtjev => ({
              ...zahtjev.dataValues,
              tip: 'zahtjev'
          }))
      ];

      // Filtriraj rezultate (ako je korisnik prijavljen i nije admin, izostavi cijenu iz ponuda)
      const filteredInteresovanja = interesovanja.map(interesovanje => {
          if (user && (user.role === 'admin' || user.id === interesovanje.korisnik_id)) {
              return interesovanje;
          } else {
              const { cijena, ...interesovanjeBezCijene } = interesovanje;
              return interesovanjeBezCijene;
          }
      });

      if (filteredInteresovanja.length === 0) {
          return res.status(404).json({ message: 'Nema interesovanja za ovu nekretninu' });
      }

      res.status(200).json(filteredInteresovanja);
  } catch (error) {
      console.error("Greška pri dobavljanju interesovanja:", error);
      res.status(500).json({ error: "Greška na serveru" });
  }
});

app.post('/nekretnina/:id/ponuda', async (req, res) => {
    const nekretnina_id = parseInt(req.params.id, 10);
    const { tekst, ponudaCijene, datumPonude, vezanePonude, odbijenaPonuda } = req.body;

    if (isNaN(nekretnina_id)) {
        return res.status(400).json({ error: "Neispravan ID nekretnine" });
    }

    if (!tekst || !ponudaCijene || !datumPonude || typeof odbijenaPonuda !== 'boolean') {
        return res.status(400).json({ error: "Nedostaju obavezni podaci." });
    }

    try {
        if (!req.session.username) {
            return res.status(401).json({ error: "Neautorizovan pristup" });
        }

        const korisnik = await db.Korisnik.findOne({ where: { username: req.session.username } });

        if (!korisnik) {
            return res.status(404).json({ error: "Korisnik nije pronađen" });
        }

        const nekretnina = await db.Nekretnina.findByPk(nekretnina_id);
        if (!nekretnina) {
            return res.status(404).json({ error: "Nekretnina nije pronađena" });
        }

        const ponude = await db.Ponuda.findAll({ where: { nekretnina_id, odbijenaPonuda: false } });

        if (ponude.some(ponuda => ponuda.odbijenaPonuda)) {
            return res.status(400).json({ error: "Ne mogu se dodavati nove ponude, prethodna ponuda je odbijena." });
        }

        if (vezanePonude ) {
            const vezanaPonuda = await db.Ponuda.findByPk(vezanePonude );
            if (!vezanaPonuda) {
                return res.status(404).json({ error: "Vezana ponuda nije pronađena" });
            }

            if (korisnik.role !== 'admin' && vezanaPonuda.korisnik_id !== korisnik.id && !vezanaPonuda.odbijenaPonuda) {
                return res.status(403).json({ error: "Nemate pravo da odgovorite na ovu ponudu" });
            }
        }

        const novaPonuda = await db.Ponuda.create({
            tekst,
            ponudaCijene,
            datumPonude,
            vezanePonude,
            odbijenaPonuda,
            korisnik_id: korisnik.id,
            nekretnina_id
        });

        res.status(201).json(novaPonuda);
    } catch (error) {
        console.error("Greška pri dodavanju ponude:", error);
        res.status(500).json({ error: "Greška na serveru" });
    }
});

app.post('/nekretnina/:id/zahtjev', async (req, res) => {
    const nekretnina_id = parseInt(req.params.id, 10);
    const { tekst, trazeniDatum } = req.body;

    if (isNaN(nekretnina_id)) {
        return res.status(400).json({ error: "Neispravan ID nekretnine" });
    }

    if (!tekst || !trazeniDatum) {
        return res.status(400).json({ error: "Nedostaju obavezni podaci." });
    }

    const now = moment();
    if (moment(trazeniDatum).isBefore(now, 'day')) {
        return res.status(400).json({ error: "Traženi datum ne može biti u prošlosti." });
    }

    try {
        const nekretnina = await db.Nekretnina.findByPk(nekretnina_id);
        if (!nekretnina) {
            return res.status(404).json({ error: "Nekretnina nije pronađena" });
        }

        const noviZahtjev = await db.Zahtjev.create({
            tekst,
            trazeniDatum,
            nekretnina_id,
            korisnik_id: req.session.username
        });

        res.status(201).json(noviZahtjev);
    } catch (error) {
        console.error("Greška pri dodavanju zahtjeva:", error);
        res.status(500).json({ error: "Greška na serveru" });
    }
});

app.put('/nekretnina/:id/zahtjev/:zid', async (req, res) => {
    const nekretnina_id = parseInt(req.params.id, 10);
    const zahtjevId = parseInt(req.params.zid, 10);
    const { odobren, addToTekst } = req.body;

    if (!req.session && req.session.role === 'admin') {
        return res.status(403).json({ error: "Samo admin može odgovarati na zahtjeve." });
    }

    if (isNaN(nekretnina_id) || isNaN(zahtjevId)) {
        return res.status(400).json({ error: "Neispravan ID nekretnine ili zahtjeva." });
    }

    try {
        const zahtjev = await db.Zahtjev.findOne({ where: { id: zahtjevId, nekretnina_id } });

        if (!zahtjev) {
            return res.status(404).json({ error: "Zahtjev nije pronađen." });
        }

        if (odobren === false && !addToTekst) {
            return res.status(400).json({ error: "Za zahtjev koji nije odobren, mora biti poslan addToTekst." });
        }

        const odgovorTekst = addToTekst ? `ODGOVOR ADMINA: ${addToTekst}` : '';
        const updatedZahtjev = await zahtjev.update({
            odobren,
            tekst: `${zahtjev.tekst} ${odgovorTekst}`,
        });

        res.status(200).json(updatedZahtjev);
    } catch (error) {
        console.error("Greška pri odgovaranju na zahtjev:", error);
        res.status(500).json({ error: "Greška na serveru" });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});