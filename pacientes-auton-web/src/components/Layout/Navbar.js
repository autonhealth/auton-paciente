import { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import {
  IoNotificationsOutline, IoChevronDown,
  IoPersonOutline, IoLogOutOutline,
} from "react-icons/io5";
import { usePaciente } from "../../hooks/usePaciente";
import { supabase } from "../../lib/supabase-client";

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar() {
  const { paciente } = usePaciente();
  const history = useHistory();
  const fullName = paciente?.name || "Paciente";
  const firstName = fullName.split(" ")[0];

  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const bellRef = useRef(null);
  const userRef = useRef(null);

  // Close popovers on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setBellOpen(false);
        setUserOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeAll = () => {
    setBellOpen(false);
    setUserOpen(false);
  };

  const goPerfil = () => {
    closeAll();
    history.push("/perfil");
  };

  const handleLogout = async () => {
    closeAll();
    await supabase.auth.signOut();
    history.push("/authentication/sign-in");
  };

  return (
    <header className="h2-topbar" role="banner">
      <div className="h2-topbar__left">
        <a href="/dashboard" className="h2-topbar__brand-mobile" aria-label="AUTON Health">
          <img
            src={`${process.env.PUBLIC_URL || ""}/auton-isologo.png`}
            alt=""
            width={28}
            height={28}
          />
          <span>AUTON <strong>Health</strong></span>
        </a>
      </div>
      <div className="h2-topbar__center" aria-hidden />

      <div className="h2-topbar__right">
        {/* Notifications */}
        <div className="h2-popover-wrap" ref={bellRef}>
          <button
            type="button"
            className="h2-topbar__icon-btn"
            aria-label="Notificações"
            aria-expanded={bellOpen}
            aria-haspopup="menu"
            onClick={() => { setUserOpen(false); setBellOpen((v) => !v); }}
          >
            <IoNotificationsOutline size={18} />
            <span className="h2-topbar__badge" aria-hidden />
          </button>
          {bellOpen && (
            <>
              <div className="h2-popover-backdrop" onClick={closeAll} />
              <div className="h2-popover" role="menu" aria-label="Notificações">
                <div className="h2-popover__header">Notificações</div>
                <div className="h2-popover__empty">Você está em dia. Sem novas notificações.</div>
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <div className="h2-popover-wrap" ref={userRef}>
          <button
            type="button"
            className="h2-topbar__user"
            aria-label={`Menu de ${fullName}`}
            aria-expanded={userOpen}
            aria-haspopup="menu"
            onClick={() => { setBellOpen(false); setUserOpen((v) => !v); }}
          >
            <span className="h2-topbar__avatar" aria-hidden>{initials(fullName)}</span>
            <span className="h2-topbar__user-meta">
              <span className="h2-topbar__user-name">{firstName}</span>
              <span className="h2-topbar__user-role">Paciente</span>
            </span>
            <IoChevronDown size={14} color="var(--h2-text-muted)" />
          </button>
          {userOpen && (
            <>
              <div className="h2-popover-backdrop" onClick={closeAll} />
              <div className="h2-popover" role="menu" aria-label="Menu da conta">
                <div className="h2-popover__header">{fullName}</div>
                <button type="button" role="menuitem" className="h2-popover__item" onClick={goPerfil}>
                  <IoPersonOutline size={16} /> Meu perfil
                </button>
                <div className="h2-popover__divider" />
                <button
                  type="button"
                  role="menuitem"
                  className="h2-popover__item h2-popover__item--danger"
                  onClick={handleLogout}
                >
                  <IoLogOutOutline size={16} /> Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
