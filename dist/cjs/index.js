"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const supabase_js_1 = require("./providers/supabase.js");
const firebase_js_1 = require("./providers/firebase.js");
const PROVIDERS = {
    supabase: supabase_js_1.createSupabaseProvider,
    firebase: firebase_js_1.createFirebaseProvider,
};
let currentProvider = null;
exports.auth = {
    init(provider, credentials) {
        if (provider !== 'supabase' && provider !== 'firebase') {
            throw new Error(`Unknown auth provider: "${provider}". Use "supabase" or "firebase".`);
        }
        if (!credentials || typeof credentials !== 'object') {
            throw new Error('auth.init() requires a credentials object as the second argument');
        }
        const factory = PROVIDERS[provider];
        currentProvider = factory(credentials);
        return currentProvider;
    },
    getProvider() {
        if (!currentProvider) {
            throw new Error('Auth not initialized. Call auth.init(provider, credentials) first.');
        }
        return currentProvider;
    },
    get isInitialized() {
        return currentProvider !== null;
    },
    getClient() {
        return this.getProvider().getClient();
    },
    async getUser() {
        return this.getProvider().getUser();
    },
    async getSession() {
        return this.getProvider().getSession();
    },
    async signInWithPassword(email, password) {
        return this.getProvider().signInWithPassword(email, password);
    },
    async signUp(email, password, options) {
        return this.getProvider().signUp(email, password, options ?? {});
    },
    async signOut() {
        return this.getProvider().signOut();
    },
    onAuthStateChange(callback) {
        return this.getProvider().onAuthStateChange(callback);
    },
    signInWithOAuth(options) {
        const p = this.getProvider();
        if (p.signInWithOAuth)
            return p.signInWithOAuth(options);
        throw new Error('signInWithOAuth is only available for Supabase auth');
    },
    resetPasswordForEmail(email, redirectTo) {
        const p = this.getProvider();
        if (p.resetPasswordForEmail)
            return p.resetPasswordForEmail(email, redirectTo);
        throw new Error('resetPasswordForEmail is only available for Supabase auth');
    },
    getAdminClient() {
        const p = this.getProvider();
        if (p.getAdminClient)
            return p.getAdminClient();
        return null;
    },
    getAuth() {
        const p = this.getProvider();
        if (p.getAuth)
            return p.getAuth();
        return null;
    },
};
//# sourceMappingURL=index.js.map