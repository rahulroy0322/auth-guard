# @auth-guard/nextjs

Next.js client library for Auth Guard.

It ships:

- `GuardProvider` and `useGuard` for auth state, actions, and OAuth options
- auth triggers like `LoginButton` and `RegisterButton`
- authenticated UI helpers like `Show` and `ProfileButton`
- packaged styles at `@auth-guard/nextjs/styles.css`
- DIY auth form exports from `@auth-guard/nextjs/diy`
- Server‑side auth API handler from `@auth-guard/nextjs/server`

## Installation

```bash
npm install @auth-guard/nextjs
```

## App setup

Wrap your app with `GuardProvider` and load the package styles once.

```tsx
import { GuardProvider, type OAuthProviderType } from "@auth-guard/nextjs";
import type { ReactNode } from "react";
import "@auth-guard/nextjs/styles.css";

const oauthProviders = [
	{ provider: "apple", disabled: true },
	{ provider: "google" },
	{ provider: "github" },
] as OAuthProviderType[];

export function MainProvider({ children }: { children: ReactNode }) {
	return (
		<GuardProvider
			config={{
				baseUrl: "http://localhost:3000",
				images: {
					login: "https://cdn.example.com/login.svg",
					register: "https://cdn.example.com/register.svg",
					forgot: "https://cdn.example.com/forgot.svg",
					reset: "https://cdn.example.com/reset.svg",
					verify: "https://cdn.example.com/verify.svg",
				},
			}}
			oauth={oauthProviders}
		>
			{children}
		</GuardProvider>
	);
}
```

## UI components

### `Show`

`Show` renders children based on auth state from `useGuard()`.

```tsx
import { Show } from "@auth-guard/nextjs";

function HeaderActions() {
	return (
		<>
			<Show when="logged-out">
				<p>Please sign in to continue.</p>
			</Show>

			<Show when="logged-in" fallback={<p>Checking session...</p>}>
				<p>You are signed in.</p>
			</Show>
		</>
	);
}
```

### `LoginButton` and `RegisterButton`

These buttons open the built-in auth flow in a modal by default. They also accept your button props like `variant`, `size`, and `className`.

```tsx
import { LoginButton, RegisterButton } from "@auth-guard/nextjs";

function HeaderAuth() {
	return (
		<div className="flex gap-4">
			<LoginButton mode="modal" variant="link">
				Login
			</LoginButton>

			<RegisterButton mode="modal" variant="link">
				Register
			</RegisterButton>
		</div>
	);
}
```

Use `mode="page"` when you want the button styling but handle navigation yourself.

```tsx
import { Link } from "<router>";
import { LoginButton, RegisterButton } from "@auth-guard/nextjs";

function HeaderAuth() {
	return (
		<div className="flex gap-4">
			<Show when="logged-out">
                <LoginButton mode="page" render={<Link to="/login" />}>
                    Login
                </LoginButton>
                <RegisterButton mode="page" render={<Link to="/register" />}>
                    Register
                </RegisterButton>
            </Show>
		</div>
	);
}
```

### `ProfileButton`

`ProfileButton` only renders for authenticated users. It shows the current user avatar, a dropdown menu, and the built-in account dialog with profile and security panels.

```tsx
import { ProfileButton, Show } from "@auth-guard/nextjs";

function Header() {
	return (
		<Show when="logged-in">
			<ProfileButton />
		</Show>
	);
}
```

### Full header example

This mirrors the usage in `apps/app`.

```tsx
import {
	LoginButton,
	ProfileButton,
	RegisterButton,
	Show,
} from "@auth-guard/nextjs";

function Header() {
	return (
		<header className="flex items-center justify-between p-2">
			<Show when="logged-out">
				<div className="flex gap-4">
					<LoginButton mode="modal" variant="link">
						Login
					</LoginButton>
					<RegisterButton mode="modal" variant="link">
						Register
					</RegisterButton>
				</div>
			</Show>

			<Show when="logged-in">
				<ProfileButton />
			</Show>
		</header>
	);
}
```

## `useGuard`

`useGuard()` gives you access to auth state and actions from the provider.

