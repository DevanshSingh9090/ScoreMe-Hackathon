const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    requestRef: { type: mongoose.Schema.Types.ObjectId, ref: "WorkflowRequest" },
    workflowName: String,
    action: String,
    details: Object
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);