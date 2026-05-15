import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api.js";
import { useAuth } from "../../context/useAuth.js";
import TodoBoard from "../todo/TodoBoard.jsx";
import LoginModal from "./LoginModal.jsx";
import cooperLogo from "../../assets/Logo.png";
import faceInTouch from "../../assets/faceintouch.png";
import iconMail from "../../assets/icon-mail.png";
import heroBg from "../../assets/BG.png";
import heroFotoPng from "../../assets/foto.png";
import heroFotoWebp from "../../assets/foto.webp";
import "./landing.css";

const GOOD_POSTS = [
  {
    id: "1",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=640&q=80&auto=format&fit=crop",
    tag: "function",
    text: "Organize your daily job enhance your life performance",
  },
  {
    id: "2",
    image:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=640&q=80&auto=format&fit=crop",
    tag: "function",
    text: "Mark one activity as done makes your brain understands the power of doing.",
  },
  {
    id: "3",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=640&q=80&auto=format&fit=crop",
    tag: "function",
    text: "Careful with missunderstanding the difference between a list of things and a list of desires.",
  },
  {
    id: "4",
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=640&q=80&auto=format&fit=crop",
    tag: "function",
    text: "Small steps every day build the focus you need for bigger goals tomorrow.",
  },
  {
    id: "5",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=640&q=80&auto=format&fit=crop",
    tag: "function",
    text: "Clear priorities free your mind to do what matters most right now.",
  },
  {
    id: "6",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=640&q=80&auto=format&fit=crop",
    tag: "function",
    text: "Planning ahead turns busy days into calm, achievable routines.",
  },
  {
    id: "7",
    image:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=640&q=80&auto=format&fit=crop",
    tag: "function",
    text: "Finishing one task at a time keeps momentum without burning out.",
  },
];

function findActiveSlideIndex(root) {
  const rootRect = root.getBoundingClientRect();
  const mid = (rootRect.left + rootRect.right) / 2;
  const slides = root.querySelectorAll("[data-slide]");
  let best = 0;
  let bestScore = -Infinity;
  slides.forEach((slide) => {
    const i = Number(slide.getAttribute("data-slide"));
    if (Number.isNaN(i)) return;
    const r = slide.getBoundingClientRect();
    const visible = Math.max(
      0,
      Math.min(r.right, rootRect.right) - Math.max(r.left, rootRect.left),
    );
    const center = (r.left + r.right) / 2;
    const dist = Math.abs(center - mid);
    const score = visible * 10000 - dist;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  });
  return best;
}

