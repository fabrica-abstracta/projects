import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Check,
  CreditCard,
  Dumbbell,
  LockKeyhole,
  Mail,
  Menu,
  Rocket,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Zap,
} from "lucide-react";
import {
  useComponent,
  type RegisteredComponentProps,
} from "../../core/context/component";
import { Modal, Sidebar } from "../../core/components/index";
import plans from "../../core/data/plans.json";

export function Home() {
  const { registerComponent, openComponent } = useComponent();
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    registerComponent("sign-in", SignIn);
    registerComponent("sign-up", SignUp);
    registerComponent("recover", Recover);
    registerComponent("forgot", Forgot);
    registerComponent("mobile-menu", MobileMenu);
  }, [registerComponent]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#EEF1EF] text-[#11151C] antialiased">
      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-[#11151C]/82 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <a href="#home" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF5A3C] text-white shadow-sm">
              <Dumbbell className="h-5 w-5" />
            </span>

            <span className="font-fraunces text-xl font-black text-white">
              PULSO<span className="text-[#FF9A82]"> Gym</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-semibold text-white/65 md:flex">
            <a href="#features" className="transition hover:text-white">
              Funcionalidades
            </a>
            <a href="#modules" className="transition hover:text-white">
              Módulos
            </a>
            <a href="#plans" className="transition hover:text-white">
              Planes
            </a>
            <a href="#faq" className="transition hover:text-white">
              Preguntas
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => openComponent("sign-in")}
              className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              Iniciar sesión
            </button>

            <button
              type="button"
              onClick={() =>
                openComponent("sign-up", {
                  data: {
                    id: "basic",
                  },
                })
              }
              className="cursor-pointer rounded-xl bg-[#FF5A3C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E8431F] active:scale-[0.98]"
            >
              Probar gratis
            </button>
          </div>

          <button
            type="button"
            onClick={() => openComponent("mobile-menu")}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-white transition hover:bg-white/10 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <section
        id="home"
        className="relative flex min-h-[100dvh] items-center overflow-hidden px-5 pb-16 pt-28 text-white md:px-8"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80')",
          }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,21,28,0.96)_0%,rgba(17,21,28,0.88)_42%,rgba(17,21,28,0.42)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,90,60,0.28),transparent_36%)]" />

        <motion.div
          className="relative z-10 mx-auto w-full max-w-7xl"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <div className="max-w-3xl">
            <h1 className="font-fraunces text-[clamp(3.2rem,7vw,6.8rem)] font-black leading-[0.94] tracking-[-0.06em]">
              Controla tu gimnasio sin desorden.
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-white/68 md:text-lg">
              PULSO centraliza clientes, planes, membresías, asistencias,
              ventas, productos, inventario y permisos en una sola plataforma.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  openComponent("sign-up", {
                    data: {
                      id: "basic",
                    },
                  })
                }
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A3C] px-7 py-4 text-sm font-bold text-white shadow-[0_18px_50px_rgba(255,90,60,0.28)] transition hover:bg-[#E8431F] active:scale-[0.98]"
              >
                <Rocket className="h-4 w-4" />
                Empezar gratis
              </button>

              <button
                type="button"
                onClick={() => openComponent("sign-in")}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/15 active:scale-[0.98]"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="bg-white px-5 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <span className="mb-4 inline-flex rounded-xl bg-[#FFF1ED] px-4 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#E8431F]">
              Funcionalidades
            </span>

            <h2 className="font-fraunces text-4xl font-black leading-tight tracking-[-0.035em] md:text-5xl">
              Lo esencial para operar tu gimnasio con orden.
            </h2>

            <p className="mt-4 text-base leading-8 text-slate-500">
              Una plataforma simple para recepción, caja, entrenadores y
              administración.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <motion.article
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#FF5A3C] hover:shadow-md"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.14 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#FF5A3C]/10 transition group-hover:scale-125" />
              <div className="relative z-10">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1ED] text-[#FF5A3C] transition group-hover:bg-[#FF5A3C] group-hover:text-white">
                    <UsersRound className="h-5 w-5" />
                  </div>
                  <span className="font-fraunces text-3xl font-black text-[#FF5A3C]/20">
                    01
                  </span>
                </div>
                <h3 className="font-fraunces mb-3 text-2xl font-black text-[#11151C]">
                  Clientes y membresías
                </h3>
                <p className="text-sm leading-7 text-slate-500">
                  Registra clientes, controla vigencias, renovaciones, vencidos
                  y planes activos.
                </p>
              </div>
            </motion.article>

            <motion.article
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#FF5A3C] hover:shadow-md"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.14 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#FF5A3C]/10 transition group-hover:scale-125" />
              <div className="relative z-10">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1ED] text-[#FF5A3C] transition group-hover:bg-[#FF5A3C] group-hover:text-white">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="font-fraunces text-3xl font-black text-[#FF5A3C]/20">
                    02
                  </span>
                </div>
                <h3 className="font-fraunces mb-3 text-2xl font-black text-[#11151C]">
                  Asistencias rápidas
                </h3>
                <p className="text-sm leading-7 text-slate-500">
                  Marca entradas de clientes y visitas de forma simple desde
                  recepción.
                </p>
              </div>
            </motion.article>

            <motion.article
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#FF5A3C] hover:shadow-md"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.14 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#FF5A3C]/10 transition group-hover:scale-125" />
              <div className="relative z-10">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1ED] text-[#FF5A3C] transition group-hover:bg-[#FF5A3C] group-hover:text-white">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <span className="font-fraunces text-3xl font-black text-[#FF5A3C]/20">
                    03
                  </span>
                </div>
                <h3 className="font-fraunces mb-3 text-2xl font-black text-[#11151C]">
                  Ventas y caja
                </h3>
                <p className="text-sm leading-7 text-slate-500">
                  Registra pagos, productos, métodos de pago y movimientos del
                  día.
                </p>
              </div>
            </motion.article>

            <motion.article
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#FF5A3C] hover:shadow-md"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.14 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#FF5A3C]/10 transition group-hover:scale-125" />
              <div className="relative z-10">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1ED] text-[#FF5A3C] transition group-hover:bg-[#FF5A3C] group-hover:text-white">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <span className="font-fraunces text-3xl font-black text-[#FF5A3C]/20">
                    04
                  </span>
                </div>
                <h3 className="font-fraunces mb-3 text-2xl font-black text-[#11151C]">
                  Reportes claros
                </h3>
                <p className="text-sm leading-7 text-slate-500">
                  Consulta ingresos, clientes activos, asistencia diaria y
                  productos vendidos.
                </p>
              </div>
            </motion.article>

            <motion.article
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#FF5A3C] hover:shadow-md"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.14 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#FF5A3C]/10 transition group-hover:scale-125" />
              <div className="relative z-10">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1ED] text-[#FF5A3C] transition group-hover:bg-[#FF5A3C] group-hover:text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="font-fraunces text-3xl font-black text-[#FF5A3C]/20">
                    05
                  </span>
                </div>
                <h3 className="font-fraunces mb-3 text-2xl font-black text-[#11151C]">
                  Usuarios y permisos
                </h3>
                <p className="text-sm leading-7 text-slate-500">
                  Define roles para recepción, caja, entrenadores y
                  administración.
                </p>
              </div>
            </motion.article>

            <motion.article
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#FF5A3C] hover:shadow-md"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.14 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#FF5A3C]/10 transition group-hover:scale-125" />
              <div className="relative z-10">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1ED] text-[#FF5A3C] transition group-hover:bg-[#FF5A3C] group-hover:text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="font-fraunces text-3xl font-black text-[#FF5A3C]/20">
                    06
                  </span>
                </div>
                <h3 className="font-fraunces mb-3 text-2xl font-black text-[#11151C]">
                  SaaS listo para crecer
                </h3>
                <p className="text-sm leading-7 text-slate-500">
                  Plan, límites, pagos de suscripción y soporte en el mismo
                  sistema.
                </p>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      <section id="modules" className="bg-[#EEF1EF] px-5 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <span className="mb-4 inline-flex rounded-xl bg-white px-4 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[#FF5A3C]">
                Módulos
              </span>

              <h2 className="font-fraunces text-4xl font-black leading-tight tracking-[-0.035em] md:text-5xl">
                Todo separado, pero conectado.
              </h2>
            </div>

            <p className="max-w-xl text-base leading-8 text-slate-500 lg:justify-self-end">
              Cada área trabaja en su propia pantalla, sin cargar el sistema con
              procesos innecesarios.
            </p>
          </div>

          <div className="divide-y divide-slate-300/70 border-y border-slate-300/70">
            <div className="grid gap-3 py-7 md:grid-cols-[260px_1fr] md:items-center">
              <p className="font-fraunces text-2xl font-black text-[#11151C]">
                Gestión
              </p>
              <p className="text-sm leading-7 text-slate-500">
                Clientes, planes, membresías, asistencias y ventas.
              </p>
            </div>

            <div className="grid gap-3 py-7 md:grid-cols-[260px_1fr] md:items-center">
              <p className="font-fraunces text-2xl font-black text-[#11151C]">
                Inventario
              </p>
              <p className="text-sm leading-7 text-slate-500">
                Productos, vencimientos y punto de venta para bebidas o
                accesorios.
              </p>
            </div>

            <div className="grid gap-3 py-7 md:grid-cols-[260px_1fr] md:items-center">
              <p className="font-fraunces text-2xl font-black text-[#11151C]">
                Equipo y accesos
              </p>
              <p className="text-sm leading-7 text-slate-500">
                Usuarios, roles y matriz de permisos por módulo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="bg-white px-5 py-24 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[#FF5A3C]">
              Planes
            </span>

            <h2 className="font-fraunces mx-auto mt-3 max-w-3xl text-4xl font-black leading-tight tracking-[-0.035em] md:text-5xl">
              Elige el plan según el tamaño de tu gimnasio.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-500">
              Sin contratos largos. Puedes cambiar de plan cuando tu operación
              crezca.
            </p>
          </div>

          <div
            className={`grid gap-5 ${
              plans.length === 1
                ? "mx-auto max-w-md grid-cols-1"
                : plans.length === 2
                  ? "mx-auto max-w-4xl grid-cols-1 lg:grid-cols-2"
                  : "lg:grid-cols-3"
            }`}
          >
            {plans.map((plan) => {
              const featured = Boolean(plan.popular);

              return (
                <motion.article
                  key={plan.id}
                  className={`flex flex-col rounded-3xl border p-7 transition ${
                    featured
                      ? "border-[#11151C] bg-[#11151C] text-white shadow-2xl"
                      : "border-slate-200 bg-white text-[#11151C] shadow-sm hover:shadow-md"
                  }`}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs font-black uppercase tracking-[0.16em] ${
                          featured ? "text-white/45" : "text-[#FF5A3C]"
                        }`}
                      >
                        {plan.name}
                      </p>

                      {featured && (
                        <span className="rounded-lg bg-[#FF5A3C] px-3 py-1 text-xs font-bold text-white">
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-end gap-1">
                      <p className="font-fraunces text-5xl font-black">
                        S/ {plan.price}
                      </p>
                      <span
                        className={`pb-2 text-sm font-semibold ${
                          featured ? "text-white/45" : "text-slate-400"
                        }`}
                      >
                        / mes
                      </span>
                    </div>

                    <p
                      className={`mt-3 text-sm leading-7 ${
                        featured ? "text-white/55" : "text-slate-500"
                      }`}
                    >
                      {plan.description}
                    </p>
                  </div>

                  <ul className="mb-8 flex-1 space-y-3 border-t border-current/10 pt-6">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className={`flex gap-3 text-sm leading-6 ${
                          featured ? "text-white/75" : "text-slate-600"
                        }`}
                      >
                        <Check className="mt-1 h-4 w-4 shrink-0 text-[#FF5A3C]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() =>
                      openComponent("sign-up", {
                        data: {
                          id: plan.id,
                        },
                      })
                    }
                    className={`h-12 w-full cursor-pointer rounded-xl px-5 text-sm font-bold transition active:scale-[0.98] ${
                      featured
                        ? "bg-[#FF5A3C] text-white hover:bg-[#E8431F]"
                        : "border border-[#FF5A3C] text-[#FF5A3C] hover:bg-[#FFF1ED]"
                    }`}
                  >
                    Empezar ahora
                  </button>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#EEF1EF] px-5 py-24 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[#FF5A3C]">
              Preguntas frecuentes
            </span>

            <h2 className="font-fraunces mt-3 text-4xl font-black tracking-[-0.035em]">
              Dudas antes de empezar.
            </h2>
          </div>

          <div className="divide-y divide-slate-300/70 border-y border-slate-300/70">
            <div className="py-6">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === 0 ? -1 : 0)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
              >
                <span className="text-base font-black text-[#11151C]">
                  ¿Puedo probar gratis?
                </span>
                <span className="text-xl font-light text-[#FF5A3C]">
                  {openFaq === 0 ? "−" : "+"}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openFaq === 0 && (
                  <motion.div
                    className="overflow-hidden"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <p className="pt-3 text-sm leading-7 text-slate-500">
                      Sí. Puedes probar la plataforma durante 14 días y validar
                      si encaja con la operación de tu gimnasio.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="py-6">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === 1 ? -1 : 1)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
              >
                <span className="text-base font-black text-[#11151C]">
                  ¿Necesito contrato?
                </span>
                <span className="text-xl font-light text-[#FF5A3C]">
                  {openFaq === 1 ? "−" : "+"}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openFaq === 1 && (
                  <motion.div
                    className="overflow-hidden"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <p className="pt-3 text-sm leading-7 text-slate-500">
                      No. La idea es que uses el sistema mientras te aporte
                      valor. Puedes cancelar cuando lo necesites.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="py-6">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === 2 ? -1 : 2)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
              >
                <span className="text-base font-black text-[#11151C]">
                  ¿Puedo cambiar de plan?
                </span>
                <span className="text-xl font-light text-[#FF5A3C]">
                  {openFaq === 2 ? "−" : "+"}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openFaq === 2 && (
                  <motion.div
                    className="overflow-hidden"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <p className="pt-3 text-sm leading-7 text-slate-500">
                      Sí. Puedes subir o bajar de plan según tus límites de
                      clientes, usuarios e inventario.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="py-6">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === 3 ? -1 : 3)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
              >
                <span className="text-base font-black text-[#11151C]">
                  ¿Sirve para vender productos?
                </span>
                <span className="text-xl font-light text-[#FF5A3C]">
                  {openFaq === 3 ? "−" : "+"}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {openFaq === 3 && (
                  <motion.div
                    className="overflow-hidden"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <p className="pt-3 text-sm leading-7 text-slate-500">
                      Sí. Incluye punto de venta simple para bebidas,
                      suplementos, snacks y accesorios.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#11151C] px-5 py-12 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-sm">
              <div className="mb-5 flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF5A3C] text-white">
                  <Dumbbell className="h-5 w-5" />
                </span>

                <span className="font-fraunces text-2xl font-black">
                  PULSO<span className="text-[#FF9A82]"> Gym</span>
                </span>
              </div>

              <p className="max-w-sm text-sm leading-7 text-white/50">
                Plataforma SaaS para controlar clientes, membresías, caja,
                asistencias e inventario de gimnasios.
              </p>
            </div>

            <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-end sm:gap-16 lg:ml-auto">
              <div className="sm:text-right">
                <h3 className="mb-5 text-xs font-black uppercase tracking-[0.16em] text-white/35">
                  Plataforma
                </h3>
                <div className="space-y-3 text-sm text-white/55">
                  <p className="transition hover:text-white">Funcionalidades</p>
                  <p className="transition hover:text-white">Módulos</p>
                  <p className="transition hover:text-white">Planes</p>
                  <p className="transition hover:text-white">Preguntas</p>
                </div>
              </div>

              <div className="sm:text-right">
                <h3 className="mb-5 text-xs font-black uppercase tracking-[0.16em] text-white/35">
                  Gimnasios
                </h3>
                <div className="space-y-3 text-sm text-white/55">
                  <p className="transition hover:text-white">Clientes</p>
                  <p className="transition hover:text-white">Membresías</p>
                  <p className="transition hover:text-white">Caja</p>
                  <p className="transition hover:text-white">Inventario</p>
                </div>
              </div>

              <div className="sm:text-right">
                <h3 className="mb-5 text-xs font-black uppercase tracking-[0.16em] text-white/35">
                  Contacto
                </h3>
                <div className="space-y-3 text-sm text-white/55">
                  <p className="transition hover:text-white">
                    soporte@pulso.pe
                  </p>
                  <p className="transition hover:text-white">+51 913 951 504</p>
                  <p className="transition hover:text-white">Lima, Perú</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
            <span>
              © 2026 Fábrica Abstracta. Todos los derechos reservados.
            </span>
            <span>PULSO Gym</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function MobileMenu({ close }: RegisteredComponentProps) {
  const { openComponent } = useComponent();

  return (
    <Sidebar
      close={close}
      side="right"
      size="sm"
      header={
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FF5A3C] text-white">
            <Dumbbell className="h-5 w-5" />
          </span>
          <span className="font-fraunces text-xl font-black text-[#11151C]">
            PULSO
          </span>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={() => openComponent("sign-in")}
            className="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm font-bold text-[#11151C] transition hover:bg-slate-50"
          >
            Iniciar sesión
          </button>

          <button
            type="button"
            onClick={() =>
              openComponent("sign-up", {
                data: {
                  id: "basic",
                },
              })
            }
            className="h-12 w-full cursor-pointer rounded-xl bg-[#FF5A3C] text-sm font-bold text-white transition hover:bg-[#E8431F]"
          >
            Probar gratis
          </button>
        </>
      }
    >
      <nav className="space-y-2">
        <a
          href="#features"
          onClick={close}
          className="block rounded-xl px-4 py-3 font-bold text-slate-600 transition hover:bg-slate-100 hover:text-[#11151C]"
        >
          Funcionalidades
        </a>
        <a
          href="#modules"
          onClick={close}
          className="block rounded-xl px-4 py-3 font-bold text-slate-600 transition hover:bg-slate-100 hover:text-[#11151C]"
        >
          Módulos
        </a>
        <a
          href="#plans"
          onClick={close}
          className="block rounded-xl px-4 py-3 font-bold text-slate-600 transition hover:bg-slate-100 hover:text-[#11151C]"
        >
          Planes
        </a>
        <a
          href="#faq"
          onClick={close}
          className="block rounded-xl px-4 py-3 font-bold text-slate-600 transition hover:bg-slate-100 hover:text-[#11151C]"
        >
          Preguntas
        </a>
      </nav>
    </Sidebar>
  );
}

function SignIn({ close }: RegisteredComponentProps) {
  const { openComponent } = useComponent();

  return (
    <Modal
      close={close}
      size="md"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Acceso
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Iniciar sesión
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Ingresa con tu correo o código de colaborador.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="h-11 w-full cursor-pointer rounded-xl bg-[#FF5A3C] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={close}
            className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => openComponent("recover")}
            className="cursor-pointer text-sm text-slate-500 hover:text-[#11151C]"
          >
            Olvidé mi contraseña
          </button>

          <button
            type="button"
            onClick={() => openComponent("sign-up")}
            className="cursor-pointer text-sm font-bold text-[#11151C] hover:underline"
          >
            Crear cuenta
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Correo o código
          </span>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="admin@pulso.pe"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pl-11 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </div>
        </label>

        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Contraseña
          </span>
          <div className="relative">
            <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              placeholder="••••••••"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 pl-11 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </div>
        </label>

        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-500">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer accent-[#FF5A3C]"
          />
          Entrar como colaborador
        </label>
      </div>
    </Modal>
  );
}

function SignUp({ close, data }: RegisteredComponentProps) {
  const { openComponent } = useComponent();
  const id = (data as { id?: string } | undefined)?.id ?? "basic";

  return (
    <Modal
      close={close}
      size="md"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Registro
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Crear cuenta
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Empieza tu prueba gratuita con el plan seleccionado.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="h-11 w-full cursor-pointer rounded-xl bg-[#FF5A3C] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            Crear cuenta
          </button>

          <button
            type="button"
            onClick={close}
            className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => openComponent("sign-in")}
            className="cursor-pointer text-sm font-bold text-[#11151C] hover:underline"
          >
            Ya tengo cuenta
          </button>
        </>
      }
    >
      <input type="hidden" name="plan" value={id} />

      <div className="grid gap-4">
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Correo
          </span>
          <input
            type="email"
            placeholder="admin@empresa.com"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />
        </label>

        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Contraseña
          </span>
          <input
            type="password"
            placeholder="Mínimo 8 caracteres"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />
        </label>

        <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-500">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 cursor-pointer accent-[#FF5A3C]"
          />
          <span>Acepto los términos y la política de privacidad.</span>
        </label>
      </div>
    </Modal>
  );
}

function Recover({ close }: RegisteredComponentProps) {
  const { openComponent } = useComponent();

  return (
    <Modal
      close={close}
      size="md"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Recuperación
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Recuperar contraseña
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Te enviaremos un código para restablecer tu acceso.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={() => openComponent("forgot")}
            className="h-11 w-full cursor-pointer rounded-xl bg-[#FF5A3C] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            Enviar código
          </button>

          <button
            type="button"
            onClick={close}
            className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => openComponent("forgot")}
            className="cursor-pointer text-sm font-bold text-[#11151C] hover:underline"
          >
            Ya tengo un código
          </button>

          <button
            type="button"
            onClick={() => openComponent("sign-in")}
            className="cursor-pointer text-sm text-slate-500 hover:text-[#11151C]"
          >
            Volver al inicio
          </button>
        </>
      }
    >
      <label>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Correo registrado
        </span>
        <input
          type="email"
          placeholder="admin@empresa.com"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
        />
      </label>
    </Modal>
  );
}

function Forgot({ close }: RegisteredComponentProps) {
  const { openComponent } = useComponent();

  return (
    <Modal
      close={close}
      size="md"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Nueva contraseña
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Restablecer acceso
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Ingresa el código recibido y tu nueva contraseña.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={() => openComponent("sign-in")}
            className="h-11 w-full cursor-pointer rounded-xl bg-[#11151C] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-black active:scale-[0.98]"
          >
            Guardar
          </button>

          <button
            type="button"
            onClick={close}
            className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => openComponent("recover")}
            className="cursor-pointer text-sm text-slate-500 hover:text-[#11151C]"
          >
            Solicitar nuevo código
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Código
          </span>
          <input
            placeholder="123456"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />
        </label>

        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Nueva contraseña
          </span>
          <input
            type="password"
            placeholder="Nueva contraseña"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />
        </label>
      </div>
    </Modal>
  );
}
