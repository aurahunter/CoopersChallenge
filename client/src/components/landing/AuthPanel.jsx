import { Link } from "react-router-dom";
import signInAvatar from "../../assets/signinavatar.png";

const COPY = {
  signIn: {
    title: "Sign in",
    subtitle: "to access your list",
    submit: "Sign in",
    submitting: "…",
    footerBefore: "Não tem conta?",
    footerLink: "Cadastre-se",
    footerTo: "/cadastro",
  },
  signUp: {
    title: "Sign up",
    subtitle: "to create your account",
    submit: "Sign up",
    submitting: "…",
    footerBefore: "Já tem conta?",
    footerLink: "Sign in",
    footerTo: "/login",
  },
};

export default function AuthPanel({
  variant = "signIn",
  titleId,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  error,
  submitting,
  onSubmit,
  emailInputRef,
  footerLinkOnClick,
  footerTo,
  fieldIdPrefix = "coopers-auth",
}) {
  const copy = COPY[variant];
  const footerDestination = footerTo ?? copy.footerTo;

  return (
    <div className="coopers-modal__grid">
      <div className="coopers-modal__art" aria-hidden="true">
        <img
          className="coopers-modal__avatar"
          src={signInAvatar}
          alt=""
          width={200}
          height={220}
          decoding="async"
        />
      </div>

      <div className="coopers-modal__form-wrap">
        <h2 id={titleId} className="coopers-modal__title">
          {copy.title}
        </h2>
        <p className="coopers-modal__subtitle">{copy.subtitle}</p>

        <form className="coopers-modal__form" onSubmit={onSubmit} noValidate>
          <div className="coopers-modal__field">
            <label htmlFor={`${fieldIdPrefix}-user`}>User:</label>
            <input
              ref={emailInputRef}
              id={`${fieldIdPrefix}-user`}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={onEmailChange}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? `${fieldIdPrefix}-err` : undefined}
            />
          </div>

          <div className="coopers-modal__field">
            <label htmlFor={`${fieldIdPrefix}-pass`}>Password:</label>
            <input
              id={`${fieldIdPrefix}-pass`}
              name="password"
              type="password"
              autoComplete={variant === "signUp" ? "new-password" : "current-password"}
              required
              minLength={variant === "signUp" ? 6 : undefined}
              value={password}
              onChange={onPasswordChange}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? `${fieldIdPrefix}-err` : undefined}
            />
          </div>

          {error ? (
            <p id={`${fieldIdPrefix}-err`} className="coopers-modal__error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="coopers-modal__submit" disabled={submitting}>
            {submitting ? copy.submitting : copy.submit}
          </button>
        </form>

        <p className="coopers-modal__footer">
          {copy.footerBefore}{" "}
          <Link to={footerDestination} onClick={footerLinkOnClick}>
            {copy.footerLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
