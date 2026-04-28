// bible-evidence — server-side Gemini proxy.
//
// The client used to embed the API key directly in the JS bundle
// via VITE_GEMINI_API_KEYS, which meant the key shipped to every
// visitor's browser. Replaced with this Netlify Function so the
// key stays server-side; the client just sends the request body
// it would have sent to Gemini and receives the answer back.
//
// Endpoint: /api/aiSearch (also exposed at /.netlify/functions/aiSearch)
//
// Required Netlify env var: GEMINI_API_KEYS (comma-separated for
// round-robin) OR GEMINI_API_KEY (single).
// Optional: GEMINI_MODEL — default 'gemini-2.5-flash'
//           GEMINI_BASE_URL — default https://generativelanguage…
//
// Body matches what the client used to POST to Gemini directly:
//   { contents, systemInstruction, generationConfig }
// Response is the Gemini response verbatim — same shape the client
// already knows how to parse.

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const BASE_URL = (
	process.env.GEMINI_BASE_URL ||
	'https://generativelanguage.googleapis.com/v1beta'
).replace(/\/$/, '');

let _keyIndex = 0;
function getKeys() {
	const raw =
		process.env.GEMINI_API_KEYS ||
		process.env.GEMINI_API_KEY ||
		'';
	return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function nextKey(keys) {
	if (keys.length === 0) return null;
	const k = keys[_keyIndex % keys.length];
	_keyIndex++;
	return k;
}

export default async (req) => {
	const cors = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Content-Type': 'application/json',
	};
	if (req.method === 'OPTIONS') {
		return new Response('', { status: 204, headers: cors });
	}
	if (req.method !== 'POST') {
		return new Response(JSON.stringify({ error: 'POST only' }),
			{ status: 405, headers: cors });
	}

	const keys = getKeys();
	if (keys.length === 0) {
		return new Response(JSON.stringify({
			error: { message: 'AI search is not configured. Set GEMINI_API_KEYS in the Netlify dashboard.' },
		}), { status: 503, headers: cors });
	}

	let body;
	try {
		body = await req.json();
	} catch (_) {
		return new Response(JSON.stringify({ error: 'invalid JSON body' }),
			{ status: 400, headers: cors });
	}

	// Try up to N keys on rate-limit / quota errors. Same retry policy
	// the old client-side code had.
	let lastError = 'unknown error';
	for (let attempt = 0; attempt < keys.length; attempt++) {
		const k = nextKey(keys);
		const url = `${BASE_URL}/models/${MODEL}:generateContent?key=${k}`;
		try {
			const resp = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
				signal: AbortSignal.timeout(20_000),
			});
			if (resp.ok) {
				const json = await resp.json();
				return new Response(JSON.stringify(json),
					{ status: 200, headers: cors });
			}
			const errTxt = await resp.text().catch(() => '');
			lastError = `${resp.status} ${errTxt.slice(0, 200)}`;
			// Try the next key on rate-limit / quota.
			if (resp.status === 429 || resp.status === 403) continue;
			// Other 4xx / 5xx — surface immediately.
			return new Response(JSON.stringify({
				error: { message: lastError, status: resp.status },
			}), { status: resp.status, headers: cors });
		} catch (e) {
			lastError = String(e?.message || e);
		}
	}

	return new Response(JSON.stringify({
		error: { message: `All keys exhausted. Last error: ${lastError}` },
	}), { status: 502, headers: cors });
};

export const config = { path: '/api/aiSearch' };
