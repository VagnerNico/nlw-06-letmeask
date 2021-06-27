import { createContext, ReactElement, ReactNode } from "react";

export interface User {
  avatar: string;
  id: string;
  name: string;
}

export interface AuthContextProps {
  user?: User;
  signInWithGoogle: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>(
  {} as AuthContextProps
);

interface AuthContextProviderProps extends AuthContextProps {
  children: ReactNode;
}

export function AuthContextProvider({
  children,
  user,
  signInWithGoogle,
}: AuthContextProviderProps): ReactElement {
  return (
    <AuthContext.Provider value={{ user, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}
