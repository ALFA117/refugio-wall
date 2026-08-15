/** @type {import('next').NextConfig} */

// A pragmatic baseline, not a maximal-strictness CSP: 'unsafe-inline' on script-src is needed
// because Next.js injects inline hydration/bootstrap JSON scripts on every page, and a nonce-
// based CSP would need middleware wiring that's a much bigger, riskier change to verify without
// visual browser access in this environment. Still real protection — no third-party script
// origins are allowed at all, framing is blocked, and default-src is locked to same-origin.
//
// 'unsafe-eval' is added ONLY in dev — Next's Fast Refresh/HMR runtime evaluates module code
// via eval() in development, which a strict script-src blocks outright (caught live: dev mode
// threw "Evaluating a string as JavaScript violates ... script-src" on every page). The
// production bundle (what actually ships) doesn't use eval, so prod stays without it.
const isDev = process.env.NODE_ENV !== "production";
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
