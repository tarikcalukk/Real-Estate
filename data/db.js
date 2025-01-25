const Sequelize = require("sequelize");

const KorisnikModel = require("./korisnik");
const NekretninaModel = require("./nekretnina");
const UpitModel = require("./upit");
const ZahtjevModel = require("./zahtjev");
const PonudaModel = require("./ponuda");
const initializeUsers = require("./initialize");

const sequelize = new Sequelize("wt24", "root", "password", {
    host: "localhost",
    dialect: "mysql",
    logging: false,
});

const Korisnik = KorisnikModel(sequelize, Sequelize);
const Nekretnina = NekretninaModel(sequelize, Sequelize);
const Upit = UpitModel(sequelize, Sequelize);
const Zahtjev = ZahtjevModel(sequelize, Sequelize);
const Ponuda = PonudaModel(sequelize, Sequelize);

require("./veze")({ Korisnik, Nekretnina, Upit, Zahtjev, Ponuda });

sequelize
    .sync({ alter: true })
    .then(async () => {
        console.log("Baza je sinhronizovana.");
        await initializeUsers(Korisnik);
    })
    .catch((err) => {
        console.error("Greška prilikom sinhronizacije baze:", err);
    });

module.exports = {
    sequelize,
    Korisnik,
    Nekretnina,
    Upit,
    Zahtjev,
    Ponuda
};