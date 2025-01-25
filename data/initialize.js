module.exports = async (Korisnik) => {
  try {
    await Korisnik.findOrCreate({
      where: { username: "admin" },
      defaults: {
          ime: "Admin",
          prezime: "Admin",
          username: "admin",
          password: "admin",
          admin: true,
      },
    });

    await Korisnik.findOrCreate({
      where: { username: "user" },
      defaults: {
          ime: "User",
          prezime: "User",
          username: "user",
          password: "user",
          admin: false,
      },
    });
  } catch (error) {
    console.error("Greška prilikom inicijalizacije korisnika:", error);
  }
};