import type { SupabaseCredentials } from '../types.js';
import type { AuthProvider } from '../types.js';
import { createClient } from '@supabase/supabase-js';

export function createSupabaseProvider(credentials: SupabaseCredentials): AuthProvider & {
  getAdminClient(): ReturnType<typeof createClient> | null;
  signInWithOAuth(options: Record<string, unknown>): Promise<unknown>;
  resetPasswordForEmail(email: string, redirectTo?: string): Promise<unknown>;
} {
  const { url, anonKey, serviceKey, restApiUrl } = credentials;

  if (!url || !anonKey) {
    throw new Error('Supabase auth requires "url" and "anonKey"');
  }

  const baseUrl = restApiUrl ?? url;
  const client = createClient(baseUrl, anonKey);
  let adminClient: ReturnType<typeof createClient> | null = null;

  if (serviceKey) {
    adminClient = createClient(baseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return {
    type: 'supabase',
    getClient: () => client,
    getAdminClient: () => adminClient,
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
    async signInWithPassword(email: string, password: string) {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async signUp(email: string, password: string, options: Record<string, unknown> = {}) {
      const { data, error } = await client.auth.signUp({ email, password, ...options });
      if (error) throw error;
      return data;
    },
    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) throw error;
    },
    onAuthStateChange(callback: (payload: { event: string; user: unknown; session: unknown }) => void) {
      const { data } = client.auth.onAuthStateChange((event, session) => {
        callback({ event, user: session?.user ?? null, session });
      });
      return () => data.subscription.unsubscribe();
    },
    async signInWithOAuth(options: Record<string, unknown>) {
      const { data, error } = await client.auth.signInWithOAuth(options as Parameters<typeof client.auth.signInWithOAuth>[0]);
      if (error) throw error;
      return data;
    },
    async resetPasswordForEmail(email: string, redirectTo?: string) {
      const { data, error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      return data;
    },
  };
}
