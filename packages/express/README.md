# @auth-guard/express

Express middleware for Auth Guard authentication system. Provides ready-to-use authentication routes and middleware for Express.js applications.

## Installation

```bash
npm install @auth-guard/express
```

## Peer Dependencies

This package requires the following peer dependencies which will be installed automatically when you install `@auth-guard/express`:

- `@auth-guard/backend`: ^0
- `express`: ^5
- `multer`: ^2
- `ua-parser-js`: ^2
- `zod`: ^4

If you encounter installation errors, you can install them manually:

```bash
npm install @auth-guard/backend express multer ua-parser-js zod
```

## Usage

Import the `init` function and configure it with your models and services.

```typescript
import { auth } from "@auth-guard/express";
import type { Request } from "express";
import { User, Avatar, Profile, Session } from "your-service";
import { cache } from "your-cache-lib";
import { sendMail } from "your-mail-lib"; // or you can use @auth-guard/mail
import { log } from "your-log-lib";

const extractAccessToken = async (req: Request) =>
	req.headers.authorization || (req.headers.token as string) || null;

const extractRefreshToken = async (req: Request) => {
	const token: string | null = req.cookies?.["auth-refresh"];

	if (!token) {
		return null;
	}

	return `Bearer ${token}`;
};

const guard = auth({
	cookie: {
		access: "auth-access",
		refresh: "auth-refresh",
		extract: (req, key) => req.cookies?.[key] || null,
	},
	jwt: {
		expires: {
			access: 60 * 15,
			refresh: 60 * 60 * 24 * 7,
		},
		secret: <jwt-secret>
	},
	extractToken: {
		access: extractAccessToken as () => Promise<string | null>,
		refresh: extractRefreshToken as () => Promise<string | null>,
	},
	logger: log,
	User,
	Avatar,
	Profile,
	Session,
	Cache: cache,
	Mail: {sendMail},

	// Optional:
	OAuth: {
        callbackUri: `<your-backend-url>/oauth/callback/`,
        providers: {
            [providers]: {
				clientId: <client-id>,
                clientSecret: <client-secret>,
            }
        },
    },
});

// use where ever you want
export { guard };
```

## API

### `auth(options: AuthExpressPropsType): AuthExpressReturnType`

Initializes the authentication middleware with the provided options.
## Configuration

### `AuthExpressPropsType`

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
| `cookie` | `CookieConfigType` | Cookie configuration |
| `logger` | `LoggerType` | Logger instance |

#### Returns

An object containing all the functions required to perform authentication.

## Routes

The router provides the following endpoints:

- `POST /login` - User login
- `POST /register` - User registration  
- `POST /verify` - Email verification
- `POST /resend-verification` - Resend verification code
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `POST /logout` - Logout user
- `GET /sessions` - Get user sessions
- `DELETE /sessions/:id` - Revoke a session
- `POST /oauth/:provider` - OAuth authentication (Google, GitHub)
- `GET /oauth/:provider/callback` - OAuth callback
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /avatar` - Upload avatar
- `DELETE /avatar` - Remove avatar

### Implementation

```typescript
import { authRouter } from "@auth-guard/express/auth.route";
import { Router } from "express";
import { guard } from "../auth/main";

const apiRouter: Router = Router();

apiRouter.use("/auth", authRouter(guard));
```

## Middleware Usage

The `guard` object provides middleware functions that can be used to protect your routes:

### `guard.loginRequired` - Require Authentication

Use `guard.loginRequired` to protect routes that require a logged-in user:

```typescript
import express from 'express';
import { guard } from './auth/main';

const app = express();

// Public route - anyone can access
app.get('/public', (req, res) => {
  res.json({ message: 'This is public' });
});

// Protected route - requires authentication
app.get('/protected', guard.loginRequired, (req, res) => {
  // req.user is available here after authentication
  res.json({
    message: 'This is protected',
    user: req.user
  });
});

// Multiple middleware can be chained
app.get('/admin',
  guard.loginRequired,
  (req, res, next) => {
    // Additional authorization checks
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  },
  (req, res) => {
    res.json({ message: 'Admin area' });
  }
);
```

### `guard.checkAuth` - Optional Authentication

Use `guard.checkAuth` to populate `req.user` if available, but don't require authentication:

```typescript
app.get('/profile', guard.checkAuth, (req, res) => {
  if (req.user) {
    // User is authenticated
    res.json({ user: req.user, authenticated: true });
  } else {
    // User is not authenticated
    res.json({ user: null, authenticated: false });
  }
});
```

### Using with Router

```typescript
import { Router } from 'express';
import { guard } from './auth/main';

const protectedRouter = Router();

// All routes in this router require authentication
protectedRouter.use(guard.loginRequired);

protectedRouter.get('/dashboard', (req, res) => {
  res.json({ user: req.user, data: 'Dashboard data' });
});

protectedRouter.get('/settings', (req, res) => {
  res.json({ user: req.user, settings: {} });
});

app.use('/api', protectedRouter);
```

## Error Handling

The authentication middleware throws errors that should be handled by your Express error handling middleware. When `guard.loginRequired` fails (user not authenticated), it throws an `AuthError` (or specific subclass like `AuthUnAuthenticatedError`) with appropriate status codes.

### Complete Error Handling Middleware Example

Here's a comprehensive error middleware that handles authentication errors and other application errors:

```typescript
import { AuthError } from "@auth-guard/express";
import type { ErrorRequestHandler } from "express";
import { isDev } from "../config/env.config";
import { AppError, type MetaType } from "../error/app.error";
import logger from "../logger/pino";
import type { ErrorType } from "../types";

const getError = (
	e: unknown,
): {
	name: string;
	message: string;
	stack?: string;
	status: number;
	meta?: MetaType;
	extra?: unknown;
} => {
	if (e instanceof AuthError) {
		return {
			name: e.name,
			message: e.message,
			stack: e.stack,
			status: e.status,
		};
	}
	if (e instanceof AppError) {
		return {
			name: e.name,
			message: e.message,
			stack: e.stack,
			meta: e.meta,
			status: e.status,
		};
	}

	if (e instanceof Error) {
		return {
			name: e.name,
			message: e.message,
			stack: e.stack,
			status: 500,
		};
	}

	return {
		name: "Unknown Error",
		message: "Internal Server Error",
		status: 500,
		extra: e,
	};
};

const errorMiddleware: ErrorRequestHandler = (e, _req, res, _next) => {
	const { status, ...error } = getError(e);
	logger.error(error, "Error happened!");
	if (!isDev) {
		delete error.stack;
		delete error.meta;
		delete error.extra;
	}

	res.status(status).json({
		success: false,
		error,
	} satisfies ErrorType);
};

export { errorMiddleware };
```

### Using the Error Middleware

```typescript
import express from 'express';
import { errorMiddleware } from './middlewares/error.middleware';
import { guard } from './auth/main';

const app = express();

// Your routes
app.get('/protected', guard.loginRequired, (req, res) => {
  // This will only execute if authentication succeeds
  res.json({ message: 'Protected data', user: req.user });
});

// Register error middleware after all routes
app.use(errorMiddleware);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Error Types

- `AuthUnAuthenticatedError` (401): Thrown when user is not authenticated
- `AuthInvalidTokenError` (401): Thrown when token is invalid
- `AuthExpiredError` (401): Thrown when token is expired
- `AuthServerError` (500): Thrown for server errors

All authentication errors extend `AuthError`, so you can catch them with `instanceof AuthError`.

## License

[MIT](https://github.com/rahulroy0322/auth-guard/tree/main?tab=MIT-1-ov-file)