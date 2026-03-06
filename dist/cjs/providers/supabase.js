"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupabaseProvider = createSupabaseProvider;
const supabase_js_1 = require("@supabase/supabase-js");
function createSupabaseProvider(credentials) {
    const { url, anonKey, serviceKey, restApiUrl } = credentials;
    if (!url || !anonKey) {
        throw new Error('Supabase auth requires "url" and "anonKey"');
    }
    const baseUrl = restApiUrl ?? url;
    const client = (0, supabase_js_1.createClient)(baseUrl, anonKey);
    let adminClient = null;
    if (serviceKey) {
        adminClient = (0, supabase_js_1.createClient)(baseUrl, serviceKey, {
            auth: { persistSession: false, autoRefreshToken: false },
        });
    }
    return {
        type: 'supabase',
        getClient: () => client,
        getAdminClient: () => adminClient,
        async getUser() {
            const { data: { user }, error } = await client.auth.getUser();
            if (error)
                throw error;
            return user;
        },
        async getSession() {
            const { data: { session }, error } = await client.auth.getSession();
            if (error)
                throw error;
            return session;
        },
        async signInWithPassword(email, password) {
            const { data, error } = await client.auth.signInWithPassword({ email, password });
            if (error)
                throw error;
            return data;
        },
        async signUp(email, password, options = {}) {
            const { data, error } = await client.auth.signUp({ email, password, ...options });
            if (error)
                throw error;
            return data;
        },
        async signOut() {
            const { error } = await client.auth.signOut();
            if (error)
                throw error;
        },
        onAuthStateChange(callback) {
            const { data } = client.auth.onAuthStateChange((event, session) => {
                callback({ event, user: session?.user ?? null, session });
            });
            return () => data.subscription.unsubscribe();
        },
        async signInWithOAuth(options) {
            const { data, error } = await client.auth.signInWithOAuth(options);
            if (error)
                throw error;
            return data;
        },
        async resetPasswordForEmail(email, redirectTo) {
            const { data, error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
            if (error)
                throw error;
            return data;
        },
    };
}
//# sourceMappingURL=supabase.js.map