'use strict';

const { createSupabaseProvider } = require('./providers/supabase');
const { createFirebaseProvider } = require('./providers/firebase');
const { createCustomProvider } = require('./providers/custom');

const PROVIDERS = {
  supabase: createSupabaseProvider,
  firebase: createFirebaseProvider,
  custom: createCustomProvider,
};

let currentProvider = null;

/**
 * Unified auth instance with init() and a common API across Supabase, Firebase, and custom auth.
 */
const auth = {
  /**
   * Initialize auth with the SDK of your choice.
   * @param {object} credentials - Provider-specific credentials
   * @param {('supabase'|'firebase'|'custom')} credentials.type - Which auth provider to use
   *
   * Supabase:
   * @param {string} [credentials.url] - Supabase project URL
   * @param {string} [credentials.anonKey] - Supabase anon/publishable key
   * @param {string} [credentials.serviceKey] - Supabase service role key (optional, server-side)
   * @param {string} [credentials.restApiUrl] - Custom REST API URL (optional, defaults to url)
   *
   * Firebase:
   * @param {object} [credentials.config] - Firebase config object (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)
   * @param {string} [credentials.name] - Optional Firebase app name
   *
   * Custom:
   * @param {object} [credentials.adapter] - Adapter with getUser, signIn, signOut, etc.
   * @param {*} [credentials.client] - Optional client to expose via getClient()
   *
   * @returns {object} The initialized provider instance (same as auth.getProvider())
   */
  init(credentials) {
    if (!credentials || typeof credentials !== 'object') {
      throw new Error('auth.init() requires a credentials object with a "type" field');
    }
    const { type } = credentials;
    const factory = PROVIDERS[type];
    if (!factory) {
      throw new Error(`Unknown auth type: "${type}". Use "supabase", "firebase", or "custom".`);
    }
    currentProvider = factory(credentials);
    return currentProvider;
  },

  /**
   * Get the current provider instance (after init). Throws if not initialized.
   */
  getProvider() {
    if (!currentProvider) {
      throw new Error('Auth not initialized. Call auth.init(credentials) first.');
    }
    return currentProvider;
  },

  /** Whether auth has been initialized. */
  get isInitialized() {
    return currentProvider !== null;
  },

  /** Underlying client (Supabase client, Firebase app, or custom client). */
  getClient() {
    return this.getProvider().getClient();
  },

  /** Get current user. */
  async getUser() {
    return this.getProvider().getUser();
  },

  /** Get current session (provider-specific shape). */
  async getSession() {
    return this.getProvider().getSession();
  },

  /** Sign in with email and password. */
  async signInWithPassword(email, password) {
    return this.getProvider().signInWithPassword(email, password);
  },

  /** Sign up with email and password. */
  async signUp(email, password, options) {
    return this.getProvider().signUp(email, password, options || {});
  },

  /** Sign out. */
  async signOut() {
    return this.getProvider().signOut();
  },

  /** Subscribe to auth state changes. Returns unsubscribe function. */
  onAuthStateChange(callback) {
    return this.getProvider().onAuthStateChange(callback);
  },
};

// Supabase-specific helpers (no-ops or throw if not Supabase)
auth.signInWithOAuth = function (options) {
  const p = this.getProvider();
  if (p.signInWithOAuth) return p.signInWithOAuth(options);
  throw new Error('signInWithOAuth is only available for Supabase auth');
};
auth.resetPasswordForEmail = function (email, redirectTo) {
  const p = this.getProvider();
  if (p.resetPasswordForEmail) return p.resetPasswordForEmail(email, redirectTo);
  throw new Error('resetPasswordForEmail is only available for Supabase auth');
};
auth.getAdminClient = function () {
  const p = this.getProvider();
  if (p.getAdminClient) return p.getAdminClient();
  return null;
};
auth.getAuth = function () {
  const p = this.getProvider();
  if (p.getAuth) return p.getAuth();
  return null;
};

module.exports = { auth };
module.exports.auth = auth;
