import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import AuthPanel from "../components/landing/AuthPanel.jsx";
import "../components/landing/landing.css";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const titleId = useId();
  const emailInputRef = useRef(null);
  const from = location.state?.from;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(from || "/app", { replace: true });
    }
  }, [user, from, navigate]);

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      emailInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(t);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      if (from) {
        navigate(from, { replace: true });
        return;
      }
      navigate("/", { replace: true });
      window.location.hash = "todo-list";
    } catch (err) {
      setError(err.message || "Não foi possível entrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="coopers">
      <div className="coopers-auth-page">
        <div className="coopers-modal coopers-modal--page" aria-labelledby={titleId}>
          <Link to="/" className="coopers-modal__close">
            close
          </Link>

          <AuthPanel
            variant="signIn"
            titleId={titleId}
            email={email}
            password={password}
            onEmailChange={(e) => setEmail(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            error={error}
            submitting={submitting}
            onSubmit={handleSubmit}
            emailInputRef={emailInputRef}
            fieldIdPrefix="coopers-login"
          />
        </div>
      </div>
    </div>
  );
}
