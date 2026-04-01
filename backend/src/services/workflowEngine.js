const fs = require("fs");
const path = require("path");
const WorkflowRequest = require("../models/WorkflowRequest");
const validatePayload = require("../utils/validatePayload");
const runRules = require("./ruleEngine");
const simulateExternalDependency = require("./externalVerification.service");
const logAudit = require("../utils/logger");

async function processWorkflow(workflowName, payload, idempotencyKey) {
  const existing = await WorkflowRequest.findOne({ idempotencyKey });

  if (existing) {
    return { duplicate: true, data: existing };
  }

  const workflowPath = path.join(__dirname, "..", "config", "workflows", `${workflowName}.json`);
  if (!fs.existsSync(workflowPath)) {
    throw new Error("Workflow configuration not found");
  }

  const workflowConfig = JSON.parse(fs.readFileSync(workflowPath, "utf-8"));
  const validation = validatePayload(payload, workflowConfig.inputSchema);

  if (!validation.isValid) {
    throw new Error(`Invalid payload. Missing: ${validation.missingFields.join(", ")}`);
  }

  const requestDoc = await WorkflowRequest.create({
    workflowName,
    idempotencyKey,
    payload,
    status: "received",
    history: [{ state: "received", message: "Request received" }]
  });

  await logAudit(requestDoc._id, workflowName, "REQUEST_RECEIVED", { payload });

  try {
    requestDoc.status = "processing";
    requestDoc.history.push({ state: "processing", message: "Workflow processing started" });
    await requestDoc.save();

    await logAudit(requestDoc._id, workflowName, "PROCESSING_STARTED");

    if (workflowConfig.externalDependency?.enabled) {
      const externalResult = await simulateExternalDependency();
      await logAudit(requestDoc._id, workflowName, "EXTERNAL_DEPENDENCY_SUCCESS", externalResult);
    }

    const ruleResult = runRules(payload, workflowConfig.rules);

    requestDoc.decision = ruleResult.decision;
    requestDoc.explanation = ruleResult.trace;

    if (ruleResult.decision === "approved") {
      requestDoc.status = "approved";
      requestDoc.history.push({ state: "approved", message: "Application approved" });
    } else if (ruleResult.decision === "reject") {
      requestDoc.status = "rejected";
      requestDoc.history.push({ state: "rejected", message: "Application rejected" });
    } else if (ruleResult.decision === "manual_review") {
      requestDoc.status = "manual_review";
      requestDoc.history.push({ state: "manual_review", message: "Sent for manual review" });
    } else {
      requestDoc.status = "failed";
      requestDoc.history.push({ state: "failed", message: "Unknown decision state" });
    }

    await requestDoc.save();

    await logAudit(requestDoc._id, workflowName, "DECISION_COMPLETED", {
      decision: requestDoc.decision,
      trace: requestDoc.explanation
    });

    return { duplicate: false, data: requestDoc };
  } catch (error) {
    requestDoc.status = "retry_pending";
    requestDoc.retryCount += 1;
    requestDoc.history.push({
      state: "retry_pending",
      message: `Failure occurred: ${error.message}`
    });

    await requestDoc.save();

    await logAudit(requestDoc._id, workflowName, "PROCESSING_FAILED", { error: error.message });

    return { duplicate: false, data: requestDoc, error: error.message };
  }
}

module.exports = processWorkflow;