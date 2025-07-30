# Security Policy

## Supported Versions

We actively support the following versions of the Luminari Wilderness Editor with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| 0.9.x   | :white_check_mark: |
| 0.8.x   | :x:                |
| < 0.8   | :x:                |

## Reporting a Vulnerability

We take the security of the Luminari Wilderness Editor seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: **security@luminari.com**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include

Please include the following information in your report:

- **Type of issue** (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- **Full paths of source file(s)** related to the manifestation of the issue
- **The location of the affected source code** (tag/branch/commit or direct URL)
- **Any special configuration** required to reproduce the issue
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

### Preferred Languages

We prefer all communications to be in English.

## Security Response Process

1. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.

2. **Investigation**: Our security team will investigate the issue and determine its validity and severity.

3. **Response Timeline**: 
   - **Critical vulnerabilities**: Patch within 7 days
   - **High severity**: Patch within 14 days
   - **Medium severity**: Patch within 30 days
   - **Low severity**: Patch within 90 days

4. **Disclosure**: We will work with you to determine an appropriate disclosure timeline that protects users while giving us time to develop and deploy a fix.

5. **Credit**: We will credit you in our security advisory (unless you prefer to remain anonymous).

## Security Best Practices

### For Users

- **Keep Updated**: Always use the latest version of the application
- **Secure Authentication**: Use strong, unique passwords and enable 2FA when available
- **HTTPS Only**: Always access the application over HTTPS
- **Browser Security**: Keep your browser updated and use security extensions
- **Report Issues**: Report any suspicious activity or potential security issues

### For Developers

- **Code Review**: All code changes require security-focused review
- **Dependency Management**: Regularly update dependencies and audit for vulnerabilities
- **Input Validation**: Validate and sanitize all user inputs
- **Authentication**: Implement proper authentication and authorization
- **HTTPS**: Use HTTPS for all communications
- **Secrets Management**: Never commit secrets to version control

## Security Features

### Authentication & Authorization
- Supabase OAuth integration (frontend)
- JWT token-based authentication
- Role-based access control
- Session management and timeout
- FastAPI authentication middleware (production-ready)
- Configurable authentication system

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure headers implementation

### Infrastructure Security
- HTTPS enforcement
- Content Security Policy (CSP)
- Secure cookie configuration
- Rate limiting
- DDoS protection

### Database Security
- Parameterized queries (SQLAlchemy ORM)
- Least privilege access
- Regular security updates
- Encrypted connections
- Backup encryption
- Production: Direct MySQL integration with LuminariMUD
- Development: Supabase PostgreSQL for local testing

## Vulnerability Disclosure Policy

We believe in responsible disclosure and will work with security researchers to:

1. **Acknowledge** legitimate security reports within 48 hours
2. **Provide** regular updates on our progress
3. **Credit** researchers who report valid security issues
4. **Coordinate** disclosure timing to protect users

### What We Ask

- **Give us reasonable time** to investigate and fix the issue before public disclosure
- **Do not access or modify** user data without explicit permission
- **Do not perform actions** that could harm the availability or integrity of our services
- **Do not use social engineering** against our employees or contractors

### What We Promise

- **Respond quickly** to your report
- **Keep you informed** of our progress
- **Work with you** on disclosure timing
- **Not pursue legal action** for good faith security research
- **Credit your contribution** (if desired)

## Security Contact Information

- **Email**: security@luminari.com
- **PGP Key**: Available upon request
- **Response Time**: Within 48 hours

## Security Updates

Security updates will be announced through:

- **GitHub Security Advisories**: https://github.com/moshehbenavraham/wildeditor/security/advisories
- **Release Notes**: Included in version release notes
- **Email Notifications**: For critical security updates (if subscribed)

## Compliance

This project follows security best practices including:

- **OWASP Top 10** guidelines
- **NIST Cybersecurity Framework** principles
- **Industry standard** secure coding practices
- **Regular security audits** and penetration testing

## Bug Bounty Program

We currently do not have a formal bug bounty program, but we greatly appreciate security researchers who help us keep our users safe. We will:

- **Acknowledge** your contribution publicly (if desired)
- **Provide** a letter of recommendation for your portfolio
- **Consider** monetary rewards for critical vulnerabilities (case-by-case basis)

## Legal

This security policy is subject to our Terms of Service and Privacy Policy. By participating in our security program, you agree to:

- Act in good faith to avoid privacy violations and disruptions to others
- Only interact with accounts you own or with explicit permission
- Not access or modify user data
- Report vulnerabilities responsibly

## Questions

If you have questions about this security policy, please contact us at security@luminari.com.

---

**Last Updated**: January 2024
**Version**: 1.0
