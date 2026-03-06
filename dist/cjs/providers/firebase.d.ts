import { type Auth } from 'firebase/auth';
import type { FirebaseCredentials } from '../types.js';
import type { AuthProvider } from '../types.js';
export declare function createFirebaseProvider(credentials: FirebaseCredentials): AuthProvider & {
    getAuth(): Auth;
};
//# sourceMappingURL=firebase.d.ts.map