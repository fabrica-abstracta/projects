import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building2,
  Check,
  CreditCard,
  LifeBuoy,
  Plus,
  ReceiptText,
  Sparkles,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { RequestState } from "../../core/components";
import { fetch, useRequest } from "../../core/config/fetch";
import { Badge, getBadge } from "../../core/components/index";

type Tab = "company" | "subscription" | "payments" | "tickets";

type Modal = {
  name: "change-plan" | "resources" | "payment" | "ticket" | null;
};

type Hour = {
  day: string;
  open: string;
  close: string;
  active: boolean;
};

type Usage = {
  label: string;
  current: number;
  limit: number | "Ilimitado";
};

type Plan = {
  id: string;
  name: string;
  price: string;
  helper: string;
  active: boolean;
};

type Company = {
  commercialName: string;
  legalName: string;
  taxId: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  district: string;
  city: string;
  country: string;
  mapsUrl: string;
  specialMessage: string;
  hours: Hour[];
};

type Subscription = {
  plan: string;
  status: string;
  renewal: string;
  price: string;
  usages: Usage[];
  features: string[];
  plans: Plan[];
};

type Payment = {
  id: string;
  date: string;
  concept: string;
  method: string;
  amount: number;
  status: string;
};

type Payments = {
  current: {
    date: string;
    concept: string;
    method: string;
    amount: number;
    status: string;
  };
  history: Payment[];
};

type SupportTicket = {
  id: string;
  code: string;
  type: string;
  subject: string;
  priority: string;
  status: string;
  date: string;
};

type Summary = {
  plan: string;
  price: string;
  users: string;
  clients: string;
  nextPayment: string;
  pendingAmount: number;
};

const tabs: { key: Tab; label: string }[] = [
  { key: "company", label: "Empresa" },
  { key: "subscription", label: "Suscripción" },
  { key: "payments", label: "Pagos" },
  { key: "tickets", label: "Tickets" },
];

const companySchema = z.object({
  commercialName: z.string().trim().min(1, "El nombre comercial es requerido"),
  legalName: z.string().trim().min(1, "La razón social es requerida"),
  taxId: z.string().trim().min(1, "El RUC es requerido"),
  email: z.string().trim().email("Correo inválido"),
  phone: z.string().trim().min(1, "El teléfono es requerido"),
  whatsapp: z.string().trim().min(1, "El WhatsApp es requerido"),
  address: z.string().trim().min(1, "La dirección es requerida"),
  district: z.string().trim().min(1, "El distrito es requerido"),
  city: z.string().trim().min(1, "La ciudad es requerida"),
  country: z.string().trim().min(1, "El país es requerido"),
  mapsUrl: z.string(),
  specialMessage: z.string(),
  hours: z.array(
    z.object({
      day: z.string(),
      open: z.string(),
      close: z.string(),
      active: z.boolean(),
    }),
  ),
});

const companyDefaultValues: Company = {
  commercialName: "",
  legalName: "",
  taxId: "",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  district: "",
  city: "",
  country: "",
  mapsUrl: "",
  specialMessage: "",
  hours: [],
};

const changePlanSchema = z.object({
  plan: z.string().min(1, "El plan es requerido"),
});

const changePlanDefaultValues = {
  plan: "pro",
};

const resourcesSchema = z.object({
  resource: z.string().min(1, "El recurso es requerido"),
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
  reason: z.string().trim().min(1, "El motivo es requerido"),
});

const resourcesDefaultValues = {
  resource: "Usuarios",
  quantity: 1,
  reason: "",
};

const paymentSchema = z.object({
  method: z.string().min(1, "El método es requerido"),
});

const paymentDefaultValues = {
  method: "Yape",
};

const ticketSchema = z.object({
  type: z.string().min(1, "El tipo es requerido"),
  priority: z.string().min(1, "La prioridad es requerida"),
  subject: z.string().trim().min(1, "El asunto es requerido"),
  description: z.string().trim().min(1, "La descripción es requerida"),
});

const ticketDefaultValues = {
  type: "Incidencia",
  priority: "Media",
  subject: "",
  description: "",
};

