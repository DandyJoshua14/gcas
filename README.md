# guru-custom-auth-system

A unified auth library you can deploy to npm. One `auth` object with `init(provider, credentials)` for **Supabase** or **Firebase**.

## Install

```bash
npm install guru-custom-auth-system
```

**Supabase** and **Firebase** are included as dependencies, so you don't need to install them separately. The library is written in TypeScript and ships with type definitions.

## Testing the library locally

### 1. Install and build

From the project root:

```bash
npm install
npm run build
```

This compiles TypeScript to `dist/cjs` (CommonJS) and `dist/esm` (ESM).

### 2. Run a quick test (Node)

From the project root, run the included test script (uses Supabase with placeholder URL/key; set `SUPABASE_URL` and `SUPABASE_ANON_KEY` for real auth):

```bash
node test-local.js
```

Or run your own script:

```js
const { auth } = require('./dist/cjs/index.js');

auth.init('supabase', {
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key',
});

console.log(auth.isInitialized);  // true
console.log(await auth.getUser()); // null or user
```

### 3. Test in another project (npm link)

From this repo:

```bash
npm run build
npm link
```

From your other project:

```bash
npm link guru-custom-auth-system
```

Then `require('guru-custom-auth-system')` or `import { auth } from 'guru-custom-auth-system'` will use your local build. Run `npm run build` in the library repo after changes.

### 4. Test with real Supabase or Firebase (optional)

Use real credentials and call `auth.init('supabase', { url, anonKey })` or `auth.init('firebase', { config })`, then try `auth.signInWithPassword()`, `auth.getUser()`, etc.

## Usage

### TypeScript

The package exports full TypeScript types. Use the credential types for type-safe `init()`:

```ts
import { auth, type SupabaseCredentials, type FirebaseCredentials } from 'guru-custom-auth-system';

// Supabase
auth.init('supabase', {
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!,
} as SupabaseCredentials);

// Firebase
auth.init('firebase', {
  config: { apiKey: '...', authDomain: '...', projectId: '...', appId: '...' },
} as FirebaseCredentials);
```

### Init (required)

Call `auth.init(provider, credentials)` once. The first argument is the provider name; the second is the credentials object for that provider.

#### Supabase

```js
const { auth } = require('guru-custom-auth-system');

auth.init('supabase', {
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key',
  serviceKey: 'your-service-role-key', // optional, server-side only
  restApiUrl: 'https://your-custom-rest-api.com', // optional, defaults to url
});
```

#### Firebase

```js
const { auth } = require('guru-custom-auth-system');

auth.init('firebase', {
  config: {
    apiKey: '...',
    authDomain: '...',
    projectId: '...',
    storageBucket: '...',
    messagingSenderId: '...',
    appId: '...',
  },
  name: 'my-app', // optional, for multiple Firebase apps
});
```

### Unified API (after init)

Same API regardless of provider:

```js
// Current user
const user = await auth.getUser();

// Session (shape is provider-specific)
const session = await auth.getSession();

// Sign in / up / out
await auth.signInWithPassword('user@example.com', 'password');
await auth.signUp('user@example.com', 'password');
await auth.signOut();

// Listen to auth changes
const unsubscribe = auth.onAuthStateChange(({ event, user, session }) => {
  console.log(event, user, session);
});
unsubscribe(); // when done
```

### Provider-specific access

Use the underlying SDK when you need it:

```js
// Supabase: full Supabase client
const supabase = auth.getClient();
// Admin client (if you passed serviceKey)
const admin = auth.getAdminClient();
// OAuth / password reset (Supabase only)
await auth.signInWithOAuth({ provider: 'google' });
await auth.resetPasswordForEmail('user@example.com', 'https://...');

// Firebase: Firebase app and Auth
const app = auth.getClient();
const firebaseAuth = auth.getAuth();
```

## Functions reference

All of these are on the `auth` object after you import/require the library. Call `auth.init(provider, credentials)` once before using the rest.

### Initialization & state

| Function | Description |
|----------|-------------|
| `auth.init(provider, credentials)` | Initialize auth. `provider` is `'supabase'` or `'firebase'`. `credentials` is the config object for that provider (no `type` field). Returns the provider instance. |
| `auth.getProvider()` | Returns the current provider instance. Throws if not initialized. |
| `auth.isInitialized` | Read-only. `true` after a successful `init()`. |

### Underlying client

| Function | Description |
|----------|-------------|
| `auth.getClient()` | Returns the underlying SDK client (Supabase client or Firebase app). |
| `auth.getAdminClient()` | **Supabase only.** Returns the admin client when `serviceKey` was passed to `init()`. Otherwise `null`. |
| `auth.getAuth()` | **Firebase only.** Returns the Firebase Auth instance. Throws if provider is not Firebase. |

### User & session

| Function | Description |
|----------|-------------|
| `auth.getUser()` | Returns the current user or `null`. Async. |
| `auth.getSession()` | Returns the current session (shape depends on provider). Async. |

### Sign in / up / out

| Function | Description |
|----------|-------------|
| `auth.signInWithPassword(email, password)` | Sign in with email and password. Returns `{ user, session }` (or provider equivalent). Async. |
| `auth.signUp(email, password, options?)` | Sign up with email and password. `options` is provider-specific (e.g. Supabase `emailRedirectTo`). Async. |
| `auth.signOut()` | Sign out the current user. Async. |

### OAuth & password reset (Supabase only)

| Function | Description |
|----------|-------------|
| `auth.signInWithOAuth(options)` | Start OAuth sign-in (e.g. `{ provider: 'google' }`). Async. Throws if provider is not Supabase. |
| `auth.resetPasswordForEmail(email, redirectTo?)` | Send password-reset email. Async. Throws if provider is not Supabase. |

### Subscriptions

| Function | Description |
|----------|-------------|
| `auth.onAuthStateChange(callback)` | Subscribe to auth state changes. `callback` receives `{ event, user, session }`. Returns an unsubscribe function. |

**Example – callable functions in code:**

```js
const { auth } = require('guru-custom-auth-system');

auth.init('supabase', { url: '...', anonKey: '...' });

const user = await auth.getUser();
const session = await auth.getSession();
await auth.signInWithPassword('user@example.com', 'secret');
await auth.signUp('new@example.com', 'secret', { emailRedirectTo: 'https://...' });
await auth.signOut();

const unsubscribe = auth.onAuthStateChange(({ event, user }) => {
  console.log(event, user);
});

const client = auth.getClient();
const admin = auth.getAdminClient();
await auth.signInWithOAuth({ provider: 'google' });
await auth.resetPasswordForEmail('user@example.com', 'https://app.com/reset');

unsubscribe();
```

## License

ISC
