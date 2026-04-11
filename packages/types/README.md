# @auth-guard/types

This package contains TypeScript type definitions that are shared across the @auth-guard monorepo. It is published to npm so that consumer projects can import type definitions without bringing in any runtime code.

The package is configured to expose its public entry point at `src/main.ts` via the `exports` field in `package.json`.

Then consumers can import the type like:

```ts
import type { UserType } from '@auth-guard/types';
```

## License

[MIT](https://github.com/rahulroy0322/auth-guard/tree/main?tab=MIT-1-ov-file)
