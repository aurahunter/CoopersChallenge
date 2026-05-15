import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useAuth } from "../../context/useAuth.js";
import { useFocusTrap } from "../../hooks/useFocusTrap.js";
import AuthPanel from "./AuthPanel.jsx";

/**
 * Modal de login alinhado ao protótipo (sobre o conteúdo).
 */
export default function LoginModal({ open, onClose }) {
  const { login } = useAuth();
  const titleId = useId();
  const emailInputRef = useRef(null);
  const dialogRef = useRef(null);
  useFocusTrap(dialogRef, open);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const closeModal = useCallback(() => {
    setEmail("");
    setPassword("");
    setError("");
    setSubmitting(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(e) {
      if (e.key === "Escape") {
        closeModal();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = requestAnimationFrame(() => {
      emailInputRef.current?.focus();
    });
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      cancelAnimationFrame(t);
    };
  }, [open, closeModal]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      closeModal();
      window.location.hash = "todo-list";
    } catch (err) {
      setError(err.message || "Não foi possível entrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="coopers-modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="coopers-modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="coopers-modal__close"
          onClick={closeModal}
          aria-label="Fechar"
        >
          close
        </button>

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
          footerLinkOnClick={closeModal}
          fieldIdPrefix="coopers-login"
        />
      </div>
    </div>
  );
}
