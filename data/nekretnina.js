const Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
    return sequelize.define("nekretnina", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tip_nekretnine: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        naziv: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        kvadratura: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        cijena: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        tip_grijanja: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        lokacija: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        godina_izgradnje:Sequelize.INTEGER,
        datum_objave: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        opis: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        korisnik_id: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'Korisnik',
                key: 'id'
            }
        }
    }, 
    {
        freezeTableName: true
    });
};