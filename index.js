const express = require("express");
const app = express();
const dbConnect = require("./config/database");

dbConnect();

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
