# guru-custom-auth-system

A unified auth library you can deploy to npm. One `auth` object with `init()` that accepts credentials for **Supabase**, **Firebase**, or **custom** auth.

## Install

```bash
npm install guru-custom-auth-system
```

Then install the provider(s) you use (peer dependencies):

```bash
# For Supabase
npm install @supabase/supabase-js

# For Firebase
npm install firebase

# Custom auth has no extra dependency
```

## Usage

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

## API summary

| Method / property       | Description |
|------------------------|-------------|
| `auth.init(credentials)` | Initialize with Supabase, Firebase, or custom credentials. |
| `auth.getProvider()`   | Get the current provider instance. |
| `auth.isInitialized`   | `true` after a successful `init()`. |
| `auth.getClient()`     | Underlying client (Supabase client, Firebase app, or custom). |
| `auth.getUser()`       | Current user or `null`. |
| `auth.getSession()`    | Current session (provider-specific). |
| `auth.signInWithPassword(email, password)` | Sign in. |
| `auth.signUp(email, password, options?)`   | Sign up. |
| `auth.signOut()`       | Sign out. |
| `auth.onAuthStateChange(callback)` | Subscribe to auth state; returns unsubscribe. |

## License

ISC
