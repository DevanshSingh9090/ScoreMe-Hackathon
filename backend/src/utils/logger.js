const AuditLog = require("../models/AuditLog");

async function logAudit(requestRef, workflowName, action, details = {}) {
  await AuditLog.create({
    requestRef,
    workflowName,
    action,
    details
  });
}

module.exports = logAudit;