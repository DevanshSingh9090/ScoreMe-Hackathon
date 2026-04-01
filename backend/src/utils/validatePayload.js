function validatePayload(payload, schema) {
  const missingFields = [];

  for (const field of schema.required || []) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
      missingFields.push(field);
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

module.exports = validatePayload;