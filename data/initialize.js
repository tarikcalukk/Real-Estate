const db = require('./db.js')

async function initializeDatabase() {
    const admin = await db.korisnik.findOne({ where: { username: 'admin' } });
    const user = await db.korisnik.findOne({ where: { username: 'user' } });
  
    if (!admin) {
      await db.korisnik.create({
        ime: 'Admin',
        prezime: 'Admin',
        username: 'admin',
        password: await bcrypt.hash('admin', 10),
        role: 'admin',
      });
    }
  
    if (!user) {
        await db.korisnik.create({
            ime: 'User',
            prezime: 'User',
            username: 'user',
            password: await bcrypt.hash('user', 10),
            role: 'user',
        });
    }
}
initializeDatabase();  