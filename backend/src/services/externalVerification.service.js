async function simulateExternalDependency() {
  const random = Math.random();

  if (random < 0.2) {
    throw new Error("External verification service unavailable");
  }

  await new Promise((resolve) => setTimeout(resolve, 300));

  return {
    verified: true,
    source: "documentVerificationService"
  };
}

module.exports = simulateExternalDependency;