const Sequelize = require("sequelize");


module.exports = (models) => {
  const { Korisnik, Nekretnina, Upit, Zahtjev, Ponuda } = models;


  Korisnik.hasMany(Upit);
  Upit.belongsTo(Korisnik);

  Nekretnina.hasMany(Upit);
  Upit.belongsTo(Nekretnina);

  Korisnik.hasMany(Zahtjev);
  Zahtjev.belongsTo(Korisnik);

  Nekretnina.hasMany(Zahtjev);
  Zahtjev.belongsTo(Nekretnina);

  Korisnik.hasMany(Ponuda);
  Ponuda.belongsTo(Korisnik);

  Nekretnina.hasMany(Ponuda);
  Ponuda.belongsTo(Nekretnina);

  Ponuda.hasMany(Ponuda, { as: 'vezanePonude', foreignKey: 'vezanaPonudaId' });
  Ponuda.belongsTo(Ponuda, { as: "glavnaPonuda", foreignKey: "vezanaPonudaId"});

};