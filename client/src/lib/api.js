const DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
};

async function fetchJSON(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: {
        ...DEFAULT_HEADERS,
        ...(options.headers || {})
      },
      ...options
    });
  } catch (networkError) {
    const error = new Error('Unable to reach the local API. Did you start `npm start` inside /server?');
    error.status = 503;
    error.cause = networkError;
    throw error;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(payload?.error || 'Request failed');
    error.status = response.status;
    error.details = payload;
    throw error;
  }

  return payload;
}

export async function getProfile(userId) {
  return fetchJSON(`/api/profile/${encodeURIComponent(userId)}`);
}

export async function saveProfile(data) {
  return fetchJSON('/api/profile', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function analyzeText(payload) {
  return fetchJSON('/api/analyze', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function recordConsent(data) {
  return fetchJSON('/api/consent', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function exportProfile(userId) {
  return fetchJSON(`/api/export/${encodeURIComponent(userId)}`);
}

export async function deleteProfile(userId) {
  return fetchJSON(`/api/profile/${encodeURIComponent(userId)}`, {
    method: 'DELETE'
  });
}
