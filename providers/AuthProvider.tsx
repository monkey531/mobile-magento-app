import { useEffect, useState, createContext, type PropsWithChildren } from 'react';
import { getStorageItemAsync, setStorageItemAsync } from '../utils/storage';
import { router } from 'expo-router';

export const AuthContext = createContext<{
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  tokenLogin: () => void;
  session: { auth: any | null; isLoading: boolean };
  token?: string | null;
}>({
  signIn: async () => { },
  signOut: () => null,
  tokenLogin: () => null,
  session: { auth: null, isLoading: false },
  token: null,
});

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<any | null>({auth: null, isLoading: false});
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const initToken = async () => {
      const storedToken = await getStorageItemAsync('token');
      setToken(storedToken);
    };
    initToken();
  }, []);

  const tokenLogin = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://192.168.135.25:5000/api/token', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          token: token
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      console.log("tokenLogin-53:   ", data);
      setSession({ auth: data, isLoading: false });


    } catch (error) {
      console.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSession({ auth: null, isLoading: false });
    }
  }

  useEffect(() => {
    console.log(token);
    if (token) {
      tokenLogin();
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{
      session,
      tokenLogin,
      signIn: async (email: string, password: string) => {
        console.log(email, password);
        setSession({ auth: null, isLoading: true });
        try {
          const response = await fetch('http://192.168.135.25:5000/api/login', {
            method: 'POST',
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email: email,
              password: password
            }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }

         setToken(data.token);
         await setStorageItemAsync('token', data.token);

        } catch (error) {
          console.error(error instanceof Error ? error.message : 'An error occurred');
        } finally {
          setSession({ auth: null, isLoading: false });
        }
      },
      signOut: () => {
        setSession({ auth: null, isLoading: false });
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
}