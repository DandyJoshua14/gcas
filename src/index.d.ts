export type AuthType = 'supabase' | 'firebase' | 'custom';

export interface SupabaseCredentials {
  type: 'supabase';
  url: string;
  anonKey: string;
  serviceKey?: string;
  restApiUrl?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

export interface FirebaseCredentials {
  type: 'firebase';
  config: FirebaseConfig;
  name?: string;
}

export interface CustomAuthAdapter {
  getUser?(): Promise<unknown | null>;
  getSession?(): Promise<unknown | null>;
  signInWithPassword?(email: string, password: string): Promise<unknown>;
  signUp?(email: string, password: string, options?: Record<string, unknown>): Promise<unknown>;
  signOut?(): Promise<void>;
  onAuthStateChange?(callback: (payload: { event: string; user: unknown; session: unknown }) => void): () => void;
}

export interface CustomCredentials {
  type: 'custom';
  adapter: CustomAuthAdapter;
  client?: unknown;
}

export type AuthCredentials = SupabaseCredentials | FirebaseCredentials | CustomCredentials;

export interface AuthProvider {
  type: AuthType;
  getClient(): unknown;
  getUser(): Promise<unknown | null>;
  getSession(): Promise<unknown | null>;
  signInWithPassword(email: string, password: string): Promise<unknown>;
  signUp(email: string, password: string, options?: Record<string, unknown>): Promise<unknown>;
  signOut(): Promise<void>;
  onAuthStateChange(callback: (payload: { event: string; user: unknown; session: unknown }) => void): () => void;
}

export interface Auth {
  init(credentials: AuthCredentials): AuthProvider;
  getProvider(): AuthProvider;
  readonly isInitialized: boolean;
  getClient(): unknown;
  getUser(): Promise<unknown | null>;
  getSession(): Promise<unknown | null>;
  signInWithPassword(email: string, password: string): Promise<unknown>;
  signUp(email: string, password: string, options?: Record<string, unknown>): Promise<unknown>;
  signOut(): Promise<void>;
  onAuthStateChange(callback: (payload: { event: string; user: unknown; session: unknown }) => void): () => void;
  signInWithOAuth?(options: Record<string, unknown>): Promise<unknown>;
  resetPasswordForEmail?(email: string, redirectTo?: string): Promise<unknown>;
  getAdminClient?(): unknown;
  getAuth?(): unknown;
}

export const auth: Auth;
