const express = require("express");
const router = express.Router();
const {
  submitWorkflow,
  getRequestById,
  getAuditLogs
} = require("../controllers/workflow.controller");

router.post("/:workflowName/submit", submitWorkflow);
router.get("/request/:id", getRequestById);
router.get("/request/:id/audit", getAuditLogs);

module.exports = router;