export default function CoopersLanding() {
  const formId = useId();
  const { user, loading, logout } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [contactHint, setContactHint] = useState("");
  const [contactSending, setContactSending] = useState(false);
  const scrollerRef = useRef(null);
  const scrollTargetRef = useRef(null);
  const activeSlideRef = useRef(0);

  useEffect(() => {
    activeSlideRef.current = activeSlide;
  }, [activeSlide]);

  const getSlideScrollLeft = useCallback((root, target) => {
    const isDesktop = window.matchMedia("(min-width: 48rem)").matches;
    if (isDesktop) {
      return Math.max(
        0,
        target.offsetLeft - (root.clientWidth - target.clientWidth) / 2,
      );
    }
    return Math.max(
      0,
      target.getBoundingClientRect().left -
        root.getBoundingClientRect().left +
        root.scrollLeft -
        8,
    );
  }, []);

  const syncActiveSlideFromScroll = useCallback(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const next = findActiveSlideIndex(root);
    setActiveSlide((prev) => (prev === next ? prev : next));
  }, []);

  const finishProgrammaticScroll = useCallback(() => {
    const targetIndex = scrollTargetRef.current;
    if (targetIndex === null) return;
    setActiveSlide(targetIndex);
    scrollTargetRef.current = null;
  }, []);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    syncActiveSlideFromScroll();
    let raf = 0;
    const onScroll = () => {
      if (scrollTargetRef.current !== null) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        syncActiveSlideFromScroll();
      });
    };
    const onScrollEnd = () => {
      if (scrollTargetRef.current !== null) {
        finishProgrammaticScroll();
        return;
      }
      syncActiveSlideFromScroll();
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    root.addEventListener("scrollend", onScrollEnd);
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("scroll", onScroll);
      root.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("resize", onScroll);
    };
  }, [syncActiveSlideFromScroll, finishProgrammaticScroll]);

  const scrollToSlide = useCallback(
    (index) => {
      const root = scrollerRef.current;
      if (!root) return;
      const target = root.querySelector(`[data-slide="${index}"]`);
      if (!target) return;

      scrollTargetRef.current = index;
      setActiveSlide(index);
      root.scrollTo({
        left: getSlideScrollLeft(root, target),
        behavior: "smooth",
      });

      window.setTimeout(() => {
        if (scrollTargetRef.current === index) {
          finishProgrammaticScroll();
        }
      }, 800);
    },
    [getSlideScrollLeft, finishProgrammaticScroll],
  );

  const goToPrevSlide = useCallback(() => {
    scrollToSlide(
      (activeSlide - 1 + GOOD_POSTS.length) % GOOD_POSTS.length,
    );
  }, [activeSlide, scrollToSlide]);

  const goToNextSlide = useCallback(() => {
    scrollToSlide((activeSlide + 1) % GOOD_POSTS.length);
  }, [activeSlide, scrollToSlide]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 48rem)");
    if (!mq.matches) return undefined;

    let paused = false;
    const root = scrollerRef.current;
    const onEnter = () => {
      paused = true;
    };
    const onLeave = () => {
      paused = false;
    };
    root?.addEventListener("mouseenter", onEnter);
    root?.addEventListener("mouseleave", onLeave);

    const id = window.setInterval(() => {
      if (paused) return;
      const next = (activeSlideRef.current + 1) % GOOD_POSTS.length;
      scrollToSlide(next);
    }, 5000);

    return () => {
      window.clearInterval(id);
      root?.removeEventListener("mouseenter", onEnter);
      root?.removeEventListener("mouseleave", onLeave);
    };
  }, [scrollToSlide]);

  async function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setContactHint("");
    setContactSending(true);
    try {
      const res = await api("/api/contact", {
        method: "POST",
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
        }),
      });
      setContactHint(res?.message || "Mensagem enviada com sucesso.");
      form.reset();
    } catch (err) {
      setContactHint(err.message || "Não foi possível enviar. Tente novamente.");
    } finally {
      setContactSending(false);
    }
  }

  return (
    <div className="coopers">
      <header className="coopers-header">
        <div className="coopers-header__inner">
          <Link className="coopers-logo" to="/">
            <img
              className="coopers-logo__img"
              src={cooperLogo}
              alt="Coopers"
              width={160}
              height={40}
              decoding="async"
            />
          </Link>

          <div className="coopers-header__actions">
            {loading ? (
              <span className="coopers-header__loading" aria-live="polite">
                …
              </span>
            ) : user ? (
              <button
                type="button"
                className="coopers-header-btn"
                onClick={() => void logout()}
              >
                Sair
              </button>
            ) : (
              <button
                type="button"
                className="coopers-header-btn"
                onClick={() => setLoginOpen(true)}
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginModal
        open={loginOpen && !user}
        onClose={() => setLoginOpen(false)}
      />

      <main id="conteudo-principal">
        <section
          className="coopers-hero coopers__container"
          aria-labelledby="hero-title"
        >
          <div className="coopers-hero__grid">
            <div className="coopers-hero__copy">
              <h1 id="hero-title" className="coopers-hero__title">
                <span>Organize</span>
                <span className="coopers-hero__title-accent">
                  your daily jobs
                </span>
              </h1>
              <p className="coopers-hero__lead">
                The only way to get things done
              </p>
              <a className="coopers-hero__cta" href="#todo-list">
                Go to To-do list
              </a>
            </div>
            <div className="coopers-hero__visual">
              <img
                className="coopers-hero__bg"
                src={heroBg}
                alt=""
                width={800}
                height={600}
                decoding="async"
              />
              <picture className="coopers-hero__photo-wrap">
                <source srcSet={heroFotoWebp} type="image/webp" />
                <img
                  className="coopers-hero__photo"
                  src={heroFotoPng}
                  alt="Ambiente de trabalho moderno e iluminado"
                  width={560}
                  height={560}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </div>
          </div>
        </section>

        <section
          id="todo-list"
          className="coopers-todo-band"
          aria-labelledby="todo-band-title"
        >
          <div className="coopers-todo-band__inner">
            <h2 id="todo-band-title" className="coopers-todo-band__title">
              To-do List
            </h2>
            <p className="coopers-todo-band__desc">
              Drag and drop to set your main priorities, check when done and
              create what&apos;s new.
            </p>

            {loading ? (
              <p className="coopers-todo-band__desc">Carregando…</p>
            ) : user ? (
              <div className="coopers-todo-embed">
                <TodoBoard embedded />
              </div>
            ) : (
              <div className="coopers-todo-guest">
                <p>
                  Entre ou crie uma conta para ver e editar suas tarefas nesta
                  página.
                </p>
                <div className="coopers-todo-guest__actions">
                  <button
                    type="button"
                    className="coopers-todo-guest__btn coopers-todo-guest__btn--primary"
                    onClick={() => setLoginOpen(true)}
                  >
                    Entrar
                  </button>
                  <Link
                    to="/cadastro"
                    className="coopers-todo-guest__btn coopers-todo-guest__btn--outline"
                  >
                    Criar conta
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        <section
          id="good-things"
          className="coopers-good coopers__container"
          aria-labelledby="good-title"
        >
          <h2 id="good-title" className="coopers-good__title">
            good things
          </h2>

          <div className="coopers-carousel">
            <div className="coopers-carousel__stage">
              <button
                type="button"
                className="coopers-carousel__arrow coopers-carousel__arrow--prev"
                aria-label="Slide anterior"
                onClick={goToPrevSlide}
              >
                ‹
              </button>
              <div
                ref={scrollerRef}
                className="coopers-carousel__viewport"
              role="region"
              aria-roledescription="carrossel"
              aria-label="Posts good things"
              tabIndex={0}
            >
              {GOOD_POSTS.map((post, index) => (
                <article
                  key={post.id}
                  className="coopers-card"
                  data-slide={index}
                >
                  <img
                    className="coopers-card__img"
                    src={post.image}
                    alt=""
                    loading="lazy"
                  />
                  <div className="coopers-card__body">
                    <span className="coopers-card__tag">{post.tag}</span>
                    <p className="coopers-card__text">{post.text}</p>
                    <a className="coopers-card__link" href="#good-things">
                      read more
                    </a>
                  </div>
                </article>
              ))}
              </div>
              <button
                type="button"
                className="coopers-carousel__arrow coopers-carousel__arrow--next"
                aria-label="Próximo slide"
                onClick={goToNextSlide}
              >
                ›
              </button>
            </div>
            <div
              className="coopers-carousel__dots"
              role="tablist"
              aria-label="Slide do carrossel"
            >
              {GOOD_POSTS.map((post, i) => (
                <button
                  key={post.id}
                  type="button"
                  role="tab"
                  aria-selected={activeSlide === i}
                  className="coopers-carousel__dot"
                  tabIndex={-1}
                  onClick={() => scrollToSlide(i)}
                  aria-label={`Ir para o slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section
          id="contato"
          className="coopers-contact coopers__container"
          aria-labelledby={`${formId}-contact`}
        >
          <div className="coopers-contact__avatar-wrap">
            <img
              className="coopers-contact__avatar"
              src={faceInTouch}
              alt=""
              width={120}
              height={120}
              loading="lazy"
              decoding="async"
            />
          </div>
          <h2 className="coopers-contact__heading" id={`${formId}-contact`}>
            <img
              className="coopers-contact__heading-icon"
              src={iconMail}
              alt=""
              width={24}
              height={24}
              decoding="async"
              aria-hidden="true"
            />
            get in <span className="coopers-contact__heading-accent">touch</span>
          </h2>

          <form
            className="coopers-contact__form"
            onSubmit={handleContactSubmit}
            noValidate
          >
            <div className="coopers-field">
              <label htmlFor={`${formId}-name`}>
                Your name<span aria-hidden="true">*</span>
              </label>
              <input
                id={`${formId}-name`}
                name="name"
                type="text"
                autoComplete="name"
                placeholder="type your name here..."
                required
              />
            </div>
            <div className="coopers-field-row">
              <div className="coopers-field">
                <label htmlFor={`${formId}-email`}>
                  Email<span aria-hidden="true">*</span>
                </label>
                <input
                  id={`${formId}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="example@example.com"
                  required
                />
              </div>
              <div className="coopers-field">
                <label htmlFor={`${formId}-tel`}>
                  Telephone<span aria-hidden="true">*</span>
                </label>
                <input
                  id={`${formId}-tel`}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="( ) _____-____"
                  required
                />
              </div>
            </div>
            <div className="coopers-field">
              <label htmlFor={`${formId}-msg`}>
                Message<span aria-hidden="true">*</span>
              </label>
              <textarea
                id={`${formId}-msg`}
                name="message"
                placeholder="Type what you want to say to us"
                required
              />
            </div>
            <button
              type="submit"
              className="coopers-contact__submit"
              disabled={contactSending}
            >
              {contactSending ? "SENDING…" : "SEND NOW"}
            </button>
            <p
              className={`coopers-contact__hint${contactHint ? " coopers-contact__hint--active" : ""}`}
              role="status"
            >
              {contactHint}
            </p>
          </form>
        </section>
      </main>

      <footer className="coopers-footer">
        <p className="coopers-footer__help">Need help?</p>
        <a href="mailto:coopers@coopers.pro">coopers@coopers.pro</a>
        <p className="coopers-footer__copy">
          © 2021 Coopers. All rights reserved
        </p>
        <div className="coopers-footer__bar" aria-hidden="true" />
      </footer>
    </div>
  );
}
