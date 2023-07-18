const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
 

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

 
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, { useNewUrlParser: true });

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("mongodb db connection established!!");
});

const cyclesRouter = require("./routes/cycles");

app.use("/cycles", cyclesRouter);

const adminsRouter = require("./routes/admins");

app.use("/admins", adminsRouter);

// const authRouter = require("./routes/auth");
// app.use("/auth", authRouter);

///---------deployment --------------------------

// __dirname = path.resolve();
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "/frontend/build")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
//   });
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running..");
//   });
// }
///---------deployment --------------------------

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
