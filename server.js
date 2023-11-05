const express = require("express");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const mongoose = require("mongoose");
const path = require("path");
const { logger } = require("./middleware/logger");
require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");
const { error } = require("console");
const connectDB = require("./config/dbConn");
const app = express();
const port = process.env.PORT || 3000;
const { logEvents } = require("./middleware/logger");
// app.use(cors());
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "/public")));
app.use("/", require("./routes/root"));
app.use("/users", require("./routes/userRoutes"));
app.use("/groups", require("./routes/groupRoutes"));
app.use("/cycles", require("./routes/cycleRoutes"));

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
connectDB();
mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
});
