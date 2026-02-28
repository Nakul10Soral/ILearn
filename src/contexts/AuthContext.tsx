import React, { createContext, useContext, useState } from 'react';
import type { User } from '../lib/types.ts';

type AuthContextType = {
    user: User | undefined;
    isLoading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    login: (userData: User, token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | undefined>(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : undefined;
    });
    const [isLoading, setIsLoading] = useState(false);

    const login = (userData: User, token: string) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(undefined);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                setLoading: setIsLoading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
