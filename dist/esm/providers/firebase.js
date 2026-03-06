import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, } from 'firebase/auth';
export function createFirebaseProvider(credentials) {
    const { config, name } = credentials;
    if (!config || typeof config !== 'object') {
        throw new Error('Firebase auth requires "config" object (apiKey, authDomain, projectId, etc.)');
    }
    const app = initializeApp(config, name ?? undefined);
    const auth = getAuth(app);
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return {
                user: userCredential.user,
                session: { token: await userCredential.user.getIdToken() },
            };
        },
        async signUp(email, password, _options = {}) {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return {
                user: userCredential.user,
                session: { token: await userCredential.user.getIdToken() },
            };
        },
        async signOut() {
            await signOut(auth);
        },
        onAuthStateChange(callback) {
            return onAuthStateChanged(auth, (user) => {
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