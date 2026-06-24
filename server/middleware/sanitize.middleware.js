const DANGEROUS_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const HTML_TAG = /<\/?[^>]*>/g;

// Remove ASCII control characters (codes 0-31 and 127).
function stripControlChars(str) {
  let out = "";
  for (let i = 0; i < str.length; i += 1) {
    const code = str.charCodeAt(i);
    if (code <= 31 || code === 127) continue;
    out += str[i];
  }
  return out;
}

// Recursively trim strings, strip HTML tags + control chars, walk arrays/objects,
// and drop prototype-polluting keys. Neutralises stored-XSS in plain-text fields.
function sanitizeValue(value) {
  if (typeof value === "string") {
    return stripControlChars(value.replace(HTML_TAG, "")).trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (DANGEROUS_KEYS.has(key)) continue;
      clean[key] = sanitizeValue(val);
    }
    return clean;
  }

  return value;
}

// Sanitises req.body, req.query and req.params in place, before validation.
export function sanitizeRequest(req, _res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === "object") {
    // Mutate keys in place; req.query may be a non-reassignable getter.
    for (const key of Object.keys(req.query)) {
      req.query[key] = sanitizeValue(req.query[key]);
    }
  }
  if (req.params && typeof req.params === "object") {
    for (const key of Object.keys(req.params)) {
      req.params[key] = sanitizeValue(req.params[key]);
    }
  }
  next();
}
