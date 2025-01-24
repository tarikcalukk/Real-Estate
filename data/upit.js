const Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
   const Upit = sequelize.define("upit", {
       id: {
           type: Sequelize.INTEGER,
           primaryKey: true,
           autoIncrement: true
       },
       tekst: {
           type: Sequelize.TEXT,
           allowNull: false
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

   return Upit;
};