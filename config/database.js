const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = () => {
  const databaseUrl = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
  );

  mongoose
    .connect(databaseUrl)
    .then(() => {
      console.log("DB connection successful !");
    })
    .catch((err) => {
      console.log("DB connection failed !");
      console.log(err);
      process.exit(1);
    });
};

module.exports = dbConnect;
