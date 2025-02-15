const Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
    return sequelize.define("upit", {
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
                model: 'Korisnik',
                key: 'id'
            }
       },
        nekretnina_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Nekretnina',
                key: 'id'
            }
       }
   }, 
   {
        freezeTableName: true
    });
};