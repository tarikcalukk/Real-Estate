const Sequelize = require("sequelize");

module.exports = function(sequelize,DataTypes){
    const Korisnik = sequelize.define("korisnik", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ime: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        prezime: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        password: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        admin: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        datumRegistracije: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    });
    return Korisnik;
};