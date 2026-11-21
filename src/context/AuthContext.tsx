
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

export interface User {
    id: string;
    name: string;
    email: string;
    role: "CUSTOMER" | "ADMIN";
}

interface StoredUser extends User {
    password: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => boolean;
    signup: (name: string, email: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = "shopora_users";
const SESSION_KEY = "shopora_session";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const savedSession = localStorage.getItem(SESSION_KEY);

        if (savedSession) {
            try {
                setUser(JSON.parse(savedSession) as User);
            } catch {
                localStorage.removeItem(SESSION_KEY);
            }
        }
    }, []);

    const getUsers = (): StoredUser[] => {
        try {
            return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
        } catch {
            return [];
        }
    };

    const login = (email: string, password: string): boolean => {
        const users = getUsers();

        const existingUser = users.find(
            (item) =>
                item.email.toLowerCase() === email.trim().toLowerCase() &&
                item.password === password
        );

        if (!existingUser) {
            return false;
        }

        const { password: _password, ...safeUser } = existingUser;

        setUser(safeUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));

        return true;
    };

    const signup = (
        name: string,
        email: string,
        password: string
    ): boolean => {
        const users = getUsers();

        const normalizedEmail = email.trim().toLowerCase();

        const alreadyExists = users.some(
            (item) => item.email.toLowerCase() === normalizedEmail
        );

        if (alreadyExists) {
            return false;
        }

        const newUser: StoredUser = {
            id: crypto.randomUUID(),
            name: name.trim(),
            email: normalizedEmail,
            password,
            role: "CUSTOMER",
        };

        localStorage.setItem(
            USERS_KEY,
            JSON.stringify([...users, newUser])
        );

        const { password: _password, ...safeUser } = newUser;

        setUser(safeUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));

        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(SESSION_KEY);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: Boolean(user),
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
