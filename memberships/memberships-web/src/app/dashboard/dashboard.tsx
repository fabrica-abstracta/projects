import { useEffect } from "react";

import { fetch, useRequest } from "../../core/config/fetch";
import { RequestState } from "../../core/components";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Clock,
  CreditCard,
  LogIn,
  ShoppingCart,
  UserPlus,
} from "lucide-react";

type SummaryItem = {
  value: number;
  total?: number;
};

type Activity = {
  id: number;
  type: string;
  name: string;
  detail: string;
  amount?: number;
  time: string;
};

type Expiration = {
  id: number;
  name: string;
  days: number;
};

export function Dashboard() {
  const summary = useRequest<SummaryItem[]>([]);
  const activities = useRequest<Activity[]>([]);
  const expirations = useRequest<Expiration[]>([]);

  const loadSummary = () => {
    summary.start();

    fetch
      .get("/summary")
      .then((response) => summary.success(response))
      .catch(summary.fail);
  };

  const loadActivities = () => {
    activities.start();

    fetch.get("/activities").then(activities.success).catch(activities.fail);
  };

  const loadExpirations = () => {
    expirations.start();

    fetch.get("/expirations").then(expirations.success).catch(expirations.fail);
  };

  useEffect(() => {
    loadSummary();
    loadActivities();
    loadExpirations();
  }, []);

  return (
    <main className="bg-[#EEF1EF] p-5 text-[#11151C] md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Panel general
          </p>

          <h1 className="font-fraunces -mt-0.5 text-2xl font-extrabold tracking-tight text-[#11151C] md:text-3xl">
            Resumen de hoy
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden font-plex text-xs text-slate-400 lg:block">
            {new Intl.DateTimeFormat("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
              .format(new Date())
              .replace(/^\w/, (c) => c.toUpperCase())}
          </span>
        </div>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 pl-7 shadow-sm">
          <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#1FAE6B]" />

          <p className="font-plex text-[11px] uppercase tracking-[0.14em] text-slate-400">
            Miembros vigentes
          </p>

          <p className="font-fraunces mt-2 min-h-10 text-4xl font-black tabular-nums text-[#11151C]">
            <RequestState
              status={summary.status}
              skeleton={
                <span className="block h-10 w-20 animate-pulse rounded-lg bg-slate-200" />
              }
              error={<span className="text-[#E8431F]">_</span>}
            >
              {String(summary.data?.[0]?.value)}
            </RequestState>
          </p>

          <p className="mt-1 min-h-4 text-xs text-slate-400">
            de{" "}
            <RequestState
              status={summary.status}
              skeleton={
                <span className="inline-block h-3 w-10 animate-pulse rounded bg-slate-200 align-middle" />
              }
              error={<span className="font-semibold text-[#E8431F]">_</span>}
            >
              {String(summary.data?.[0]?.total)}
            </RequestState>{" "}
            membresías registradas
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 pl-7 shadow-sm">
          <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#FF5A3C]" />

          <p className="font-plex text-[11px] uppercase tracking-[0.14em] text-slate-400">
            Asistencias del mes
          </p>

          <p className="font-fraunces mt-2 min-h-10 text-4xl font-black tabular-nums text-[#11151C]">
            <RequestState
              status={summary.status}
              skeleton={
                <span className="block h-10 w-20 animate-pulse rounded-lg bg-slate-200" />
              }
              error={<span className="text-[#E8431F]">_</span>}
            >
              {String(summary.data?.[1]?.value)}
            </RequestState>
          </p>

          <p className="mt-1 text-xs text-slate-400">
            miembros activos en sala
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 pl-7 shadow-sm">
          <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#E2932A]" />

          <p className="font-plex text-[11px] uppercase tracking-[0.14em] text-slate-400">
            Visitas del mes
          </p>

          <p className="font-fraunces mt-2 min-h-10 text-4xl font-black tabular-nums text-[#11151C]">
            <RequestState
              status={summary.status}
              skeleton={
                <span className="block h-10 w-20 animate-pulse rounded-lg bg-slate-200" />
              }
              error={<span className="text-[#E8431F]">_</span>}
            >
              {String(summary.data?.[2]?.value)}
            </RequestState>
          </p>

          <p className="mt-1 text-xs text-slate-400">
            pagos por día sin membresía
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[#11151C] p-5 pl-7 text-white shadow-sm">
          <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-white/30" />

          <p className="font-plex text-[11px] uppercase tracking-[0.14em] text-white/40">
            Ingresos de hoy
          </p>

          <p className="font-fraunces mt-2 flex min-h-10 items-center gap-2 text-4xl font-black tabular-nums text-white">
            <RequestState
              status={summary.status}
              skeleton={
                <span className="block h-10 w-24 animate-pulse rounded-lg bg-white/15" />
              }
              error={<span className="text-[#FF5A3C]">_</span>}
            >
              <span>S/</span>
              {String(summary.data?.[3]?.value)}
            </RequestState>
          </p>

          <p className="mt-1 min-h-4 text-xs text-white/40">
            <RequestState
              status={summary.status}
              skeleton={
                <span className="inline-block h-3 w-10 animate-pulse rounded bg-white/15 align-middle" />
              }
              error={<span className="font-semibold text-[#FF5A3C]">_</span>}
            >
              {String(summary.data?.[3]?.total)}
            </RequestState>{" "}
            transacciones
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="font-fraunces text-base font-bold text-[#11151C]">
              Actividad reciente
            </h2>
          </div>

          <div className="divide-y divide-slate-100 px-5 pb-5 pt-3">
            {activities.data?.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    item.type === "entry"
                      ? "bg-[#EAFBF2] text-[#168F57]"
                      : item.type === "visit"
                        ? "bg-[#FFF7E8] text-[#B9740F]"
                        : "bg-[#FFF1ED] text-[#E8431F]"
                  }`}
                >
                  {item.type === "entry" ? (
                    <LogIn className="h-4 w-4" />
                  ) : item.type === "visit" ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <BarChart3 className="h-4 w-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#11151C]">
                    {item.name}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {item.detail}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="font-plex text-sm font-semibold text-[#11151C]">
                    {item.amount ? `S/ ${item.amount}` : item.time}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    {item.amount ? item.time : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <div className="flex justify-between">
              <h2 className="font-fraunces mb-1 text-base font-bold text-[#11151C]">
                Próximos vencimientos
              </h2>

              <Link
                to="/asistencias"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#E8431F] hover:text-[#C13317]"
              >
                Ver todo
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <p className="mb-3 text-xs text-slate-400">
              Membresías que vencen esta semana
            </p>

            <div className="space-y-2.5">
              {expirations.data?.map((expiration) => (
                <div
                  key={expiration.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-[#FFF7E8] p-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#11151C]">
                      {expiration.name}
                    </p>

                    <p className="text-xs font-medium text-[#B9740F]">
                      {expiration.days === 1
                        ? "Vence mañana"
                        : `Vence en ${expiration.days} días`}
                    </p>
                  </div>

                  <Link
                    to="/membresias"
                    className="shrink-0 rounded-lg bg-[#F2A93B] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#E2932A]"
                  >
                    Renovar
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <h2 className="font-fraunces mb-3 text-base font-bold text-[#11151C]">
              Acciones rápidas
            </h2>

            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/asistencias"
                className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 p-3 text-center transition-colors hover:border-[#FF5A3C] hover:bg-[#FFF1ED]"
              >
                <span className="text-[#FF5A3C]">
                  <LogIn className="h-5 w-5" />
                </span>

                <span className="text-[11px] font-semibold leading-tight text-[#11151C]">
                  Registrar
                  <br />
                  asistencia
                </span>
              </Link>

              <Link
                to="/ventas"
                className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 p-3 text-center transition-colors hover:border-[#FF5A3C] hover:bg-[#FFF1ED]"
              >
                <span className="text-[#FF5A3C]">
                  <ShoppingCart className="h-5 w-5" />
                </span>

                <span className="text-[11px] font-semibold leading-tight text-[#11151C]">
                  Nueva venta
                  <br />
                  de visita
                </span>
              </Link>

              <Link
                to="/clientes"
                className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 p-3 text-center transition-colors hover:border-[#FF5A3C] hover:bg-[#FFF1ED]"
              >
                <span className="text-[#FF5A3C]">
                  <UserPlus className="h-5 w-5" />
                </span>

                <span className="text-[11px] font-semibold leading-tight text-[#11151C]">
                  Nuevo
                  <br />
                  cliente
                </span>
              </Link>

              <Link
                to="/membresias"
                className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 p-3 text-center transition-colors hover:border-[#FF5A3C] hover:bg-[#FFF1ED]"
              >
                <span className="text-[#FF5A3C]">
                  <CreditCard className="h-5 w-5" />
                </span>

                <span className="text-[11px] font-semibold leading-tight text-[#11151C]">
                  Registrar
                  <br />
                  pago
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
