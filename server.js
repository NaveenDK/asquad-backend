const express = require("express");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const mongoose = require("mongoose");
const path = require("path");
const { logger } = require("./middleware/logger");
require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");
const { error } = require("console");

const app = express();
const port = process.env.PORT || 3000;

// app.use(cors());
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());

app.use("/", express.static(path.join(__dirname, "/public")));
app.use("/", require("./routes/root"));

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 not found" });
  } else {
    res.type("txt").send("404 not found");
  }
});

app.use(errorHandler);
// const uri = process.env.ATLAS_URI;
// mongoose.connect(uri, { useNewUrlParser: true });

// const connection = mongoose.connection;

// connection.once("open", () => {
//   console.log("mongodb db connection established!!");
// });

// const cyclesRouter = require("./routes/cycles");

// app.use("/cycles", cyclesRouter);

// const adminsRouter = require("./routes/admins");

// app.use("/admins", adminsRouter);

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
