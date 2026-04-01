const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
require("dotenv").config();

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.connection.close();
});

describe("Workflow API", () => {
  const validPayload = {
    requestId: "REQ-1001",
    applicantName: "Aryan",
    age: 25,
    income: 50000,
    creditScore: 750,
    documentsComplete: true
  };

  it("should process a valid request", async () => {
    const res = await request(app)
      .post("/api/workflows/applicationApproval/submit")
      .set("idempotency-key", "idem-001")
      .send(validPayload);

    expect([201, 200]).toContain(res.statusCode);
    expect(res.body.data).toBeDefined();
  });

  it("should reject invalid payload", async () => {
    const invalidPayload = { applicantName: "Aryan" };

    const res = await request(app)
      .post("/api/workflows/applicationApproval/submit")
      .set("idempotency-key", "idem-002")
      .send(invalidPayload);

    expect(res.statusCode).toBe(500);
  });

  it("should support idempotency for duplicate requests", async () => {
    await request(app)
      .post("/api/workflows/applicationApproval/submit")
      .set("idempotency-key", "idem-003")
      .send(validPayload);

    const res = await request(app)
      .post("/api/workflows/applicationApproval/submit")
      .set("idempotency-key", "idem-003")
      .send(validPayload);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Duplicate request/i);
  });
});