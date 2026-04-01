const express = require("express");
const cors = require("cors");
const workflowRoutes = require("./routes/workflow.routes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Decision Platform API running" });
});

app.use("/api/workflows", workflowRoutes);

module.exports = app;