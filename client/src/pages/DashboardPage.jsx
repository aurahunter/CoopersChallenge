import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import TodoBoard from "../components/todo/TodoBoard.jsx";
import cooperLogo from "../assets/Logo.png";
import "../components/landing/landing.css";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="coopers coopers-app">
      <header className="coopers-header">
        <div className="coopers-header__inner">
          <Link className="coopers-logo" to="/" aria-label="Coopers — início">
            <img
              className="coopers-logo__img"
              src={cooperLogo}
              alt="Coopers"
              width={160}
              height={40}
              decoding="async"
            />
          </Link>
          <div className="coopers-header__actions coopers-app__actions">
            <span className="coopers-app__email">{user?.email}</span>
            <Link className="coopers-header-btn coopers-header-btn--ghost" to="/#todo-list">
              Landing
            </Link>
            <button type="button" className="coopers-header-btn" onClick={() => logout()}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main id="conteudo-principal" className="coopers__container coopers-app__main">
        <TodoBoard />
      </main>
    </div>
  );
}
