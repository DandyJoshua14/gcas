/**
 * Quick local test – run after: npm install && npm run build
 * Usage: node test-local.js
 */
const { auth } = require('./dist/cjs/index.js');

auth.init({
  type: 'custom',
  adapter: {
    async getUser() {
      return { id: '1', email: 'test@example.com' };
    },
    async getSession() {
      return { user: { id: '1' } };
    },
    async signInWithPassword(email, password) {
      return { user: { id: '1', email }, session: {} };
    },
    async signUp() {
      return { user: { id: '1' }, session: {} };
    },
    async signOut() {},
    onAuthStateChange() {
      return () => {};
    },
  },
});

(async () => {
  console.log('isInitialized:', auth.isInitialized);
  console.log('getUser:', await auth.getUser());
  console.log('getSession:', await auth.getSession());
  console.log('OK – library works locally');
})();
