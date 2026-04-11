# @auth-guard/backend

Authentication backend library for Auth Guard.

It provides:

- Authentication functions: login, register, OAuth, verification, password reset
- Session management: check auth, get sessions, token refresh
- Profile and avatar management
- JWT and cache configuration support

## Installation

```bash
npm install @auth-guard/backend
```

## Usage

Import the auth function and pass your models and configuration.

```ts
import type { IncomingMessage } from 'node:http'
import { auth } from "@auth-guard/backend";
import { User, Avatar, Profile, Session } from "your-service";
import { cache } from "your-cache-lib";
import { sendMail } from "your-mail-lib"; // or you can use @auth-guard/mail
import { log } from "your-log-lib";

const extractAccessToken = async (req: IncomingMessage) =>
    req.headers.authorization || (req.headers.token as string) || null;

const extractRefreshToken = async (req: IncomingMessage) => {
    const token: string | null = req.cookies?.["auth-refresh"];

    if (!token) {
        return null;
    }

    return `Bearer ${token}`;
};

const authGuard = auth({
	User,
	Avatar,
	Profile,
	Session,
	Cache: cache,
	Mail: {sendMail},
	extractToken: {
        access: extractAccessToken as () => Promise<string | null>,
        refresh: extractRefreshToken as () => Promise<string | null>,
    },,
	jwt: {
        expires: {
            access: 60 * 15,
            refresh: 60 * 60 * 24 * 7,
        },
        secret: <jwt-secret>
    },
	logger: log,
	// Optional:
	OAuth: {
        callbackUri: `<your-backend-url>/oauth/callback/`,
        providers: {
            [providers]: {
                clientId: <clinet-id>,
                clientSecret: <clinet-secret>,
            }
        },
    },
});
```

## API

### Authentication

#### `login`

```ts
const { login } = authGuard;

const result = await login({
	email: "user@example.com",
	password: "secure-password",
	deviceId,
    deviceName: ua.getOS().name || "Unknown",
    deviceType: ua.getBrowser().name || "Unknown",
});
```

#### `register`

```ts
const { register } = authGuard;

const result = await register({
	email: "user@example.com",
	password: "secure-password",
	name: "John Doe",
	deviceId,
    deviceName: ua.getOS().name || "Unknown",
    deviceType: ua.getBrowser().name || "Unknown",
});
```

#### `oAuthStart`

```ts
const { oAuthStart } = authGuard;

const { url, state } = oAuthStart("google");
```

#### `loginWithProvider`

```ts
const { loginWithProvider } = authGuard;

const result = await loginWithProvider({
	provider: 'google',
	code: <authorization-code>,
	state: <oauth-state>,
	deviceId,
    deviceName: ua.getOS().name || "Unknown",
    deviceType: ua.getBrowser().name || "Unknown",
});
```

#### `startVerification`

```ts
const { startVerification } = authGuard;

await startVerification({
	email: "user@example.com"
});
```

#### `verifyAccount`

```ts
const { verifyAccount } = authGuard;

await verifyAccount({
	email: "user@example.com",
	code: <verification-code>,
	deviceId,
    deviceName: ua.getOS().name || "Unknown",
    deviceType: ua.getBrowser().name || "Unknown",
});
```

### Password

#### `forgotPassword`

```ts
const { forgotPassword } = authGuard;

const { id } = await forgotPassword({
	email: "user@example.com"
});
```

#### `resetPassword`

```ts
const { resetPassword } = authGuard;

await resetPassword({
	id: <user-id>,
	code: <reset-code>,
	password: "new-password",
	deviceId,
    deviceName: ua.getOS().name || "Unknown",
    deviceType: ua.getBrowser().name || "Unknown",
});
```

#### `changePassword`

```ts
const { changePassword } = authGuard;

await changePassword({
	password: "new-password",
	deviceId,
    deviceName: ua.getOS().name || "Unknown",
    deviceType: ua.getBrowser().name || "Unknown",
});
```

### Auth State

#### `checkAuth`

```ts
const { checkAuth } = authGuard;

const result = await checkAuth(request);
```

#### `loginRequired`

```ts
const { loginRequired } = authGuard;

const result = await loginRequired(request);
```

### Sessions

#### `logout`

```ts
const { logout } = authGuard;

await logout(request);
```

#### `tokenRefresh`

```ts
const { tokenRefresh } = authGuard;

const result = await tokenRefresh(request);
```

#### `authStatus`

```ts
const { authStatus } = authGuard;

const result = await authStatus(request);
```

#### `getSessions`

```ts
const { getSessions } = authGuard;

const sessions = await getSessions(request);
```

### Profile

#### `updateProfile`

```ts
const { updateProfile } = authGuard;

const user = await updateProfile(request, {
	name: "Jane Doe",
});
```

### Avatar

#### `removeAvatar`

> [!WARNING]
> Not impl yet 
> Suggested Api

```ts
const { removeAvatar } = authGuard;

await removeAvatar(request);
```

## Types

Import types for TypeScript support:

```ts
import type {
	AuthType,
	AuthPropsType,
	AuthReturnType,
	TokenType,
	AvatarType,
	ProfileType,
	ProviderType,
	RoleType,
	SessionType,
	UserType,
} from "@auth-guard/backend";
```

## Configuration

### `AuthPropsType`

| Property | Type | Description |
|----------|------|-------------|
| `User` | `UserModelType` | User services to CRUD DB |
| `Avatar` | `AvatarModelType` | Avatar services to CRUD DB |
| `Profile` | `ProfileModelType` | Profile services to CRUD DB |
| `Session` | `SessionModelType` | Session services to CRUD DB |
| `Cache` | `CacheConfigType` | Cache to CRUD cache(get,set,remove) |
| `Mail` | `MailConfigType` | Mail sender |
| `extractToken` | `TokenConfigType` | Functions to extract Token |
| `jwt` | `JwtConfigType` | JWT configuration |
| `logger` | `LoggerType` | Logger instance |

## License

[MIT](https://github.com/rahulroy0322/auth-guard/tree/main?tab=MIT-1-ov-file)