const Sequelize = require("sequelize");

module.exports = function(sequelize, DataTypes) {
    const Ponuda = sequelize.define("ponuda", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        tekst: {
            type: Sequelize.TEXT,
            allowNull: true
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
        },
        cijenaPonude: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                min: 0
            }
        },
        datumPonude: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        odbijenaPonuda: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        vezanaPonudaId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'ponude',
                key: 'id'
            }
        }
    }, {
        timestamps: false
    });

    return Ponuda;
};