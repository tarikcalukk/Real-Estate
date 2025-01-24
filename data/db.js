const Sequelize = require("sequelize");
const sequelize = new Sequelize("wt24","root","password",{host:"127.0.0.1",dialect:"mysql",logging:false});
const db={};

db.Sequelize = Sequelize;  
db.sequelize = sequelize;

//import modela
db.korisnik = require('./korisnik.js')(sequelize, Sequelize.DataTypes);
db.nekretnina = require('./nekretnina.js')(sequelize, Sequelize.DataTypes);
db.ponuda = require('./ponuda.js')(sequelize, Sequelize.DataTypes);
db.upit = require('./upit.js')(sequelize, Sequelize.DataTypes);
db.zahtjev = require('./zahtjev.js')(sequelize, Sequelize.DataTypes);


//relacije
db.korisnik.hasMany(db.upit);
db.upit.belongsTo(db.korisnik);

db.nekretnina.hasMany(db.upit);
db.upit.belongsTo(db.nekretnina);

db.korisnik.hasMany(db.zahtjev);
db.zahtjev.belongsTo(db.korisnik);

db.nekretnina.hasMany(db.zahtjev);
db.zahtjev.belongsTo(db.nekretnina);

db.korisnik.hasMany(db.ponuda);
db.ponuda.belongsTo(db.korisnik);

db.nekretnina.hasMany(db.ponuda);
db.ponuda.belongsTo(db.nekretnina);

db.ponuda.hasMany(db.ponuda, { 
    as: 'related_offers', 
    foreignKey: 'vezanaPonudaId' 
});

db.ponuda.belongsTo(db.ponuda, { 
    as: "main_offer", 
    foreignKey: "vezanaPonudaId"
});

module.exports=db;