import { createContext, useContext, useState } from 'react';
import { mergeProfile, normalizeHealthProfile } from '../Function/functionPerfil';

const AuthContext = createContext(null);

// Demonstração local: contas e sessão existem somente enquanto o app está aberto.
export function AuthProvider({ children }) {
    const [accounts, setAccounts] = useState([]);
    const [user, setUser] = useState(null);

    function register({ name, email, password, weight, age, bloodType }) {
        const normalized = email.trim().toLowerCase();
        if (accounts.some(account => account.email === normalized)) {
            throw new Error('Este e-mail já está cadastrado.');
        }
        const health = normalizeHealthProfile({ weight, age, bloodType });
        setAccounts(previous => [...previous, {
            name: name.trim(), email: normalized, password, photo: null, ...health,
        }]);
    }

    function login(email, password) {
        const account = accounts.find(item =>
            item.email === email.trim().toLowerCase() && item.password === password);
        if (!account) throw new Error('E-mail ou senha incorretos. Cadastre-se primeiro.');
        const { password: secret, ...profile } = account;
        setUser(profile);
    }

    function updateProfile(changes) {
        const profile = mergeProfile(user, changes);
        setAccounts(previous => previous.map(account =>
            account.email === user.email ? { ...account, ...profile } : account));
        setUser(profile);
    }

    return (
        <AuthContext.Provider value={{ user, register, login, updateProfile, logout: () => setUser(null) }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
