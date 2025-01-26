const Sequelize = require("sequelize");

module.exports = function(sequelize,DataTypes){
    return sequelize.define("korisnik", {
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
        username: {
            type: Sequelize.STRING(50),
            allowNull: false
        },
        password: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        admin: {
            type: Sequelize.TINYINT(1),
            defaultValue: false
        }
    }, 
    {
        freezeTableName: true
    });
};