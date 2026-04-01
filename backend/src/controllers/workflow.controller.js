const processWorkflow = require("../services/workflowEngine");
const WorkflowRequest = require("../models/WorkflowRequest");
const AuditLog = require("../models/AuditLog");

exports.submitWorkflow = async (req, res) => {
  try {
    const { workflowName } = req.params;
    const idempotencyKey = req.headers["idempotency-key"];

    if (!idempotencyKey) {
      return res.status(400).json({ message: "Missing idempotency-key header" });
    }

    const result = await processWorkflow(workflowName, req.body, idempotencyKey);

    if (result.duplicate) {
      return res.status(200).json({
        message: "Duplicate request detected, returning existing result",
        data: result.data
      });
    }

    return res.status(201).json({
      message: "Workflow processed",
      error: result.error || null,
      data: result.data
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const request = await WorkflowRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ requestRef: req.params.id }).sort({ createdAt: 1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};