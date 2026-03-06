import { createSupabaseProvider } from './providers/supabase.js';
import { createFirebaseProvider } from './providers/firebase.js';
import type { AuthCredentials, AuthProvider, Auth } from './types.js';
import type { SupabaseCredentials } from './types.js';
import type { FirebaseCredentials } from './types.js';

const PROVIDERS = {
  supabase: createSupabaseProvider as (c: SupabaseCredentials) => AuthProvider,
  firebase: createFirebaseProvider as (c: FirebaseCredentials) => AuthProvider,
} as const;

let currentProvider: AuthProvider | null = null;

export const auth: Auth = {
  init(provider: 'supabase' | 'firebase', credentials: AuthCredentials): AuthProvider {
    if (provider !== 'supabase' && provider !== 'firebase') {
      throw new Error(`Unknown auth provider: "${provider}". Use "supabase" or "firebase".`);
    }
    if (!credentials || typeof credentials !== 'object') {
      throw new Error('auth.init() requires a credentials object as the second argument');
    }
    const factory = PROVIDERS[provider];
    currentProvider = factory(credentials as SupabaseCredentials & FirebaseCredentials);
    return currentProvider;
  },

  getProvider(): AuthProvider {
    if (!currentProvider) {
      throw new Error('Auth not initialized. Call auth.init(provider, credentials) first.');
    }
    return currentProvider;
  },

  get isInitialized(): boolean {
    return currentProvider !== null;
  },

  getClient(): unknown {
    return this.getProvider().getClient();
  },

  async getUser(): Promise<unknown | null> {
    return this.getProvider().getUser();
  },

  async getSession(): Promise<unknown | null> {
    return this.getProvider().getSession();
  },

  async signInWithPassword(email: string, password: string): Promise<unknown> {
    return this.getProvider().signInWithPassword(email, password);
  },

  async signUp(email: string, password: string, options?: Record<string, unknown>): Promise<unknown> {
    return this.getProvider().signUp(email, password, options ?? {});
  },

  async signOut(): Promise<void> {
    return this.getProvider().signOut();
  },

  onAuthStateChange(callback: (payload: { event: string; user: unknown; session: unknown }) => void): () => void {
    return this.getProvider().onAuthStateChange(callback);
  },

  signInWithOAuth(options: Record<string, unknown>): Promise<unknown> {
    const p = this.getProvider() as AuthProvider & { signInWithOAuth?: (o: Record<string, unknown>) => Promise<unknown> };
    if (p.signInWithOAuth) return p.signInWithOAuth(options);
    throw new Error('signInWithOAuth is only available for Supabase auth');
  },

  resetPasswordForEmail(email: string, redirectTo?: string): Promise<unknown> {
    const p = this.getProvider() as AuthProvider & { resetPasswordForEmail?: (e: string, r?: string) => Promise<unknown> };
    if (p.resetPasswordForEmail) return p.resetPasswordForEmail(email, redirectTo);
    throw new Error('resetPasswordForEmail is only available for Supabase auth');
  },

  getAdminClient(): unknown {
    const p = this.getProvider() as AuthProvider & { getAdminClient?: () => unknown };
    if (p.getAdminClient) return p.getAdminClient();
    return null;
  },

  getAuth(): unknown {
    const p = this.getProvider() as AuthProvider & { getAuth?: () => unknown };
    if (p.getAuth) return p.getAuth();
    return null;
  },
};

export type {
  Auth,
  AuthCredentials,
  AuthProvider,
  AuthStatePayload,
  AuthType,
  FirebaseConfig,
  FirebaseCredentials,
  SupabaseCredentials,
} from './types.js';
