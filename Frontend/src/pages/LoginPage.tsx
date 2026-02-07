import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@api/AuthApi";
import { loginWithGoogle, loginWithApple } from "@api/OAuthApi";
import logo from "../assets/chirp.svg";
import OAuthButton from "../components/OAuthButton";

// Declare Google API types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, options: any) => void;
        };
      };
    };
    AppleID?: {
      auth: {
        init: (config: any) => void;
        signIn: () => Promise<any>;
      };
    };
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await loginUser({ username, password });
      setSuccess(response.message || "Logged in successfully");
      setTimeout(() => navigate("/feed"), 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      setError("Google Sign-In is not configured. Please set VITE_GOOGLE_CLIENT_ID");
      return;
    }

    // Load Google Sign-In script if not already loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => initializeGoogleSignIn(clientId);
      document.head.appendChild(script);
    } else {
      initializeGoogleSignIn(clientId);
    }
  };

  const initializeGoogleSignIn = (clientId: string) => {
    window.google?.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCallback,
    });
    window.google?.accounts.id.prompt();
  };

  const handleGoogleCallback = async (response: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await loginWithGoogle(response.credential);
      localStorage.setItem("chirp_token", result.token);
      setSuccess("Google sign-in successful!");
      setTimeout(() => navigate("/feed"), 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    const clientId = import.meta.env.VITE_APPLE_CLIENT_ID;
    
    if (!clientId) {
      setError("Apple Sign-In is not configured. Please set VITE_APPLE_CLIENT_ID");
      return;
    }

    // Load Apple Sign-In script if not already loaded
    if (!window.AppleID) {
      const script = document.createElement("script");
      script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
      script.async = true;
      script.onload = () => initializeAppleSignIn(clientId);
      document.head.appendChild(script);
    } else {
      initializeAppleSignIn(clientId);
    }
  };

  const initializeAppleSignIn = async (clientId: string) => {
    window.AppleID?.auth.init({
      clientId: clientId,
      scope: "name email",
      redirectURI: window.location.origin + "/login",
      usePopup: true,
    });

    try {
      const data = await window.AppleID?.auth.signIn();
      await handleAppleCallback(data);
    } catch (err) {
      console.error("Apple sign-in error:", err);
      setError("Apple sign-in was cancelled or failed");
    }
  };

  const handleAppleCallback = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await loginWithApple(data.authorization.id_token);
      localStorage.setItem("chirp_token", result.token);
      setSuccess("Apple sign-in successful!");
      setTimeout(() => navigate("/feed"), 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Apple sign-in failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img className="login-logo" src={logo} alt="Chirp logo" />
        <h1>Welcome back</h1>
        <p className="subtitle">Log in to your Chirp account</p>

        <div className="oauth-section">
          <OAuthButton provider="google" onClick={handleGoogleLogin} />
          <OAuthButton provider="apple" onClick={handleAppleLogin} />
        </div>

        <div className="divider">
          <span>or</span>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <div className="alert error">{error}</div>}
          {success && <div className="alert success">{success}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="login-footer">
          <span>Don't have an account?</span>
          <button type="button" className="link-button" onClick={() => navigate("/register")}>
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
