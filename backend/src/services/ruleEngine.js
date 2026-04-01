function evaluateOperator(left, operator, right) {
  switch (operator) {
    case ">=": return left >= right;
    case "<=": return left <= right;
    case ">": return left > right;
    case "<": return left < right;
    case "===": return left === right;
    case "!==": return left !== right;
    default: return false;
  }
}

function runRules(payload, rules) {
  const trace = [];

  for (const rule of rules) {
    const fieldValue = payload[rule.field];
    const passed = evaluateOperator(fieldValue, rule.operator, rule.value);

    trace.push({
      ruleId: rule.id,
      field: rule.field,
      actualValue: fieldValue,
      operator: rule.operator,
      expectedValue: rule.value,
      passed,
      reason: passed ? "Rule passed" : rule.reason
    });

    if (!passed) {
      return { decision: rule.onFail, trace };
    }
  }

  return { decision: "approved", trace };
}

module.exports = runRules;