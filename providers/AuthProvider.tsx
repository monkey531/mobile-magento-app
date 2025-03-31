import { useContext, createContext, type PropsWithChildren, useState } from 'react';
import { useStorageState } from '@/hooks/useStorage';
import { api, SERVER, ADMIN } from '@/constant/api';

const AuthContext = createContext<{
  signIn: (username: string, password: string) => void;
  signOut: () => void;
  auth: any | null;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: (username: string, password: string) => null,
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

const getFormKey = async (): Promise<{ adminKey: string, formKey: string; cookies: string }> => {
  try {
    const url = SERVER + '/WholeAdmin/admin/';
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Magento login page: ${response.status}`);
    }

    const text = await response.text();

    // Extract Admin Key (Security Token)
    const adminKeyMatch = text.match(/var BASE_URL = '([^']+\/key\/([^/]+)\/)';/);
    const adminKey = adminKeyMatch ? adminKeyMatch[2] : '';
    console.log(adminKey);

    // Extract form_key using RegExp
    const formKeyMatch = text.match(/<input name="form_key" type="hidden" value="(.*?)"/);
    const formKey = formKeyMatch ? formKeyMatch[1] : '';

    if (!formKey) {
      throw new Error('Form key not found');
    }

    // Extract cookies from response headers
    const cookies = response.headers.get('set-cookie') || '';

    if (!formKey) {
      throw new Error('Cookie key not found');
    }
    console.log(adminKey, formKey, cookies);
    return { adminKey, formKey, cookies  };
  } catch (error) {
    return { adminKey:'', formKey: '', cookies: '' };
  }
};

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const [auth, setAuth] = useState<any>(null);
  return (
    <AuthContext.Provider
      value={{
        signIn: async (username: string, password: string) => {
          // Perform sign-in logic here
          try {
            const {adminKey, formKey, cookies} = await getFormKey();
            console.log(adminKey, formKey, cookies);
            
            if(!adminKey || !formKey || !cookies) return;


            const headers = {
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
              "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36",
              "Cookie": "admin=0035mrb6pjocohfpg63cpi3qg4; other_cookie=value;",
              "Referer": `${SERVER}${ADMIN}`,
            };
            const response = await fetch(api.admin.dashboard + adminKey, {
              method: 'GET',
              headers: headers
            });

            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const text = await response.text();
            //console.log('Response:', text);

            //            setSession(data.token);

            //            setSession(data.username);
          } catch (err) {
            setSession(null);
            console.error('Error:', err);
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
