/**
 * Quick local test – run after: npm install && npm run build
 * Usage: node test-local.js
 *
 * Uses Supabase with placeholder credentials. Init and getProvider() will work;
 * getUser()/getSession() may return null unless you use real Supabase credentials.
 */
const { auth } = require('./dist/cjs/index.js');

auth.init('supabase', {
  url: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
});

(async () => {
  console.log('isInitialized:', auth.isInitialized);
  console.log('getProvider().type:', auth.getProvider().type);
  console.log('getUser:', await auth.getUser());
  console.log('getSession:', await auth.getSession());
  console.log('OK – library works locally');
})();
