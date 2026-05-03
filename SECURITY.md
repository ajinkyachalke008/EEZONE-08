# 🔒 Security Policy — EE ZONE

## Supported Versions

| Version | Status      | Security Updates |
|---------|-------------|-----------------|
| Latest (main branch) | ✅ Active | Yes |
| Older commits | ⚠️ Unsupported | No |

Always use the latest commit on the `main` branch for the most up-to-date security patches.

---

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub Issues.**

If you discover a security vulnerability in EE ZONE, report it privately to:

**Ajinkya Chalke**
📧 [ajinkyachalke008@gmail.com](mailto:ajinkyachalke008@gmail.com)

Include in your report:
- A clear description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

You will receive a response within **48 hours**. If the vulnerability is confirmed, a fix will be prioritized and you will be credited in the release notes (unless you prefer anonymity).

---

## Security Scope

The following are **in scope** for security reports:

| Area | Examples |
|------|---------|
| **Authentication** | Session hijacking, auth bypass via Better Auth |
| **API Routes** | Unauthorized data access, injection vulnerabilities |
| **Database** | SQL injection via Drizzle ORM misuse, data exposure |
| **Environment Variables** | Accidental secret exposure in client-side bundles |
| **Third-Party Integrations** | OpenRouter key exposure, Turso token leakage |
| **XSS / CSRF** | Cross-site scripting in user-generated content |

The following are **out of scope**:
- Issues in third-party libraries (report to them directly)
- Social engineering attacks
- Theoretical vulnerabilities without proof of concept
- Issues in development/test environments

---

## Security Best Practices for Deployers

If you fork and deploy EE ZONE, follow these practices:

1. **Never commit `.env` files** — use Vercel/host environment variable settings
2. **Rotate `BETTER_AUTH_SECRET`** — use a strong 32+ character random string
3. **Restrict Turso token permissions** — use read-only tokens where possible
4. **Rotate OpenRouter API keys** regularly
5. **Enable Vercel's built-in DDoS protection** on your deployment
6. **Review Drizzle schema migrations** before running `drizzle-kit push` in production

---

## Known Security Considerations

| Area | Note |
|------|------|
| **Engineering Calculators** | Outputs are educational only — not for safety-critical use |
| **AI Responses** | AI-generated code and circuit designs should be reviewed before implementation |
| **draw.io Integration** | The embedded CAD tool runs client-side — no server-side diagram execution |

---

*EE ZONE — Security is as important as the engineering that powers it ⚡*
*Maintainer: Ajinkya Chalke — ajinkyachalke008@gmail.com*
