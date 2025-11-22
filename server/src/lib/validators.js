function isIsoDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function collectErrors(rules) {
  return rules.filter((rule) => !rule.check).map((rule) => rule.message);
}

function validateAnalyzePayload(body = {}) {
  const errors = collectErrors([
    {
      check: typeof body.userId === 'string' && body.userId.trim().length > 0,
      message: 'userId is required'
    },
    {
      check: typeof body.text === 'string' && body.text.trim().length >= 5,
      message: 'text must be at least 5 characters'
    },
    {
      check: isIsoDate(body.timestamp),
      message: 'timestamp must be an ISO-8601 string'
    }
  ]);

  return { valid: errors.length === 0, errors };
}

function validateProfilePayload(body = {}) {
  const errors = collectErrors([
    {
      check: typeof body.userId === 'string' && body.userId.trim().length > 0,
      message: 'userId is required'
    },
    {
      check: typeof body.name === 'string' && body.name.trim().length > 1,
      message: 'name is required'
    },
    {
      check: typeof body.timezone === 'string' && body.timezone.trim().length > 2,
      message: 'timezone is required'
    },
    {
      check: body.preferences === undefined || typeof body.preferences === 'object',
      message: 'preferences must be an object if provided'
    }
  ]);

  return { valid: errors.length === 0, errors };
}

function validateConsentPayload(body = {}) {
  const errors = collectErrors([
    {
      check: typeof body.userId === 'string' && body.userId.trim().length > 0,
      message: 'userId is required'
    },
    {
      check: typeof body.consentGiven === 'boolean',
      message: 'consentGiven must be a boolean'
    },
    {
      check: isIsoDate(body.timestamp),
      message: 'timestamp must be an ISO-8601 string'
    }
  ]);

  return { valid: errors.length === 0, errors };
}

module.exports = {
  validateAnalyzePayload,
  validateProfilePayload,
  validateConsentPayload
};
