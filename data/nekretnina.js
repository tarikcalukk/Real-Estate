const Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
    const Nekretnina = sequelize.define("nekretnina", {
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
            allowNull: false,
            validate: {
                min: 0
            }
        },
        cijena: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        tip_grijanja: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        lokacija: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        godina_izgradnje: {
            type: Sequelize.INTEGER,
            validate: {
                min: 1800,
                max: new Date().getFullYear()
            }
        },
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
                model: 'korisnici',
                key: 'id'
            }
        }
    }, {
        timestamps: false
    });

    return Nekretnina;
};