import { createSupabaseProvider } from './providers/supabase.js';
import { createFirebaseProvider } from './providers/firebase.js';
import { createCustomProvider } from './providers/custom.js';
import type { AuthCredentials, AuthProvider, Auth } from './types.js';

const PROVIDERS = {
  supabase: createSupabaseProvider as (c: AuthCredentials) => AuthProvider,
  firebase: createFirebaseProvider as (c: AuthCredentials) => AuthProvider,
  custom: createCustomProvider as (c: AuthCredentials) => AuthProvider,
} as const;

let currentProvider: AuthProvider | null = null;

export const auth: Auth = {
  init(credentials: AuthCredentials): AuthProvider {
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

  getProvider(): AuthProvider {
    if (!currentProvider) {
      throw new Error('Auth not initialized. Call auth.init(credentials) first.');
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
  CustomAuthAdapter,
  CustomCredentials,
  FirebaseConfig,
  FirebaseCredentials,
  SupabaseCredentials,
} from './types.js';