type CompanyValues = z.infer<typeof companySchema>;
type ChangePlanValues = z.infer<typeof changePlanSchema>;
type ResourcesValues = z.infer<typeof resourcesSchema>;
type PaymentValues = z.infer<typeof paymentSchema>;
type TicketValues = z.infer<typeof ticketSchema>;

export function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>("company");
  const [modal, setModal] = useState<Modal>({ name: null });

  const summary = useRequest<Summary>({
    plan: "",
    price: "",
    users: "",
    clients: "",
    nextPayment: "",
    pendingAmount: 0,
  });

  const company = useRequest<Company>(companyDefaultValues);

  const subscription = useRequest<Subscription>({
    plan: "",
    status: "",
    renewal: "",
    price: "",
    usages: [],
    features: [],
    plans: [],
  });

  const payments = useRequest<Payments>({
    current: {
      date: "",
      concept: "",
      method: "",
      amount: 0,
      status: "",
    },
    history: [],
  });

  const tickets = useRequest<SupportTicket[]>([]);
  const saveCompany = useRequest<unknown>(null);

  const companyForm = useForm<CompanyValues>({
    resolver: zodResolver(companySchema),
    defaultValues: companyDefaultValues,
  });

  useEffect(() => {
    summary.request(fetch.get("/settings/summary"));

    company.start();

    fetch
      .get("/settings/company")
      .then((value: Company) => {
        company.success(value);
        companyForm.reset(value);
      })
      .catch(company.fail);

    subscription.request(fetch.get("/settings/subscription"));
    payments.request(fetch.get("/settings/payments"));
    tickets.request(fetch.get("/settings/tickets"));
  }, []);

  return (
    <main className="min-h-screen bg-[#EEF1EF] p-5 text-[#11151C] md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Configuración SaaS
          </p>

          <h1 className="font-fraunces -mt-0.5 text-2xl font-extrabold tracking-tight md:text-3xl">
            Configuraciones
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Administra tu empresa, suscripción, pagos y soporte desde un solo
            lugar.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModal({ name: "change-plan" })}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A3C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E8431F] active:scale-[0.98]"
        >
          <CreditCard className="h-4 w-4" />
          Cambiar plan
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Plan actual
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.plan}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            {summary.data.price}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Usuarios
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.users}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Límite del plan
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Clientes
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.clients}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">Uso actual</p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Próximo pago
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.nextPayment}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Pendiente S/ {summary.data.pendingAmount}
          </p>
        </div>
      </div>

      <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <nav className="p-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`block w-full cursor-pointer rounded-xl px-3.5 py-3 text-left transition ${
                  activeTab === tab.key
                    ? "bg-[#11151C] text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-[#11151C]"
                }`}
              >
                <span className="block text-sm font-black">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          {activeTab === "company" && (
            <>
              <div className="flex items-start gap-3 border-b border-slate-100 px-6 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1ED] text-[#FF5A3C]">
                  <Building2 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-fraunces text-xl font-bold text-[#11151C]">
                    Empresa
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Datos públicos y operativos de tu negocio.
                  </p>
                </div>
              </div>

              <RequestState
                status={company.status}
                skeleton={null}
                error={
                  <div className="p-6 text-sm font-semibold text-[#E8431F]">
                    _
                  </div>
                }
              >
                <form
                  onSubmit={companyForm.handleSubmit((values) => {
                    saveCompany.start();

                    fetch
                      .post("/settings/company", values)
                      .then(() => saveCompany.success(null))
                      .catch(saveCompany.fail);
                  })}
                  className="space-y-6 p-6"
                >
                  <section className="border-b border-slate-100 pb-6">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-sm font-black text-[#11151C]">
                        Datos principales
                      </h3>

                      <button
                        type="submit"
                        className="cursor-pointer rounded-xl bg-[#FF5A3C] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#E8431F]"
                      >
                        Guardar cambios
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label>
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                          Nombre comercial
                        </span>

                        <input
                          {...companyForm.register("commercialName")}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                          Razón social
                        </span>

                        <input
                          {...companyForm.register("legalName")}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                          RUC
                        </span>

                        <input
                          {...companyForm.register("taxId")}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                          Correo
                        </span>

                        <input
                          {...companyForm.register("email")}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                          Teléfono
                        </span>

                        <input
                          {...companyForm.register("phone")}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                          WhatsApp
                        </span>

                        <input
                          {...companyForm.register("whatsapp")}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </label>
                    </div>
                  </section>

                  <section className="border-b border-slate-100 pb-6">
                    <h3 className="mb-4 text-sm font-black text-[#11151C]">
                      Ubicación
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label>
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                          Dirección
                        </span>

                        <input
                          {...companyForm.register("address")}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                          Distrito
                        </span>

                        <input
                          {...companyForm.register("district")}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                          Ciudad
                        </span>

                        <input
                          {...companyForm.register("city")}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </label>

                      <label>
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                          País
                        </span>

                        <input
                          {...companyForm.register("country")}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </label>

                      <label className="md:col-span-2">
                        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                          Google Maps URL
                        </span>

                        <input
                          {...companyForm.register("mapsUrl")}
                          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </label>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-4 text-sm font-black text-[#11151C]">
                      Horarios de atención
                    </h3>

                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                      <table className="w-full min-w-[680px] text-left">
                        <thead className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                          <tr>
                            <th className="px-5 py-3 font-bold">Día</th>
                            <th className="px-5 py-3 font-bold">Apertura</th>
                            <th className="px-5 py-3 font-bold">Cierre</th>
                            <th className="px-5 py-3 text-center font-bold">
                              Activo
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {companyForm.watch("hours").map((hour, index) => (
                            <tr key={hour.day}>
                              <td className="px-5 py-4 text-sm font-bold text-[#11151C]">
                                {hour.day}
                              </td>

                              <td className="px-5 py-4">
                                <input
                                  type="time"
                                  disabled={
                                    !companyForm.watch(`hours.${index}.active`)
                                  }
                                  {...companyForm.register(
                                    `hours.${index}.open`,
                                  )}
                                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
                                />
                              </td>

                              <td className="px-5 py-4">
                                <input
                                  type="time"
                                  disabled={
                                    !companyForm.watch(`hours.${index}.active`)
                                  }
                                  {...companyForm.register(
                                    `hours.${index}.close`,
                                  )}
                                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
                                />
                              </td>

                              <td className="px-5 py-4 text-center">
                                <input
                                  type="checkbox"
                                  {...companyForm.register(
                                    `hours.${index}.active`,
                                  )}
                                  className="h-4 w-4 cursor-pointer accent-[#FF5A3C]"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <label className="mt-4 block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        Mensaje especial
                      </span>

                      <textarea
                        rows={3}
                        {...companyForm.register("specialMessage")}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
                      />
                    </label>
                  </section>
                </form>
              </RequestState>
            </>
          )}

          {activeTab === "subscription" && (
            <>
              <div className="flex items-start gap-3 border-b border-slate-100 px-6 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1ED] text-[#FF5A3C]">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-fraunces text-xl font-bold text-[#11151C]">
                    Suscripción
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Revisa el estado actual del plan, límites y características.
                  </p>
                </div>
              </div>

              <RequestState
                status={subscription.status}
                skeleton={null}
                error={
                  <div className="p-6 text-sm font-semibold text-[#E8431F]">
                    _
                  </div>
                }
              >
                <div className="grid gap-6 p-6 xl:grid-cols-[1fr_320px]">
                  <div className="space-y-6">
                    <section className="border-b border-slate-100 pb-6">
                      <h3 className="mb-4 text-sm font-black text-[#11151C]">
                        Resumen actual
                      </h3>

                      <div className="grid gap-4 md:grid-cols-4">
                        {[
                          ["Plan actual", subscription.data.plan],
                          ["Estado", subscription.data.status],
                          ["Renovación", subscription.data.renewal],
                          ["Precio", subscription.data.price],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                          >
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              {label}
                            </p>

                            <p className="mt-2 text-sm font-black text-[#11151C]">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-sm font-black text-[#11151C]">
                          Límites de uso
                        </h3>

                        <button
                          type="button"
                          onClick={() => setModal({ name: "resources" })}
                          className="cursor-pointer rounded-xl bg-[#11151C] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black"
                        >
                          Solicitar más recursos
                        </button>
                      </div>

                      <div className="space-y-4">
                        {subscription.data.usages.map((usage) => {
                          const percent =
                            usage.limit === "Ilimitado"
                              ? 100
                              : Math.min(
                                  100,
                                  Math.round(
                                    (usage.current / usage.limit) * 100,
                                  ),
                                );

                          return (
                            <div key={usage.label}>
                              <div className="mb-1.5 flex items-center justify-between">
                                <p className="text-sm font-bold text-[#11151C]">
                                  {usage.label}
                                </p>

                                <p className="text-xs font-semibold text-slate-400">
                                  {usage.current} / {usage.limit}
                                </p>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full ${
                                    percent > 85
                                      ? "bg-[#FF5A3C]"
                                      : "bg-[#1FAE6B]"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </div>

                  <aside className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EAFBF2] text-[#168F57]">
                        <Check className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-black text-[#11151C]">
                          Características
                        </p>
                        <p className="text-xs text-slate-400">
                          Incluidas en tu plan
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {subscription.data.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EAFBF2] text-[11px] font-black text-[#168F57]">
                            ✓
                          </span>

                          <span className="text-sm font-semibold text-slate-600">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </aside>
                </div>
              </RequestState>
            </>
          )}

          {activeTab === "payments" && (
            <>
              <div className="flex items-start gap-3 border-b border-slate-100 px-6 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1ED] text-[#FF5A3C]">
                  <ReceiptText className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-fraunces text-xl font-bold text-[#11151C]">
                    Pagos
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Historial de facturación por el uso de la plataforma.
                  </p>
                </div>
              </div>

              <RequestState
                status={payments.status}
                skeleton={null}
                error={
                  <div className="p-6 text-sm font-semibold text-[#E8431F]">
                    _
                  </div>
                }
              >
                <div className="space-y-6 p-6">
                  <section className="border-b border-slate-100 pb-6">
                    <h3 className="mb-4 text-sm font-black text-[#11151C]">
                      Facturación actual
                    </h3>

                    <div className="grid gap-4 md:grid-cols-4">
                      {[
                        ["Próximo pago", payments.data.current.date],
                        ["Monto", `S/ ${payments.data.current.amount}`],
                        ["Método", payments.data.current.method],
                        ["Estado", payments.data.current.status],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                        >
                          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                            {label}
                          </p>

                          <p className="mt-2 text-sm font-black text-[#11151C]">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setModal({ name: "payment" })}
                        className="cursor-pointer rounded-xl bg-[#FF5A3C] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#E8431F]"
                      >
                        Pagar ahora
                      </button>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-4 text-sm font-black text-[#11151C]">
                      Historial de pagos
                    </h3>

                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                      <table className="w-full min-w-[760px] text-left">
                        <thead className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                          <tr>
                            <th className="px-5 py-3 font-bold">Fecha</th>
                            <th className="px-5 py-3 font-bold">Concepto</th>
                            <th className="px-5 py-3 font-bold">Método</th>
                            <th className="px-5 py-3 text-right font-bold">
                              Monto
                            </th>
                            <th className="px-5 py-3 font-bold">Estado</th>
                            <th className="px-5 py-3 text-right font-bold">
                              Comprobante
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {payments.data.history.map((payment) => (
                            <tr key={payment.id}>
                              <td className="px-5 py-4 text-sm font-semibold text-[#11151C]">
                                {payment.date}
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-500">
                                {payment.concept}
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-500">
                                {payment.method}
                              </td>

                              <td className="px-5 py-4 text-right text-sm font-black text-[#11151C]">
                                S/ {payment.amount}
                              </td>

                              <td className="px-5 py-4">
                                <Badge
                                  badge={getBadge(
                                    {
                                      paid: {
                                        label: "Pagado",
                                        background: "#EAFBF2",
                                        color: "#168F57",
                                      },
                                      pending: {
                                        label: "Pendiente",
                                        background: "#FFF7E8",
                                        color: "#B9740F",
                                      },
                                      expired: {
                                        label: "Vencido",
                                        background: "#FFF1F2",
                                        color: "#F43F5E",
                                      },
                                    },
                                    payment.status,
                                  )}
                                />
                              </td>

                              <td className="px-5 py-4 text-right">
                                <button
                                  type="button"
                                  className="cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition hover:border-[#FF5A3C] hover:text-[#11151C]"
                                >
                                  Ver
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              </RequestState>
            </>
          )}

          {activeTab === "tickets" && (
            <>
              <div className="flex items-start gap-3 border-b border-slate-100 px-6 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1ED] text-[#FF5A3C]">
                  <LifeBuoy className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-fraunces text-xl font-bold text-[#11151C]">
                    Tickets
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Solicitudes de soporte, incidencias, consultas o mejoras.
                  </p>
                </div>
              </div>

              <RequestState
                status={tickets.status}
                skeleton={null}
                error={
                  <div className="p-6 text-sm font-semibold text-[#E8431F]">
                    _
                  </div>
                }
              >
                <div className="p-6">
                  <section>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-sm font-black text-[#11151C]">
                        Centro de soporte
                      </h3>

                      <button
                        type="button"
                        onClick={() => setModal({ name: "ticket" })}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF5A3C] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#E8431F]"
                      >
                        <Plus className="h-4 w-4" />
                        Nuevo ticket
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-100">
                      <table className="w-full min-w-[820px] text-left">
                        <thead className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                          <tr>
                            <th className="px-5 py-3 font-bold">Código</th>
                            <th className="px-5 py-3 font-bold">Tipo</th>
                            <th className="px-5 py-3 font-bold">Asunto</th>
                            <th className="px-5 py-3 font-bold">Prioridad</th>
                            <th className="px-5 py-3 font-bold">Estado</th>
                            <th className="px-5 py-3 font-bold">Fecha</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {tickets.data.map((ticket) => (
                            <tr key={ticket.id}>
                              <td className="px-5 py-4 font-plex text-xs font-bold text-slate-500">
                                {ticket.code}
                              </td>

                              <td className="px-5 py-4 text-sm font-semibold text-[#11151C]">
                                {ticket.type}
                              </td>

                              <td className="px-5 py-4 text-sm font-bold text-[#11151C]">
                                {ticket.subject}
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-500">
                                {ticket.priority}
                              </td>

                              <td className="px-5 py-4">
                                <Badge
                                  badge={getBadge(
                                    {
                                      open: {
                                        label: "Abierto",
                                        background: "#FFF7E8",
                                        color: "#B9740F",
                                      },
                                      review: {
                                        label: "En revisión",
                                        background: "#FFF1ED",
                                        color: "#E8431F",
                                      },
                                      answered: {
                                        label: "Respondido",
                                        background: "#EAFBF2",
                                        color: "#168F57",
                                      },
                                      closed: {
                                        label: "Cerrado",
                                        background: "#F1F5F9",
                                        color: "#64748B",
                                      },
                                    },
                                    ticket.status,
                                  )}
                                />
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-500">
                                {ticket.date}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              </RequestState>
            </>
          )}
        </section>
      </section>

      <AnimatePresence mode="wait">
        {modal.name === "change-plan" ? (
          <ChangePlanModal
            key="change-plan"
            plans={subscription.data.plans}
            onClose={() => setModal({ name: null })}
            onSaved={() => {
              setModal({ name: null });
              subscription.request(fetch.get("/settings/subscription"));
              summary.request(fetch.get("/settings/summary"));
            }}
          />
        ) : modal.name === "resources" ? (
          <ResourcesModal
            key="resources"
            onClose={() => setModal({ name: null })}
            onSaved={() => setModal({ name: null })}
          />
        ) : modal.name === "payment" ? (
          <PaymentModal
            key="payment"
            current={payments.data.current}
            onClose={() => setModal({ name: null })}
            onSaved={() => {
              setModal({ name: null });
              payments.request(fetch.get("/settings/payments"));
              summary.request(fetch.get("/settings/summary"));
            }}
          />
        ) : modal.name === "ticket" ? (
          <TicketModal
            key="ticket"
            onClose={() => setModal({ name: null })}
            onSaved={() => {
              setModal({ name: null });
              tickets.request(fetch.get("/settings/tickets"));
            }}
          />
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function ChangePlanModal({
  plans,
  onClose,
  onSaved,
}: {
  plans: Plan[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const save = useRequest<unknown>(null);

  const form = useForm<ChangePlanValues>({
    resolver: zodResolver(changePlanSchema),
    defaultValues: changePlanDefaultValues,
  });

  useEffect(() => {
    const current = plans.find((plan) => plan.active);

    if (current) {
      form.setValue("plan", current.id);
    }
  }, [plans]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#11151C]/55 px-4 pt-8 backdrop-blur-sm md:pt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.form
        onSubmit={form.handleSubmit((values) => {
          save.start();

          fetch
            .post("/settings/subscription/change-plan", values)
            .then(() => {
              save.success(null);
              onSaved();
            })
            .catch(save.fail);
        })}
        className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
      >
        <ModalHeader
          eyebrow="Suscripción"
          title="Cambiar plan"
          description="Selecciona el nuevo plan para tu empresa."
          onClose={onClose}
        />

        <div className="px-6 py-5">
          <div className="grid gap-4">
            {plans.map((plan) => (
              <label
                key={plan.id}
                className={`cursor-pointer rounded-2xl border px-4 py-4 transition ${
                  form.watch("plan") === plan.id
                    ? "border-[#FF5A3C] bg-[#FFF1ED]"
                    : "border-slate-200 bg-white hover:border-[#FF5A3C]"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-[#11151C]">
                      {plan.name}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {plan.helper}
                    </p>
                  </div>

                  <input
                    type="radio"
                    value={plan.id}
                    {...form.register("plan")}
                    className="mt-1 cursor-pointer accent-[#FF5A3C]"
                  />
                </div>

                <p className="font-fraunces mt-3 text-2xl font-black text-[#11151C]">
                  {plan.price}
                </p>
              </label>
            ))}
          </div>

          <ModalFooter
            onClose={onClose}
            actionText="Solicitar cambio"
            actionClass="bg-[#FF5A3C] hover:bg-[#E8431F]"
          />
        </div>
      </motion.form>
    </motion.div>
  );
}

function ResourcesModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const save = useRequest<unknown>(null);

  const form = useForm<ResourcesValues>({
    resolver: zodResolver(resourcesSchema),
    defaultValues: resourcesDefaultValues,
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#11151C]/55 px-4 pt-8 backdrop-blur-sm md:pt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.form
        onSubmit={form.handleSubmit((values) => {
          save.start();

          fetch
            .post("/settings/subscription/resources", values)
            .then(() => {
              save.success(null);
              onSaved();
            })
            .catch(save.fail);
        })}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
      >
        <ModalHeader
          eyebrow="Límites"
          title="Solicitar más recursos"
          description="Pide aumento de límites para tu plan actual."
          onClose={onClose}
        />

        <div className="px-6 py-5">
          <div className="grid gap-4">
            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Recurso
              </span>

              <select
                {...form.register("resource")}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="Usuarios">Usuarios</option>
                <option value="Clientes">Clientes</option>
                <option value="Membresías">Membresías</option>
                <option value="Planes">Planes</option>
              </select>
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Cantidad adicional
              </span>

              <input
                type="number"
                placeholder="Ej. 5"
                {...form.register("quantity", { valueAsNumber: true })}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Motivo
              </span>

              <textarea
                rows={4}
                placeholder="Ej. Necesito agregar más colaboradores."
                {...form.register("reason")}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
              />
            </label>
          </div>

          <ModalFooter
            onClose={onClose}
            actionText="Enviar solicitud"
            actionClass="bg-[#11151C] hover:bg-black"
          />
        </div>
      </motion.form>
    </motion.div>
  );
}

