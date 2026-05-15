import { useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import AuthPanel from "../components/landing/AuthPanel.jsx";
import "../components/landing/landing.css";

export default function RegisterPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const titleId = useId();
  const emailInputRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
      window.location.hash = "todo-list";
    }
  }, [user, navigate]);

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
      await register(email.trim(), password);
      navigate("/", { replace: true });
      window.location.hash = "todo-list";
    } catch (err) {
      setError(err.message || "Não foi possível cadastrar");
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
            variant="signUp"
            titleId={titleId}
            email={email}
            password={password}
            onEmailChange={(e) => setEmail(e.target.value)}
            onPasswordChange={(e) => setPassword(e.target.value)}
            error={error}
            submitting={submitting}
            onSubmit={handleSubmit}
            emailInputRef={emailInputRef}
            fieldIdPrefix="coopers-register"
            footerTo="/login"
          />
        </div>
      </div>
    </div>
  );
}
