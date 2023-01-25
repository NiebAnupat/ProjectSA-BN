const express = require("express");
const cors = require("cors");
require("dotenv").config();
global.__basedir = __dirname;

const employeeRouter = require("./routes/employeeRouter.js");
const workTimeRouter = require("./routes/workTimeRouter.js");
const leaveWorkRouter = require("./routes/leaveWorkRouter.js");
const paymentRouter = require("./routes/paymentRouter.js");
const authRouter = require("./routes/authRouter.js");

const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors());

// app.use("/", (req, res) => {
//   res.json({ message: "Welcome to the application." });
// });
app.use("/employee", employeeRouter);
app.use("/workTime", workTimeRouter);
app.use("/leaveWork", leaveWorkRouter);
app.use("/payment", paymentRouter);
app.use("/auth", authRouter);

app.use(express.static("public"));

app.get("/Logo.png", (req, res) => {
  res.sendFile("views/Logo.png", { root: __dirname });
});

// app.listen(port, () => {
//   console.log("Server is running...");
//   console.log(`Listening on port ${port}`);
// });

module.exports = app;