function PaymentModal({
  current,
  onClose,
  onSaved,
}: {
  current: Payments["current"];
  onClose: () => void;
  onSaved: () => void;
}) {
  const save = useRequest<unknown>(null);

  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: paymentDefaultValues,
  });

  useEffect(() => {
    form.setValue("method", current.method || "Yape");
  }, [current]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#11151C]/55 px-4 pt-8 backdrop-blur-sm md:pt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.form
        onSubmit={form.handleSubmit((values) => {
          save.start();

          fetch
            .post("/settings/payments/pay", values)
            .then(() => {
              save.success(null);
              onSaved();
            })
            .catch(save.fail);
        })}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
      >
        <ModalHeader
          eyebrow="Facturación"
          title="Pagar suscripción"
          description="Completa el pago pendiente del plan actual."
          onClose={onClose}
        />

        <div className="px-6 py-5">
          <div className="rounded-2xl bg-[#11151C] p-5 text-white">
            <p className="text-xs font-semibold text-white/45">Monto a pagar</p>

            <p className="font-fraunces mt-1 text-4xl font-black">
              S/ {current.amount.toFixed(2)}
            </p>

            <p className="mt-2 text-sm text-white/45">
              {current.concept} · vence el {current.date}
            </p>
          </div>

          <div className="mt-5 grid gap-4">
            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Método de pago
              </span>

              <select
                {...form.register("method")}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="Yape">Yape</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </label>
          </div>

          <ModalFooter
            onClose={onClose}
            actionText="Confirmar pago"
            actionClass="bg-[#FF5A3C] hover:bg-[#E8431F]"
          />
        </div>
      </motion.form>
    </motion.div>
  );
}

function TicketModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const save = useRequest<unknown>(null);

  const form = useForm<TicketValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: ticketDefaultValues,
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#11151C]/55 px-4 pt-8 backdrop-blur-sm md:pt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.form
        onSubmit={form.handleSubmit((values) => {
          save.start();

          fetch
            .post("/settings/tickets", values)
            .then(() => {
              save.success(null);
              onSaved();
            })
            .catch(save.fail);
        })}
        className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
      >
        <ModalHeader
          eyebrow="Soporte"
          title="Nuevo ticket"
          description="Registra una incidencia, consulta o mejora."
          onClose={onClose}
        />

        <div className="px-6 py-5">
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Tipo
                </span>

                <select
                  {...form.register("type")}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="Incidencia">Incidencia</option>
                  <option value="Mejora">Mejora</option>
                  <option value="Consulta">Consulta</option>
                  <option value="Facturación">Facturación</option>
                </select>
              </label>

              <label>
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Prioridad
                </span>

                <select
                  {...form.register("priority")}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </label>
            </div>

            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Asunto
              </span>

              <input
                placeholder="Ej. No carga reporte de ventas"
                {...form.register("subject")}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Descripción
              </span>

              <textarea
                rows={5}
                placeholder="Explica lo que ocurre o lo que necesitas."
                {...form.register("description")}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-[#11151C] outline-none transition placeholder:text-slate-300 focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
              />
            </label>
          </div>

          <ModalFooter
            onClose={onClose}
            actionText="Enviar ticket"
            actionClass="bg-[#FF5A3C] hover:bg-[#E8431F]"
          />
        </div>
      </motion.form>
    </motion.div>
  );
}

function ModalHeader({
  eyebrow,
  title,
  description,
  onClose,
}: {
  eyebrow: string;
  title: string;
  description: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
      <div>
        <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
          {eyebrow}
        </p>

        <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#11151C]"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function ModalFooter({
  onClose,
  actionText,
  actionClass,
}: {
  onClose: () => void;
  actionText: string;
  actionClass: string;
}) {
  return (
    <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-5">
      <button
        type="button"
        onClick={onClose}
        className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
      >
        Cancelar
      </button>

      <button
        type="submit"
        className={`cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors active:scale-[0.98] ${actionClass}`}
      >
        {actionText}
      </button>
    </div>
  );
}
