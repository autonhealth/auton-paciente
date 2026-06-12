import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { supabase } from "../lib/supabase-client";
import "../styles/login.css";

export default function SignIn() {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(
          /invalid/i.test(authError.message || "")
            ? "Email ou senha incorretos"
            : "Erro ao entrar. Tente novamente."
        );
        setLoading(false);
        return;
      }
      // Sessão criada; PacienteContext recarrega via onAuthStateChange.
      history.push("/dashboard");
    } catch (err) {
      setError("Erro ao entrar. Tente novamente.");
      setLoading(false);
    }
  };

  const heroSrc = `${process.env.PUBLIC_URL || ""}/login-hero.jpg`;

  return (
    <main className="lg2-root" role="main">
      {/* Hero panel (left) */}
      <aside className="lg2-hero" aria-hidden>
        {/* Se /login-hero.jpg existir no public, ela aparece como background.
            Fallback: gradient + cartão com isologo (cobertura por trás). */}
        <img
          src={heroSrc}
          alt=""
          className="lg2-hero__image"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <div className="lg2-hero__overlay" />
        <div className="lg2-hero__card">
          <img
            src={`${process.env.PUBLIC_URL || ""}/auton-isologo.png`}
            alt=""
            className="lg2-hero__logo"
          />
          <h1 className="lg2-hero__brand">
            AUTON <span className="lg2-hero__brand-tail">Health</span>
          </h1>
        </div>
      </aside>

      {/* Form panel (right) */}
      <section className="lg2-form-pane">
        <form className="lg2-form-card" onSubmit={handleSignIn} aria-label="Formulário de entrada">
          <h2 className="lg2-form-card__title">Que bom te ver!</h2>
          <p className="lg2-form-card__subtitle">Digite seu email e senha para entrar</p>

          {error && <div className="lg2-error" role="alert">{error}</div>}

          <div className="lg2-field">
            <label htmlFor="lg2-email" className="lg2-field__label">E-mail</label>
            <div className="lg2-field__control">
              <input
                id="lg2-email"
                type="email"
                autoComplete="email"
                placeholder="Seu email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="lg2-field__input"
                required
              />
              <span className="lg2-field__icon" aria-hidden>@</span>
            </div>
          </div>

          <div className="lg2-field">
            <label htmlFor="lg2-pass" className="lg2-field__label">Senha</label>
            <div className="lg2-field__control">
              <input
                id="lg2-pass"
                type="password"
                autoComplete="current-password"
                placeholder="Sua senha..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="lg2-field__input"
                required
              />
              <span className="lg2-field__icon" aria-hidden>•••</span>
            </div>
          </div>

          <div className="lg2-meta">
            <label className="lg2-toggle">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="lg2-toggle__track">
                <span className="lg2-toggle__thumb" />
              </span>
              <span className="lg2-toggle__label">Lembrar-me</span>
            </label>
            <a href="#esqueci" onClick={(e) => e.preventDefault()} className="lg2-link">
              Esqueci minha senha
            </a>
          </div>

          <button type="submit" className="lg2-submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
