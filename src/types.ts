export type AuthType = 'supabase' | 'firebase';

export interface SupabaseCredentials {
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
  config: FirebaseConfig;
  name?: string;
}

export interface AuthStatePayload {
  event: string;
  user: unknown | null;
  session: unknown;
}

export type AuthCredentials = SupabaseCredentials | FirebaseCredentials;

export interface AuthProvider {
  type: AuthType;
  getClient(): unknown;
  getUser(): Promise<unknown | null>;
  getSession(): Promise<unknown | null>;
  signInWithPassword(email: string, password: string): Promise<unknown>;
  signUp(email: string, password: string, options?: Record<string, unknown>): Promise<unknown>;
  signOut(): Promise<void>;
  onAuthStateChange(callback: (payload: AuthStatePayload) => void): () => void;
}

export interface SupabaseAuthProvider extends AuthProvider {
  type: 'supabase';
  getAdminClient(): unknown;
  signInWithOAuth(options: Record<string, unknown>): Promise<unknown>;
  resetPasswordForEmail(email: string, redirectTo?: string): Promise<unknown>;
}

export interface FirebaseAuthProvider extends AuthProvider {
  type: 'firebase';
  getAuth(): unknown;
}

export interface Auth {
  init(provider: 'supabase', credentials: SupabaseCredentials): AuthProvider;
  init(provider: 'firebase', credentials: FirebaseCredentials): AuthProvider;
  getProvider(): AuthProvider;
  readonly isInitialized: boolean;
  getClient(): unknown;
  getUser(): Promise<unknown | null>;
  getSession(): Promise<unknown | null>;
  signInWithPassword(email: string, password: string): Promise<unknown>;
  signUp(email: string, password: string, options?: Record<string, unknown>): Promise<unknown>;
  signOut(): Promise<void>;
  onAuthStateChange(callback: (payload: AuthStatePayload) => void): () => void;
  signInWithOAuth(options: Record<string, unknown>): Promise<unknown>;
  resetPasswordForEmail(email: string, redirectTo?: string): Promise<unknown>;
  getAdminClient(): unknown;
  getAuth(): unknown;
}
