const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./src/routes/auth.routes");
const courseRoutes = require("./src/routes/courses.routes");
require("dotenv").config();

const url = process.env.MONGODB_URI;

const app = express();

app.use(cors());

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);

mongoose
  .connect(url)
  .then(() => {
    console.log("Connected to database ");
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });
