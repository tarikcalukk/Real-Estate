const Sequelize = require("sequelize");


module.exports = ({ Korisnik, Nekretnina, Upit, Zahtjev, Ponuda }) => {
  Upit.belongsTo(Nekretnina, { foreignKey: 'nekretnina_id' });
  Nekretnina.hasMany(Upit, { foreignKey: 'nekretnina_id' });

  Upit.belongsTo(Korisnik, { foreignKey: 'korisnik_id' });
  Korisnik.hasMany(Upit, { foreignKey: 'korisnik_id' });

  Zahtjev.belongsTo(Nekretnina, { foreignKey: 'nekretnina_id' });
  Nekretnina.hasMany(Zahtjev, { foreignKey: 'nekretnina_id' });

  Zahtjev.belongsTo(Korisnik, { foreignKey: 'korisnik_id' });
  Korisnik.hasMany(Zahtjev, { foreignKey: 'korisnik_id' });

  Ponuda.belongsTo(Nekretnina, { foreignKey: 'nekretnina_id' });
  Nekretnina.hasMany(Ponuda, { foreignKey: 'nekretnina_id' });

  Ponuda.belongsTo(Korisnik, { foreignKey: 'korisnik_id' });
  Korisnik.hasMany(Ponuda, { foreignKey: 'korisnik_id' });

  Ponuda.belongsTo(Ponuda, { foreignKey: 'vezanaPonudaId' });
  Ponuda.hasMany(Ponuda, { foreignKey: 'vezanaPonudaId' });
};