const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    state: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const workflowRequestSchema = new mongoose.Schema(
  {
    workflowName: { type: String, required: true },
    idempotencyKey: { type: String, required: true, unique: true },
    payload: { type: Object, required: true },
    status: {
      type: String,
      enum: ["received", "processing", "approved", "rejected", "manual_review", "retry_pending", "failed"],
      default: "received"
    },
    decision: { type: String, default: null },
    explanation: { type: Array, default: [] },
    retryCount: { type: Number, default: 0 },
    history: [historySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkflowRequest", workflowRequestSchema);