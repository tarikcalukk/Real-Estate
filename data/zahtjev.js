const Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
   const Zahtjev = sequelize.define("zahtjev", {
       id: {
           type: Sequelize.INTEGER,
           primaryKey: true,
           autoIncrement: true
       },
       tekst: {
           type: Sequelize.TEXT,
           allowNull: false
       },
       trazeniDatum: {
           type: Sequelize.DATE,
           allowNull: true
       },
       odobren: {
           type: Sequelize.BOOLEAN,
           defaultValue: false
       },
       datumKreiranja: {
           type: Sequelize.DATE,
           defaultValue: Sequelize.NOW
       },
       korisnik_id: {
           type: Sequelize.INTEGER,
           allowNull: false,
           references: {
               model: 'korisnici',
               key: 'id'
           }
       },
       nekretnina_id: {
           type: Sequelize.INTEGER,
           allowNull: false,
           references: {
               model: 'nekretnine',
               key: 'id'
           }
       }
   }, {
       timestamps: false
   });

   return Zahtjev;
};