import { useContext, createContext, type PropsWithChildren, useState } from 'react';
import { useStorageState } from '@/hooks/useStorage';
import { api } from '@/constant/api';

const AuthContext = createContext<{
  signIn: (email: string, password: string) => void;
  signOut: () => void;
  auth: any | null;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: (email: string, password: string) => null,
  signOut: () => null,
  auth: null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const [auth, setAuth] = useState<any>(null);
  return (
    <AuthContext.Provider
      value={{
        signIn: async (email: string, password: string) => {
          // Perform sign-in logic here
          try {
            const response = await fetch(api.login, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN' // Optional
              },
              body: JSON.stringify({ email: email, password: password })
            });

            const data = await response.json();
            console.log(data);
            setSession(data.token);

//            setSession(data.email);
          } catch (err) {

          }
        },
        signOut: () => {
          setSession(null);
        },
        auth,
        session,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
