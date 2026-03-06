'use strict';

/**
 * Supabase auth provider.
 * Requires peer dependency: @supabase/supabase-js
 * @param {object} credentials
 * @param {string} credentials.url - Supabase project URL
 * @param {string} credentials.anonKey - Supabase anon/publishable key
 * @param {string} [credentials.serviceKey] - Supabase service role key (server-side only)
 * @param {string} [credentials.restApiUrl] - Custom REST API URL (defaults to url if not set)
 */
function createSupabaseProvider(credentials) {
  const { createClient } = require('@supabase/supabase-js');

  const {
    url,
    anonKey,
    serviceKey,
    restApiUrl,
  } = credentials;

  if (!url || !anonKey) {
    throw new Error('Supabase auth requires "url" and "anonKey"');
  }

  const baseUrl = restApiUrl || url;

  const client = createClient(baseUrl, anonKey);
  let adminClient = null;
  if (serviceKey) {
    adminClient = createClient(baseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return {
    type: 'supabase',
    getClient() {
      return client;
    },
    getAdminClient() {
      return adminClient;
    },
    async getUser() {
      const { data: { user }, error } = await client.auth.getUser();
      if (error) throw error;
      return user;
    },
    async getSession() {
      const { data: { session }, error } = await client.auth.getSession();
      if (error) throw error;
      return session;
    },
    async signInWithPassword(email, password) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async signUp(email, password, options = {}) {
      const { data, error } = await client.auth.signUp({ email, password, ...options });
      if (error) throw error;
      return data;
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },
    onAuthStateChange(callback) {
      return client.auth.onAuthStateChange((event, session) => {
        callback({ event, user: session?.user ?? null, session });
      });
    },
    async signInWithOAuth(options) {
      const { data, error } = await client.auth.signInWithOAuth(options);
      if (error) throw error;
      return data;
    },
    async resetPasswordForEmail(email, redirectTo) {
      const { data, error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      return data;
    },
  };
}

module.exports = { createSupabaseProvider };
