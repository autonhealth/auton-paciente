import { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  IoHome, IoBook, IoRestaurant, IoFitness, IoLeaf, IoPerson, IoLogOut,
  IoChevronDown, IoChevronUp, IoChevronBack, IoChevronForward,
} from "react-icons/io5";
import { GiSelfLove } from "react-icons/gi";
import { supabase } from "../../lib/supabase-client";
import { usePaciente } from "../../hooks/usePaciente";

const NAV_ITEMS = [
  { label: "Início", path: "/dashboard", icon: IoHome },
  {
    label: "Estilo de Vida", icon: GiSelfLove, children: [
      { label: "Livro da Vida", path: "/lifestyle/livro-da-vida", icon: GiSelfLove, visKey: "livro_vida" },
      { label: "Alimentação", path: "/lifestyle/alimentacao", icon: IoRestaurant, visKey: "alimentacao" },
      { label: "Exercício", path: "/lifestyle/exercicio-fisico", icon: IoFitness, visKey: "treinamentos" },
      { label: "Suplementos", path: "/lifestyle/suplementos-fitoterapicos", icon: IoLeaf, visKey: "suplementacao" },
    ],
  },
  { label: "Check-in", path: "/checkin-diarios", icon: IoBook },
  { label: "Perfil", path: "/perfil", icon: IoPerson },
];

// Remove itens que o médico ocultou (itens_visiveis = false) e grupos vazios.
function filtrarPorVisibilidade(itens, visibilidade) {
  return itens
    .map((item) =>
      item.children
        ? { ...item, children: item.children.filter((c) => !c.visKey || visibilidade?.[c.visKey] !== false) }
        : item
    )
    .filter((item) => !item.children || item.children.length > 0);
}

const RAIL_PINNED_KEY = "rail-pinned";

export default function Sidebar() {
  const location = useLocation();
  const history = useHistory();
  const { visibilidade } = usePaciente();
  const navItems = filtrarPorVisibilidade(NAV_ITEMS, visibilidade);

  const [pinned, setPinned] = useState(() => {
    try { return localStorage.getItem(RAIL_PINNED_KEY) === "1"; } catch { return false; }
  });
  const [groupOpen, setGroupOpen] = useState(location.pathname.startsWith("/lifestyle"));

  useEffect(() => {
    try { localStorage.setItem(RAIL_PINNED_KEY, pinned ? "1" : "0"); } catch {}
  }, [pinned]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    history.push("/authentication/sign-in");
  };

  const goTo = (e, path) => {
    e.preventDefault();
    history.push(path);
  };

  const expanded = pinned;

  return (
    <aside
      className={`h2-rail ${expanded ? "is-expanded" : "is-collapsed"}`}
      aria-label="Navegação principal"
    >
      {/* Brand */}
      <div className="h2-rail__logo-wrap">
        <a href="/dashboard" onClick={(e) => goTo(e, "/dashboard")} className="h2-rail__logo" aria-label="AUTON Health — Início">
          <img
            src={`${process.env.PUBLIC_URL || ""}/auton-isologo.png`}
            alt=""
            width={32}
            height={32}
            className="h2-rail__logo-img"
          />
          <span className="h2-rail__wordmark"><strong>Auton</strong> Health</span>
        </a>
      </div>

      {/* Peek toggle */}
      <button
        type="button"
        className="h2-rail__peek"
        onClick={() => setPinned((v) => !v)}
        aria-label={expanded ? "Recolher navegação" : "Expandir navegação"}
        aria-expanded={expanded}
        title={expanded ? "Recolher menu" : "Expandir menu"}
      >
        {expanded ? <IoChevronBack size={14} /> : <IoChevronForward size={14} />}
      </button>

      {/* Nav */}
      <nav className="h2-rail__nav" role="menubar" aria-orientation="vertical">
        {navItems.map((item) => {
          if (item.children) {
            const groupActive = item.children.some((c) => isActive(c.path));

            if (!expanded) {
              return (
                <button
                  key={item.label}
                  type="button"
                  className={`h2-rail__item ${groupActive ? "is-active" : ""}`}
                  aria-label={item.label}
                  title={item.label}
                  onClick={() => setPinned(true)}
                >
                  <span className="h2-rail__icon">
                    <item.icon size={22} />
                  </span>
                </button>
              );
            }

            return (
              <div key={item.label} style={{ width: "100%" }}>
                <button
                  type="button"
                  className={`h2-rail__item ${groupActive && !groupOpen ? "is-active" : ""}`}
                  onClick={() => setGroupOpen(!groupOpen)}
                  aria-expanded={groupOpen}
                >
                  <span className="h2-rail__icon">
                    <item.icon size={20} />
                  </span>
                  <span className="h2-rail__label">{item.label}</span>
                  <span className="h2-rail__chevron">
                    {groupOpen ? <IoChevronUp size={14} /> : <IoChevronDown size={14} />}
                  </span>
                </button>

                {groupOpen && (
                  <div className="h2-rail__children">
                    {item.children.map((child) => {
                      const childActive = isActive(child.path);
                      return (
                        <a
                          key={child.path}
                          href={child.path}
                          onClick={(e) => goTo(e, child.path)}
                          className={`h2-rail__item h2-rail__child ${childActive ? "is-active" : ""}`}
                          aria-current={childActive ? "page" : undefined}
                        >
                          <span className="h2-rail__icon">
                            <child.icon size={16} />
                          </span>
                          <span className="h2-rail__label">{child.label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = isActive(item.path);
          return (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => goTo(e, item.path)}
              className={`h2-rail__item ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
              title={!expanded ? item.label : undefined}
            >
              <span className="h2-rail__icon">
                <item.icon size={expanded ? 20 : 22} />
              </span>
              <span className="h2-rail__label">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="h2-rail__bottom">
        <button
          type="button"
          onClick={handleLogout}
          className="h2-rail__item h2-rail__item--danger"
          aria-label="Sair"
          title={!expanded ? "Sair" : undefined}
        >
          <span className="h2-rail__icon">
            <IoLogOut size={expanded ? 20 : 22} />
          </span>
          <span className="h2-rail__label">Sair</span>
        </button>
      </div>
    </aside>
  );
}
