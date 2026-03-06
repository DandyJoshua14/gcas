# guru-custom-auth-system

A unified auth library you can deploy to npm. One `auth` object with `init()` that accepts credentials for **Supabase**, **Firebase**, or **custom** auth.

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

Create a small test file, e.g. `test-local.js` in the project root:

```js
const { auth } = require('./dist/cjs/index.js');

// Test with custom adapter (no real backend needed)
auth.init({
  type: 'custom',
  adapter: {
    async getUser() {
      return { id: '1', email: 'test@example.com' };
    },
    async getSession() {
      return { user: { id: '1' } };
    },
    async signInWithPassword(email, password) {
      return { user: { id: '1', email }, session: {} };
    },
    async signUp() {
      return { user: { id: '1' }, session: {} };
    },
    async signOut() {},
    onAuthStateChange(cb) {
      return () => {};
    },
  },
});

(async () => {
  console.log('isInitialized:', auth.isInitialized);
  console.log('getUser:', await auth.getUser());
  console.log('getSession:', await auth.getSession());
  console.log('OK – library works locally');
})();
```

Run it:

```bash
node test-local.js
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

### 4. Test with Supabase or Firebase (optional)

Use real credentials in your test script and call `auth.init()` with `type: 'supabase'` or `type: 'firebase'`, then try `auth.signInWithPassword()`, `auth.getUser()`, etc., against your project.

## Usage

### TypeScript

The package exports full TypeScript types. Use the credential types for type-safe `init()`:

```ts
import { auth, type SupabaseCredentials, type FirebaseCredentials } from 'guru-custom-auth-system';

const supabaseCreds: SupabaseCredentials = {
  type: 'supabase',
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!,
};
auth.init(supabaseCreds);
```

### Init (required)

Call `auth.init()` once with the credentials for your chosen SDK.

#### Supabase

```js
const { auth } = require('guru-custom-auth-system');

auth.init({
  type: 'supabase',
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key',
  serviceKey: 'your-service-role-key', // optional, server-side only
  restApiUrl: 'https://your-custom-rest-api.com', // optional, defaults to url
});
```

#### Firebase

```js
const { auth } = require('guru-custom-auth-system');

auth.init({
  type: 'firebase',
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

#### Custom auth

Provide an `adapter` object with the methods you implement (e.g. your own API or Auth0/NextAuth):

```js
auth.init({
  type: 'custom',
  adapter: {
    async getUser() { /* return current user or null */ },
    async getSession() { /* return session or null */ },
    async signInWithPassword(email, password) { /* return user/session */ },
    async signUp(email, password, options) { /* return user/session */ },
    async signOut() { /* clear session */ },
    onAuthStateChange(callback) { /* return unsubscribe */ },
  },
  client: myCustomClient, // optional, exposed via auth.getClient()
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

All of these are on the `auth` object after you import/require the library. Call `auth.init(credentials)` once before using the rest.

### Initialization & state

| Function | Description |
|----------|-------------|
| `auth.init(credentials)` | Initialize auth. `credentials` must have `type: 'supabase' \| 'firebase' \| 'custom'` and the right fields for that type. Returns the provider instance. |
| `auth.getProvider()` | Returns the current provider instance. Throws if not initialized. |
| `auth.isInitialized` | Read-only. `true` after a successful `init()`. |

### Underlying client

| Function | Description |
|----------|-------------|
| `auth.getClient()` | Returns the underlying SDK client (Supabase client, Firebase app, or your custom client). |
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

auth.init({ type: 'supabase', url: '...', anonKey: '...' });

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
