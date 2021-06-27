import { useContext } from "react";
import { LoaderContext, LoaderContextProps } from "../contexts/LoaderContext";

export function useLoader(): LoaderContextProps {
  return useContext(LoaderContext);
}
