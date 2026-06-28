import { useState, type ReactNode } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import modules from "../data/modules.json";

type IconProps = {
  name: string;
  className?: string;
  strokeWidth?: number;
};

type LayoutProps = {
  children?: ReactNode;
  onLogout?: () => void;
};

export function Icon({ name, className, strokeWidth = 1.9 }: IconProps) {
  return (
    <DynamicIcon
      name={name as IconName}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
}

export function Layout({ children, onLogout }: LayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (mobile = false) => (
    <div className="flex h-dvh min-h-0 flex-col bg-[#11151C]">
      <div className="flex h-[88px] shrink-0 items-center overflow-hidden px-[22px]">
        <div className="relative h-[42px] w-[276px] shrink-0">
          <div
            title="Gestión Uno"
            className={`font-playfair absolute left-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[1.45rem] font-bold leading-none text-white transition-opacity duration-200 ${
              sidebarOpen || mobile ? "opacity-0" : "opacity-100"
            }`}
          >
            G<span className="text-[#e6c96e]">1</span>
          </div>

          <div
            className={`absolute left-0 top-0 min-w-0 whitespace-nowrap transition-opacity duration-200 ${
              sidebarOpen || mobile ? "opacity-100" : "opacity-0"
            }`}
          >
            <h1 className="font-playfair truncate text-[1.38rem] font-bold leading-tight text-white">
              Gestión Uno
            </h1>
            <p className="font-inter mt-1 truncate text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#e6c96e]">
              Gestión de membresías
            </p>
          </div>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-6">
          {modules.map((group) => (
            <div key={group.name}>
              <p
                className={`mb-2 h-4 px-3 text-[10px] font-bold uppercase leading-4 tracking-[0.18em] text-white/30 transition-opacity duration-200 ${
                  sidebarOpen || mobile ? "opacity-100" : "opacity-0"
                }`}
              >
                {group.name}
              </p>

              <div className="space-y-1">
                {group.elements.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    title={!sidebarOpen && !mobile ? item.label : undefined}
                    onClick={() => mobile && setMobileOpen(false)}
                    className={`group relative block h-12 w-full cursor-pointer rounded-2xl text-sm font-semibold transition-colors duration-200 active:scale-[0.98] ${
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)
                        ? "bg-[#FF5A3C] text-white shadow-lg shadow-[#FF5A3C]/20"
                        : "text-white/55 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    <span className="absolute left-0 top-0 flex h-full w-14 items-center justify-center">
                      <Icon
                        name={item.icon}
                        className="h-5 w-5 transition-transform duration-200 group-hover:scale-110"
                      />
                    </span>

                    <span
                      className={`flex h-full min-w-0 items-center overflow-hidden pl-14 pr-3 transition-opacity duration-200 ${
                        sidebarOpen || mobile
                          ? "pointer-events-auto opacity-100"
                          : "pointer-events-none opacity-0"
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          title={!sidebarOpen && !mobile ? "Cerrar sesión" : undefined}
          onClick={() => {
            if (onLogout) {
              onLogout();
              return;
            }

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/", { replace: true });
          }}
          className="group relative block h-12 w-full cursor-pointer rounded-2xl text-sm font-semibold text-white/55 transition-colors duration-200 hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
        >
          <span className="absolute left-0 top-0 flex h-full w-14 items-center justify-center">
            <Icon name="log-out" className="h-5 w-5" />
          </span>

          <span
            className={`flex h-full min-w-0 items-center overflow-hidden pl-14 pr-3 text-left transition-opacity duration-200 ${
              sidebarOpen || mobile
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
            }`}
          >
            <span className="truncate">Cerrar sesión</span>
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-dvh overflow-hidden bg-[#EEF1EF] text-[#11151C]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden overflow-hidden transition-[width] duration-300 md:block ${
          sidebarOpen ? "w-72" : "w-20"
        }`}
      >
        {sidebar()}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50 cursor-pointer bg-black/45 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.aside
              className="fixed inset-y-0 left-0 z-[60] w-[84%] max-w-xs overflow-hidden shadow-2xl md:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>

              {sidebar(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div
        className={`flex h-dvh min-w-0 flex-col transition-[padding] duration-300 ${
          sidebarOpen ? "md:pl-72" : "md:pl-20"
        }`}
      >
        <header className="z-30 flex h-20 shrink-0 items-center border-b border-slate-200 bg-white/90 px-5 backdrop-blur md:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-95 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-95 md:flex"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}