```tsx
import { useGuard } from "@auth-guard/nextjs";

function AccountSummary() {
	const { user, loading, logout, error } = useGuard();

	if (loading) return <p>Loading...</p>;
	if (!user) return <p>Not signed in.</p>;

	return (
		<div>
			<p>{user.email}</p>
			{error ? <p>{error.message}</p> : null}
			<button onClick={logout}>Logout</button>
		</div>
	);
}
```

## DIY forms

Use the DIY exports when you want your own routes but still want the library’s auth forms.

### `LoginForm`

```tsx
import { Link } from "<router>";
import { useGuard } from "@auth-guard/nextjs";
import { LoginForm } from "@auth-guard/nextjs/diy";

function LoginRoute() {
	const { login, fetching, oauthProviders, config } = useGuard();

	return (
		<LoginForm
			appName={config.appName}
			src={config.images.login}
			nativeButton={false}
			render={<Link to="/register" />}
			forgotPasswordProps={{
				nativeButton: false,
				render: <Link to="/forgot-password" />,
			}}
			handleSubmit={login}
			pending={fetching}
			oauthProviders={oauthProviders}
		/>
	);
}
```

### `RegisterForm`

```tsx
import { Link } from "<router>";
import { useGuard } from "@auth-guard/nextjs";
import { RegisterForm } from "@auth-guard/nextjs/diy";

function RegisterRoute() {
	const { register, fetching, oauthProviders, config } =
		useGuard();

	return (
		<RegisterForm
			appName={config.appName}
			src={config.images.register}
			nativeButton={false}
			render={<Link to="/login" />}
			handleSubmit={register}
			pending={fetching}
			oauthProviders={oauthProviders}
		/>
	);
}
```

### `VerifyForm`

```tsx
import { Link, Navigate, navigate } from "<router>";
import { useGuard } from "@auth-guard/nextjs";
import { VerifyForm } from "@auth-guard/nextjs/diy";

function VerifyRoute() {
    const { verification, verifyAccount, startVerification, clearVerification, fetching, config } = useGuard();

    if (!verification) {
        return <Navigate to="/login" />;
    }

    return (
        <VerifyForm
            src={config.images.verify}
            email={verification.email}
            handleSubmit={verifyAccount}
            handleResend={async () => {
                await startVerification(verification.email);
            }}
            handleBack={() => {
                clearVerification();
                navigate({
                    to: "/login",
                });
            }}
            pending={fetching}
        />
    );
}
```

### `ResetPasswordForm`

```tsx
import { Link, Navigate, navigate } from "<router>";
import { useGuard } from "@auth-guard/nextjs";
import { ResetPasswordForm } from "@auth-guard/nextjs/diy";

function ResetPasswordRoute() {
    const { fetching, config, resetPassword } = useGuard();

    const search = new URLSearchParams(window.location.search);
    const id = search.get("id");
    const email = search.get("email") ?? undefined;

    if (!id) {
        return <Navigate to="/forgot-password" />;
    }

    return (
        <ResetPasswordForm
            src={config.images.reset}
            nativeButton={false}
            render={<Link to="/login" />}
            email={email}
            handleSubmit={async ({ code, password }) => {
                await resetPassword({
                    id,
                    code,
                    password,
                });
                navigate({
                    to: "/",
                });
            }}
            pending={fetching}
        />
    );
}
```

### `ForgotPasswordForm`

```tsx
import { Link, navigate } from "<router>";
import { useGuard } from "@auth-guard/nextjs";
import { ForgotPasswordForm } from "@auth-guard/nextjs/diy";

function ForgotPasswordRoute() {
    const { forgotPassword, fetching, config } = useGuard();

    return (
        <ForgotPasswordForm
            src={config.images.forgot}
            nativeButton={false}
            render={<Link to="/login" />}
            handleSubmit={async ({ email }) => {
                const { id } = await forgotPassword(email);
                navigate({
                    to: "/reset-password",
                    search: {
                        email,
                        id,
                    },
                });
            }}
            pending={fetching}
        />
    );
}
```

### `OAuth`

