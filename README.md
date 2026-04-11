# AuthGuard

AuthGuard is an open-source authentication framework designed for developers who want full control over their user data without relying on third-party services like Clerk or Kinde.

## Why AuthGuard?

- **Own Your Data**: Keep user data in your own database
- **No Vendor Lock-in**: Avoid dependency on external auth providers
- **Framework Agnostic**: Works with Express, React, and more
- **Self-Hosted**: Run entirely on your infrastructure

## Feature Comparison

| Feature | AuthGuard | Clerk | Kinde |
|---------|-----------|-------|-------|
| **Pricing & Licensing** | | | |
| Open Source | ✅ MIT License | ❌ Proprietary | ❌ Proprietary |
| Free Tier | ✅ Unlimited | ✅ Limited | ✅ Limited |
| Self-Hosted | ✅ Full control | ❌ Cloud-only | ❌ Cloud-only |
| **Core Features** | | | |
| Email/Password Auth | ✅ | ✅ | ✅ |
| Social OAuth | ✅ (Google, GitHub) | ✅ (20+ providers) | ✅ (Multiple) |
| Session Management | ✅ JWT | ✅ | ✅ |
| User Management | ✅ | ✅ | ✅ |
| **Security Features** | | | |
| MFA/2FA | 🔄 Planned | ✅ TOTP, SMS, Authenticator | ✅ |
| WebAuthn / FIDO2 (Hardware/Biometric Auth) | 🔄 Planned | ✅ | ✅ |
| Password Hashing | ✅ bcrypt | ✅ | ✅ |
| Rate Limiting | ✅ | ✅ | ✅ |
| **OAuth Providers** | | | |
| Google | ✅ | ✅ | ✅ |
| GitHub | ✅ | ✅ | ✅ |
| Apple | 🔄 Planned | ✅ | ✅ |
| Microsoft | ❌ | ✅ | ✅ |
| **Framework Support** | | | |
| React | ✅ | ✅ | ✅ |
| Next.js | ✅ | ✅ | ✅ |
| Express | ✅ | ✅ | ✅ |
| Vue | 🔄 Planned | ✅ | ✅ |
| Angular | 🔄 Planned | ✅ | ✅ |
| **Deployment** | | | |
| Self-Hosting | ✅ | ❌ | ❌ |
| Database Control | ✅ Your own DB | ❌ Clerk-managed | ❌ Kinde-managed |
| Custom Domains | ✅ | ✅ (Paid) | ✅ (Paid) |
| **Advanced Features** | | | |
| Webhooks | ❌ | ✅ | ✅ |
| Admin Dashboard | ❌ | ✅ | ✅ |
| Analytics | ❌ | ✅ | ✅ |
| Custom UI | ✅ Fully customizable | ✅ Limited customization | ✅ Limited customization |

**Legend:** ✅ = Available, 🔄 = Planned/Roadmap, ❌ = Not Available

## Installation

```bash
npm install @auth-guard/express @auth-guard/react
# or
yarn add @auth-guard/express @auth-guard/react
# or
pnpm add @auth-guard/express @auth-guard/react
```

## Future Roadmap

### Backend Support
- [ ] Fastify
- [ ] Hono
- [ ] NestJS

### Frontend Support
- [ ] Vue
- [ ] Angular
- [ ] Solid
- [ ] Svelte

### Security Enhancements
- [ ] MFA/2FA Support
- [ ] WebAuthn/FIDO2 Support
- [ ] Additional OAuth Providers (Apple, Microsoft)

## Contributing

We welcome contributions! Please see our [CONTRIBUTING](CONTRIBUTING.md) guide.

## License

[MIT](LICENSE) © 2026 AuthGuard Team
