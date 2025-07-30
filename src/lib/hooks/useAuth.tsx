"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthState } from "@/types";
import {
  signIn,
  signUp,
  confirmSignUp,
  parseJwtToken,
  SignInParams,
  SignUpParams,
  ConfirmSignUpParams,
} from "@/lib/aws/auth";

// Auth actions
type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SIGN_OUT" };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null,
      };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "SIGN_OUT":
      return {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

// Auth context type
interface AuthContextType extends AuthState {
  signIn: (params: SignInParams) => Promise<boolean>;
  signUp: (params: SignUpParams) => Promise<boolean>;
  confirmSignUp: (params: ConfirmSignUpParams) => Promise<boolean>;
  signOut: () => void;
  clearError: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const idToken = localStorage.getItem("idToken");

      if (accessToken && idToken) {
        const tokenData = parseJwtToken(idToken);

        if (tokenData && tokenData.exp * 1000 > Date.now()) {
          // Token is still valid
          const user: User = {
            id: tokenData.sub,
            username: tokenData.preferred_username || tokenData.email,
            email: tokenData.email,
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            isOnline: true,
          };

          dispatch({ type: "SET_USER", payload: user });
        } else {
          // Token expired, clear storage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("idToken");
          localStorage.removeItem("refreshToken");
          dispatch({ type: "SET_USER", payload: null });
        }
      } else {
        dispatch({ type: "SET_USER", payload: null });
      }
    } catch (error) {
      console.error("Error checking session:", error);
      dispatch({ type: "SET_USER", payload: null });
    }
  };

  const handleSignIn = async (params: SignInParams): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const result = await signIn(params);

      if (result.success && result.idToken) {
        // Store tokens
        localStorage.setItem("accessToken", result.accessToken!);
        localStorage.setItem("idToken", result.idToken);
        localStorage.setItem("refreshToken", result.refreshToken!);

        // Parse user data from token
        const tokenData = parseJwtToken(result.idToken);

        if (tokenData) {
          const user: User = {
            id: tokenData.sub,
            username: tokenData.preferred_username || tokenData.email,
            email: tokenData.email,
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            isOnline: true,
          };

          dispatch({ type: "SET_USER", payload: user });
          return true;
        }
      }

      dispatch({
        type: "SET_ERROR",
        payload: result.error || "Sign in failed",
      });
      return false;
    } catch (error: unknown) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Sign in failed",
      });
      return false;
    }
  };

  const handleSignUp = async (params: SignUpParams): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const result = await signUp(params);

      if (result.success) {
        dispatch({ type: "SET_LOADING", payload: false });
        return true;
      }

      dispatch({
        type: "SET_ERROR",
        payload: result.error || "Sign up failed",
      });
      return false;
    } catch (error: unknown) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Sign up failed",
      });
      return false;
    }
  };

  const handleConfirmSignUp = async (
    params: ConfirmSignUpParams
  ): Promise<boolean> => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      const result = await confirmSignUp(params);

      if (result.success) {
        dispatch({ type: "SET_LOADING", payload: false });
        return true;
      }

      dispatch({
        type: "SET_ERROR",
        payload: result.error || "Confirmation failed",
      });
      return false;
    } catch (error: unknown) {
      dispatch({
        type: "SET_ERROR",
        payload: error instanceof Error ? error.message : "Confirmation failed",
      });
      return false;
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("idToken");
    localStorage.removeItem("refreshToken");
    dispatch({ type: "SIGN_OUT" });
  };

  const clearError = () => {
    dispatch({ type: "SET_ERROR", payload: null });
  };

  const value: AuthContextType = {
    ...state,
    signIn: handleSignIn,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    signOut: handleSignOut,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
