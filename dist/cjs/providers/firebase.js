"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFirebaseProvider = createFirebaseProvider;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
function createFirebaseProvider(credentials) {
    const { config, name } = credentials;
    if (!config || typeof config !== 'object') {
        throw new Error('Firebase auth requires "config" object (apiKey, authDomain, projectId, etc.)');
    }
    const app = (0, app_1.initializeApp)(config, name ?? undefined);
    const auth = (0, auth_1.getAuth)(app);
    return {
        type: 'firebase',
        getClient: () => app,
        getAuth: () => auth,
        async getUser() {
            return auth.currentUser;
        },
        async getSession() {
            const user = auth.currentUser;
            if (!user)
                return null;
            const token = await user.getIdToken();
            return { user, token };
        },
        async signInWithPassword(email, password) {
            const userCredential = await (0, auth_1.signInWithEmailAndPassword)(auth, email, password);
            return {
                user: userCredential.user,
                session: { token: await userCredential.user.getIdToken() },
            };
        },
        async signUp(email, password, _options = {}) {
            const userCredential = await (0, auth_1.createUserWithEmailAndPassword)(auth, email, password);
            return {
                user: userCredential.user,
                session: { token: await userCredential.user.getIdToken() },
            };
        },
        async signOut() {
            await (0, auth_1.signOut)(auth);
        },
        onAuthStateChange(callback) {
            return (0, auth_1.onAuthStateChanged)(auth, (user) => {
                callback({
                    event: user ? 'SIGNED_IN' : 'SIGNED_OUT',
                    user,
                    session: user ? { user } : null,
                });
            });
        },
    };
}
//# sourceMappingURL=firebase.js.map