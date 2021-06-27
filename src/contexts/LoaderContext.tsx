import { createContext, ReactElement, ReactNode } from "react";

export interface LoaderContextProps {
  changeLoadingState: (loadingState: boolean) => void;
  loading: boolean;
}

export const LoaderContext = createContext<LoaderContextProps>(
  {} as LoaderContextProps
);

interface LoaderContextProviderProps extends LoaderContextProps {
  children: ReactNode;
}

export function LoaderContextProvider({
  changeLoadingState,
  children,
  loading,
}: LoaderContextProviderProps): ReactElement {
  return (
    <LoaderContext.Provider value={{ changeLoadingState, loading }}>
      {children}
    </LoaderContext.Provider>
  );
}
