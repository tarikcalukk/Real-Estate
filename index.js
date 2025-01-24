const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises; // Using asynchronus API for file read and write
const bcrypt = require('bcrypt');
const db = require('./data/db.js')

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

/*
Checks if the user exists and if the password is correct based on korisnici.json data. 
If the data is correct, the username is saved in the session and a success message is sent.
*/
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const korisnik = await db.korisnik.findOne({ where: { username } });
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
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Clear all information from the session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      res.status(500).json({ greska: 'Internal Server Error' });
    } else {
      res.status(200).json({ poruka: 'Uspješno ste se odjavili' });
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

  const username = req.session.username;

  try {
    const korisnik = await db.korisnik.findOne({ where: { username } });

    if (!korisnik) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen' });
    }

    // Vrati korisničke podatke, bez lozinke
    const userData = {
      id: korisnik.id,
      ime: korisnik.ime,
      prezime: korisnik.prezime,
      username: korisnik.username,
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error('Greška pri dohvatanju korisničkih podataka:', error);
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
    const korisnik = await db.korisnik.findOne({ where: { username: req.session.username } });
    const nekretnina = await db.nekretnina.findByPk(nekretnina_id);

    if (!nekretnina) {
      return res.status(404).json({ greska: 'Nekretnina ne postoji' });
    }

    await db.upit.create({
      korisnikId: korisnik.id,
      nekretninaId: nekretnina_id,
      tekst: tekst_upita,
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
  const currentUsername = req.session.username;

  try {
    // Pronađi trenutno prijavljenog korisnika u bazi
    const korisnik = await db.korisnik.findOne({ where: { username: currentUsername } });

    if (!korisnik) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen' });
    }

    if (ime) korisnik.ime = ime;
    if (prezime) korisnik.prezime = prezime;
    if (username) {
      korisnik.username = username;
      req.session.username = username;
    }
    if (password) {
      korisnik.password = await bcrypt.hash(password, 10);
    }

    await korisnik.save();

    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    console.error('Greška pri ažuriranju korisničkih podataka:', error);
    res.status(500).json({ greska: 'Greška na serveru' });
  }
});

/*
Returns all properties from the file.
*/
app.get('/nekretnine', async (req, res) => {
  try {
    const nekretnine = await db.nekretnina.findAll();
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
  const lokacija = req.query.lokacija;

  if (!lokacija) {
    return res.status(400).json({ error: 'Lokacija nije specificirana.' });
  }

  try {
    const query = `
      SELECT * FROM nekretnina
      WHERE lokacija = $1
      ORDER BY datum_objave DESC
      LIMIT 5;
    `;
    const { rows: nekretnine } = await pool.query(query, [lokacija]);
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
    const korisnikQuery = `SELECT id FROM korisnik WHERE username = $1;`;
    const { rows: korisnici } = await pool.query(korisnikQuery, [req.session.username]);

    if (korisnici.length === 0) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen' });
    }

    const korisnikId = korisnici[0].id;
    const upitiQuery = `
      SELECT u.nekretnina_id, u.tekst_upita
      FROM upit u
      WHERE u.korisnik_id = $1;
    `;
    const { rows: upiti } = await pool.query(upitiQuery, [korisnikId]);

    return res.status(200).json(upiti);
  } catch (error) {
    console.error('Greška prilikom obrade upita:', error);
    return res.status(500).json({ greska: 'Greška na serveru.' });
  }
});

app.get('/nekretnina/:id', async (req, res) => {
  const nekretninaId = parseInt(req.params.id, 10);

  try {
    const nekretninaQuery = `
      SELECT * FROM nekretnina WHERE id = $1;
    `;
    const { rows: nekretnine } = await pool.query(nekretninaQuery, [nekretninaId]);

    if (nekretnine.length === 0) {
      return res.status(404).json({ greska: `Nekretnina sa id-em ${nekretninaId} nije pronađena` });
    }

    const nekretnina = nekretnine[0];
    const upitiQuery = `
      SELECT * FROM upit WHERE nekretnina_id = $1 ORDER BY datum_upita DESC LIMIT 3;
    `;
    const { rows: upiti } = await pool.query(upitiQuery, [nekretninaId]);

    return res.status(200).json({ ...nekretnina, upiti });
  } catch (error) {
    console.error('Greška prilikom obrade nekretnine:', error);
    return res.status(500).json({ greska: 'Greška na serveru.' });
  }
});

app.get('/next/upiti/nekretnina/:id', async (req, res) => {
  const nekretninaId = parseInt(req.params.id, 10);
  const page = parseInt(req.query.page, 10);

  if (page < 1) {
    return res.status(400).json({ greska: 'Page mora biti >= 1' });
  }

  try {
    const limit = 3;
    const offset = (page - 1) * limit;

    const upitiQuery = `
      SELECT * FROM upit
      WHERE nekretnina_id = $1
      ORDER BY datum_upita DESC
      LIMIT $2 OFFSET $3;
    `;
    const { rows: upiti } = await pool.query(upitiQuery, [nekretninaId, limit, offset]);

    if (upiti.length === 0) {
      return res.status(404).json([]);
    }

    return res.status(200).json(upiti);
  } catch (error) {
    console.error('Greška prilikom obrade upita:', error);
    return res.status(500).json({ greska: 'Greška na serveru.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
