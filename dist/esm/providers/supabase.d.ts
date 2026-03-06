import type { SupabaseCredentials } from '../types.js';
import type { AuthProvider } from '../types.js';
import { createClient } from '@supabase/supabase-js';
export declare function createSupabaseProvider(credentials: SupabaseCredentials): AuthProvider & {
    getAdminClient(): ReturnType<typeof createClient> | null;
    signInWithOAuth(options: Record<string, unknown>): Promise<unknown>;
    resetPasswordForEmail(email: string, redirectTo?: string): Promise<unknown>;
};
//# sourceMappingURL=supabase.d.ts.map