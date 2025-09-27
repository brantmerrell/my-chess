import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { lichessAuth } from "../../services/lichess/auth";
import "./AuthCallback.css";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error");
      const errorDescription = params.get("error_description");

      if (error) {
        setStatus("error");
        setErrorMessage(errorDescription || "Authorization failed");
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      if (!code || !state) {
        setStatus("error");
        setErrorMessage("Missing authorization parameters");
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      try {
        const success = await lichessAuth.handleCallback(code, state);

        if (success) {
          setStatus("success");
          setTimeout(() => navigate("/"), 1500);
        } else {
          setStatus("error");
          setErrorMessage("Failed to complete authentication");
          setTimeout(() => navigate("/"), 3000);
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage("An error occurred during authentication");
        console.error("Auth callback error:", err);
        setTimeout(() => navigate("/"), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="auth-callback">
      {status === "processing" && (
        <>
          <div className="auth-callback__title">
            Completing authentication...
          </div>
          <div className="auth-callback__icon">♔</div>
        </>
      )}

      {status === "success" && (
        <>
          <div className="auth-callback__title auth-callback__title--success">
            Authentication successful!
          </div>
          <div className="auth-callback__subtitle">Redirecting...</div>
        </>
      )}

      {status === "error" && (
        <>
          <div className="auth-callback__title auth-callback__title--error">
            Authentication failed
          </div>
          <div className="auth-callback__error-message">{errorMessage}</div>
          <div className="auth-callback__redirect-notice">
            Redirecting to home...
          </div>
        </>
      )}
    </div>
  );
};

export default AuthCallback;