```tsx
import { navigate, useParams } from "<router>";
import { useGuard, type ProviderType } from "@auth-guard/nextjs";
import { useEffect } from "react";

function OAuthCallbackRoute() {
    const { finishOAuth } = useGuard();
    const { provider } = useParams();

    useEffect(() => {
        const controller = new AbortController();
        const search = new URLSearchParams(window.location.search);
        const code = search.get("code");
        const state = search.get("state");

        if (!code || !state) {
            navigate({
                to: "/login",
            });
            return () => {
                controller.abort();
            };
        }
        const login = async () => {
            try {
                await finishOAuth(
                    provider as ProviderType,
                    {
                        code,
                        state,
                    },
                    controller.signal,
                );
                navigate({
                    to: "/",
                });
            } catch (e) {
                console.error(e);

                navigate({
                    to: "/login",
                });
            }
        };

        login();

        return () => {
            controller.abort();
        };
    }, [finishOAuth, provider]);

    return (
        <div className="min-h-80 flex items-center justify-center p-6 text-center">
            <p className="text-sm text-muted-foreground">Finishing sign in...</p>
        </div>
    );
}
```

## Server‑side Auth API

The package provides a ready‑to‑use Next.js Route Handler that implements the complete Auth Guard backend. Import `handleAuth` (or its alias `auth`) from `@auth-guard/nextjs/server` and pass your service implementations.

### Example `app/api/auth/[...auth]/route.ts`

```ts
import { handleAuth } from "@auth-guard/nextjs/server";
import { logger } from "@/lib/logger";
import * as User from "@/services/user";
import * as Avatar from "@/services/avatar";
import * as Profile from "@/services/profile";
import * as Session from "@/services/session";
import { initMail } from "@auth-guard/mail";

// or your own email sender
const mail = initMail({
	host: process.env.MAIL_HOST,
	port: Number(process.env.MAIL_PORT),
	secure: process.env.NODE_ENV === "production",
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS,
	},
});

const handler = handleAuth({
	// Required: JWT secret for signing tokens
	jwtSecret: process.env.JWT_SECRET!,

	// Required: Service implementations
	User,
	Avatar,
	Profile,
	Session,

	// Optional: Logger (defaults to console)
	logger,

	// add cache: use your choice
	Cache: {
		set: async () => {},
		get: async () => null,
		remove: async () => {},
	},

	// Optional: Mail adapter
	Mail: {
		sendMail: mail,
	},

	// Optional: OAuth providers
	OAuth: {
		callbackUri: `${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth/callback/`,
		providers: {
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID!,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			},
			github: {
				clientId: process.env.GITHUB_CLIENT_ID!,
				clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			},
		},
	},
});

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE, handler as PUT };
```

### Supported endpoints

The handler automatically routes requests to the appropriate internal handlers:

- `GET /api/auth/oauth/:provider` – start OAuth flow
- `GET /api/auth/oauth/callback/:provider` – OAuth callback
- `GET /api/auth/status` – check authentication status
- `POST /api/auth/register` – register a new user
- `POST /api/auth/login` – log in
- `GET /api/auth/refresh` – refresh access token
- `POST /api/auth/start-verification` – send verification email
- `GET|PATCH /api/auth/verify` – verify account
- `POST /api/auth/forgot-password` – request password reset
- `PATCH /api/auth/reset-password` – reset password
- `PATCH /api/auth/change-password` – change password (authenticated)
- `PATCH /api/auth/profile` – update profile
- `PATCH /api/auth/remove-avatar` – remove avatar
- `GET /api/auth/me` – get current user
- `POST /api/auth/logout` – log out
- `GET /api/auth/sessions` – list active sessions

All endpoints return consistent JSON responses and appropriate HTTP status codes.

## Exports

- `@auth-guard/nextjs` – main React components and hooks
- `@auth-guard/nextjs/diy` – DIY auth forms
- `@auth-guard/nextjs/server` – server‑side route handler
- `@auth-guard/nextjs/styles.css` – packaged CSS

## License

[MIT](https://github.com/rahulroy0322/auth-guard/tree/main?tab=MIT-1-ov-file)
