const express = require('express');
const session = require("express-session");
const path = require('path');
const fs = require('fs').promises; // Using asynchronus API for file read and write
const bcrypt = require('bcrypt');
const rateLimit = {};

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
  const jsonObj = req.body;
  const currentTime = Date.now();

  try {
    if (!rateLimit[jsonObj.username]) {
      rateLimit[jsonObj.username] = { attempts: 0, blockedUntil: 0 };
    }

    const userRateLimit = rateLimit[jsonObj.username];

    if (currentTime < userRateLimit.blockedUntil) {
      const logEntry = `[${new Date().toISOString()}] - username: "${jsonObj.username}" - status: "neuspješno"\n`;
      await fs.appendFile(LOG_FILE, logEntry);
      return res.status(429).json({ greska: "Previse neuspjesnih pokusaja. Pokusajte ponovo za 1 minutu." });
    }

    const data = await fs.readFile(path.join(__dirname, 'data', 'korisnici.json'), 'utf-8');
    const korisnici = JSON.parse(data);
    let found = false;
    let loginStatus = "neuspješno";

    for (const korisnik of korisnici) {
      if (korisnik.username == jsonObj.username) {
        const isPasswordMatched = await bcrypt.compare(jsonObj.password, korisnik.password);

        if (isPasswordMatched) {
          req.session.username = korisnik.username;
          found = true;
          loginStatus = "uspješno";
          userRateLimit.attempts = 0;
          break;
        }
      }
    }

    const logEntry = `[${new Date().toISOString()}] - username: "${jsonObj.username}" - status: "${loginStatus}"\n`;
    await fs.appendFile(LOG_FILE, logEntry);

    if (found) {
      return res.json({ poruka: 'Uspješna prijava' });
    } else {
      userRateLimit.attempts += 1;
      if (userRateLimit.attempts >= MAX_ATTEMPTS) {
        userRateLimit.blockedUntil = currentTime + BLOCK_TIME;
        return res.status(429).json({ greska: "Previse neuspjesnih pokusaja. Pokusajte ponovo za 1 minutu." });
      }
      return res.json({ poruka: 'Neuspješna prijava' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
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
from the .json file.
*/
app.get('/korisnik', async (req, res) => {
  // Check if the username is present in the session
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // User is logged in, fetch additional user data
  const username = req.session.username;

  try {
    // Read user data from the JSON file
    const users = await readJsonFile('korisnici');

    // Find the user by username
    const user = users.find((u) => u.username === username);

    if (!user) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Send user data
    const userData = {
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      username: user.username,
      password: user.password // Should exclude the password for security reasons
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Allows logged user to make a request for a property
*/
app.post('/upit', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Get data from the request body
  const { nekretnina_id, tekst_upita } = req.body;

  try {
    // Read user data from the JSON file
    const users = await readJsonFile('korisnici');

    // Read properties data from the JSON file
    const nekretnine = await readJsonFile('nekretnine');

    // Find the user by username
    const loggedInUser = users.find((user) => user.username === req.session.username);

    // Check if the property with nekretnina_id exists
    const nekretnina = nekretnine.find((property) => property.id === nekretnina_id);

    if (!nekretnina) {
      // Property not found
      return res.status(400).json({ greska: `Nekretnina sa id-em ${nekretnina_id} ne postoji` });
    }

    // Count how many queries the user has already made for the same property
    const userQueriesForProperty = nekretnina.upiti.filter(upit => upit.korisnik_id === loggedInUser.id).length;

    // Check if the user has made more than 3 queries for the same property
    if (userQueriesForProperty >= 3) {
      return res.status(429).json({ greska: 'Previse upita za istu nekretninu.' });
    }

    // Add a new query to the property's queries array
    nekretnina.upiti.push({
      korisnik_id: loggedInUser.id,
      tekst_upita: tekst_upita
    });

    // Save the updated properties data back to the JSON file
    await saveJsonFile('nekretnine', nekretnine);

    res.status(200).json({ poruka: 'Upit je uspješno dodan' });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Updates any user field
*/
app.put('/korisnik', async (req, res) => {
  // Check if the user is authenticated
  if (!req.session.username) {
    // User is not logged in
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  // Get data from the request body
  const { ime, prezime, username, password } = req.body;

  try {
    // Read user data from the JSON file
    const users = await readJsonFile('korisnici');

    // Find the user by username
    const loggedInUser = users.find((user) => user.username === req.session.username);

    if (!loggedInUser) {
      // User not found (should not happen if users are correctly managed)
      return res.status(401).json({ greska: 'Neautorizovan pristup' });
    }

    // Update user data with the provided values
    if (ime) loggedInUser.ime = ime;
    if (prezime) loggedInUser.prezime = prezime;
    if (username) loggedInUser.username = username;
    if (password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      loggedInUser.password = hashedPassword;
    }

    // Save the updated user data back to the JSON file
    await saveJsonFile('korisnici', users);
    res.status(200).json({ poruka: 'Podaci su uspješno ažurirani' });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
  }
});

/*
Returns all properties from the file.
*/
app.get('/nekretnine', async (req, res) => {
  try {
    const nekretnineData = await readJsonFile('nekretnine');
    res.json(nekretnineData);
  } catch (error) {
    console.error('Error fetching properties data:', error);
    res.status(500).json({ greska: 'Internal Server Error' });
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

app.get('/nekretnine/top5', async(req, res) => {
  const lokacija = req.query.lokacija;

  if (!lokacija) {
      return res.status(400).json({ error: 'Lokacija nije specificirana.' });
  }

  try {
    const nekretnine = await readJsonFile('nekretnine');

    const filteredNekretnine = nekretnine
      .filter(nekretnina => nekretnina.lokacija === lokacija)
      .sort((a, b) => new Date(b.datum_objave) - new Date(a.datum_objave))
      .slice(0, 5);

    return res.status(200).json(filteredNekretnine);
  } catch (error) {
    return res.status(500).json({ error: 'Greška prilikom obrade podataka.' });
  }
});

// Nova ruta za dobijanje svih upita za loginovanog korisnika
app.get('/upiti/moji', async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ greska: 'Neautorizovan pristup' });
  }

  try {
    const users = await readJsonFile('korisnici');
    const nekretnine = await readJsonFile('nekretnine');

    const loggedInUser = users.find(user => user.username === req.session.username);

    if (!loggedInUser) {
      return res.status(404).json({ greska: 'Korisnik nije pronađen' });
    }

    // Filtrirajte upite koje je poslao logovani korisnik
    const userQueries = nekretnine
      .flatMap(nekretnina => nekretnina.upiti)
      .filter(upit => upit.korisnik_id === loggedInUser.id)

    // Ako korisnik nema upite, vraćamo prazan niz
    if (userQueries.length === 0) {
      return res.status(404).json([]);
    }

    const result = userQueries.map(upit => {
      // Pronađi nekretninu kojoj upit pripada
      const nekretnina = nekretnine.find(n => n.upiti.some(u => u.korisnik_id === upit.korisnik_id && u.tekst_upita === upit.tekst_upita));
      return {
        id_nekretnine: nekretnina.id,
        tekst_upita: upit.tekst_upita
      };
    });

    return res.status(200).json(result);

  } catch (error) {
    console.error('Greška prilikom obrade upita:', error);
    return res.status(500).json({ greska: 'Greška na serveru' });
  }
});

// Nova ruta za vraćanje detalja o nekretnini
app.get('/nekretnina/:id', async (req, res) => {
  const nekretninaId = parseInt(req.params.id, 10);  // Preuzimamo id iz parametara URL-a

  try {
    const nekretnine = await readJsonFile('nekretnine');

    // Pronalazak nekretnine sa zadanim id-em
    const nekretnina = nekretnine.find(n => n.id === nekretninaId);

    if (!nekretnina) {
      return res.status(404).json({ greska: `Nekretnina sa id-em ${nekretninaId} nije pronađena` });
    }

    // Skraćujemo listu upita na poslednja 3
    const lastThreeQueries = nekretnina.upiti.slice(-3);

    // Vraćamo detalje o nekretnini, uključujući samo posljednja 3 upita
    return res.status(200).json({
      id: nekretnina.id,
      tip_nekretnine: nekretnina.tip_nekretnine,
      naziv: nekretnina.naziv,
      kvadratura: nekretnina.kvadratura,
      cijena: nekretnina.cijena,
      tip_grijanja: nekretnina.tip_grijanja,
      lokacija: nekretnina.lokacija,
      godina_izgradnje: nekretnina.godina_izgradnje,
      datum_objave: nekretnina.datum_objave,
      opis: nekretnina.opis,
      upiti: lastThreeQueries
    });

  } catch (error) {
    console.error('Greška prilikom obrade nekretnine:', error);
    return res.status(500).json({ greska: 'Greška na serveru' });
  }
});

// Nova ruta za vraćanje sljedećih 3 upita za nekretninu
app.get('/next/upiti/nekretnina/:id', async (req, res) => {
  const nekretninaId = parseInt(req.params.id, 10);
  const page = parseInt(req.query.page, 10);

  if (page < 1) {
    return res.status(400).json({ greska: 'Page mora biti >= 1' });
  }

  try {
    const nekretnine = await readJsonFile('nekretnine');

    const nekretnina = nekretnine.find(n => n.id === nekretninaId);

    if (!nekretnina) {
      return res.status(404).json({ greska: `Nekretnina sa id-em ${nekretninaId} nije pronađena` });
    }

    // Računanje početne pozicije za upite na osnovu stranice
    const startIndex = page * 3;
    const nextUpiti = nekretnina.upiti.slice(startIndex, startIndex + 3);  // Uzimamo sljedeća 3 upita

    if (nextUpiti.length === 0) {
      return res.status(404).json([]);
    }

    return res.status(200).json(nextUpiti);
    
  } catch (error) {
    console.error('Greška prilikom obrade upita:', error);
    return res.status(500).json({ greska: 'Greška na serveru' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
