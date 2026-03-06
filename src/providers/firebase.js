'use strict';

/**
 * Firebase auth provider.
 * Requires peer dependency: firebase
 * @param {object} credentials
 * @param {object} credentials.config - Firebase config object (apiKey, authDomain, projectId, etc.)
 * @param {string} [credentials.name] - Optional Firebase app name for multiple apps
 */
function createFirebaseProvider(credentials) {
  const { initializeApp } = require('firebase/app');
  const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } = require('firebase/auth');

  const { config, name } = credentials;

  if (!config || typeof config !== 'object') {
    throw new Error('Firebase auth requires "config" object (apiKey, authDomain, projectId, etc.)');
  }

  const app = initializeApp(config, name || undefined);
  const auth = getAuth(app);

  return {
    type: 'firebase',
    getClient() {
      return app;
    },
    getAuth() {
      return auth;
    },
    async getUser() {
      return auth.currentUser;
    },
    async getSession() {
      const user = auth.currentUser;
      if (!user) return null;
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
    async signUp(email, password, options = {}) {
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
        callback({ event: user ? 'SIGNED_IN' : 'SIGNED_OUT', user, session: user ? { user } : null });
      });
    },
  };
}

module.exports = { createFirebaseProvider };
