export function createCustomProvider(credentials) {
    const { adapter, client } = credentials;
    if (!adapter || typeof adapter !== 'object') {
        throw new Error('Custom auth requires "adapter" object with methods like getUser, signIn, signOut');
    }
    const getClient = () => client ?? null;
    const getUser = typeof adapter.getUser === 'function'
        ? adapter.getUser.bind(adapter)
        : async () => null;
    const getSession = typeof adapter.getSession === 'function'
        ? adapter.getSession.bind(adapter)
        : async () => null;
    const signInWithPassword = typeof adapter.signInWithPassword === 'function'
        ? adapter.signInWithPassword.bind(adapter)
        : async () => {
            throw new Error('Custom adapter does not implement signInWithPassword');
        };
    const signUp = typeof adapter.signUp === 'function'
        ? adapter.signUp.bind(adapter)
        : async () => {
            throw new Error('Custom adapter does not implement signUp');
        };
    const signOut = typeof adapter.signOut === 'function'
        ? adapter.signOut.bind(adapter)
        : async () => { };
    const onAuthStateChange = typeof adapter.onAuthStateChange === 'function'
        ? adapter.onAuthStateChange.bind(adapter)
        : (_callback) => () => { };
    return {
        type: 'custom',
        getClient,
        getUser,
        getSession,
        signInWithPassword,
        signUp,
        signOut,
        onAuthStateChange,
    };
}
//# sourceMappingURL=custom.js.map