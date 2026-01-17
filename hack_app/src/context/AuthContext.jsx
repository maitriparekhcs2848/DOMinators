import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper to process session and fetch role
    const handleSession = async (currentSession) => {
        if (!currentSession?.user) {
            setSession(null);
            setUser(null);
            return;
        }

        try {
            // Fetch user role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', currentSession.user.id)
                .single();

            const userWithRole = { ...currentSession.user, role: profile?.role || 'patient' };
            setSession(currentSession);
            setUser(userWithRole);
        } catch (error) {
            console.error("Error processing session:", error);
            // Fallback to basic user if profile fetch fails
            setSession(currentSession);
            setUser(currentSession.user);
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                setLoading(true);
                // 1. Initial Check
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                if (mounted && initialSession) {
                    await handleSession(initialSession);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (mounted) {
                if (_event === 'SIGNED_OUT') {
                    setSession(null);
                    setUser(null);
                    setLoading(false);
                } else if (newSession) {
                    await handleSession(newSession);
                    setLoading(false);
                } else {
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        // State updates will be handled by onAuthStateChange
        return { data, error };
    };

    const signUp = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        return { data, error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
