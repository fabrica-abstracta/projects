import { useEffect } from "react";
import {
  Banknote,
  CalendarDays,
  CreditCard,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { RequestState } from "../../core/components";
import { fetch, useRequest } from "../../core/config/fetch";
import { Badge, getBadge, Modal } from "../../core/components/index";
import {
  useComponent,
  type RegisteredComponentProps,
} from "../../core/context/component";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  lastPlan: string;
  plan: {
    name: string;
    start: string;
    expires: string;
  } | null;
};

const filtersSchema = z.object({
  search: z.string(),
  status: z.string(),
});

const filtersDefaultValues = {
  search: "",
  status: "",
};

const customerSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  phone: z.string().trim().min(1, "El teléfono es requerido"),
  email: z.string().trim().email("Correo inválido"),
});

const customerDefaultValues = {
  name: "",
  phone: "",
  email: "",
};

const membershipSchema = z.object({
  plan: z.string().min(1, "El plan es requerido"),
  amount: z.number().min(0, "El monto no puede ser negativo"),
  start: z.string().min(1, "La fecha de inicio es requerida"),
  end: z.string().min(1, "La fecha de fin es requerida"),
  method: z.string().min(1, "El método es requerido"),
});

const membershipDefaultValues = {
  plan: "monthly",
  amount: 120,
  start: "",
  end: "",
  method: "cash",
};

const paymentSchema = z.object({
  concept: z.string().trim().min(1, "El concepto es requerido"),
  amount: z.number().min(0, "El monto no puede ser negativo"),
  method: z.string().min(1, "El método es requerido"),
  date: z.string().min(1, "La fecha es requerida"),
});

const paymentDefaultValues = {
  concept: "Pago de membresía",
  amount: 120,
  method: "cash",
  date: "",
};

type FiltersValues = z.infer<typeof filtersSchema>;
type CustomerValues = z.infer<typeof customerSchema>;
type MembershipValues = z.infer<typeof membershipSchema>;
type PaymentValues = z.infer<typeof paymentSchema>;

export function Clients() {
  const { registerComponent, openComponent } = useComponent();
  const customers = useRequest<Customer[]>([]);

  const filters = useForm<FiltersValues>({
    resolver: zodResolver(filtersSchema),
    defaultValues: filtersDefaultValues,
  });

  useEffect(() => {
    registerComponent("clients-create-customer", CreateCustomerModal);
    registerComponent("clients-edit-customer", EditCustomerModal);
    registerComponent("clients-membership", MembershipModal);
    registerComponent("clients-payment", PaymentModal);
    registerComponent("clients-renew", RenewModal);
    registerComponent("clients-delete", DeleteModal);
  }, [registerComponent]);

  useEffect(() => {
    customers.request(fetch.get("/clients", { query: filtersDefaultValues }));
  }, []);

  return (
    <main className="min-h-screen space-y-4 bg-[#EEF1EF] p-5 text-[#11151C] md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Base de clientes
          </p>

          <h1 className="font-fraunces -mt-0.5 text-2xl font-extrabold tracking-tight md:text-3xl">
            Clientes
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Actualmente tienes{" "}
            <span className="font-bold text-[#11151C]">
              <RequestState
                status={customers.status}
                skeleton={null}
                error={<span className="text-[#E8431F]">_</span>}
              >
                {customers.data.length}
              </RequestState>
            </span>{" "}
            clientes registrados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openComponent("clients-create-customer")}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A3C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nuevo cliente
        </button>
      </div>

      <form
        onSubmit={filters.handleSubmit((values) =>
          customers.request(fetch.get("/clients", { query: values })),
        )}
        className="flex flex-col gap-3 border-b border-slate-100 pb-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o correo..."
            {...filters.register("search")}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#FF5A3C] focus:ring-2 focus:ring-[#FF5A3C]/30"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: "", label: "Todos" },
            { id: "active", label: "Activos" },
            { id: "expiring", label: "Por vencer" },
            { id: "expired", label: "Vencidos" },
            { id: "none", label: "Sin membresía" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                filters.setValue("status", item.id);

                customers.request(
                  fetch.get("/clients", {
                    query: {
                      search: filters.getValues("search"),
                      status: item.id,
                    },
                  }),
                );
              }}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                filters.watch("status") === item.id
                  ? "bg-[#11151C] text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-[#FF5A3C]"
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            type="submit"
            className="cursor-pointer whitespace-nowrap rounded-lg bg-[#FF5A3C] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#E8431F]"
          >
            Buscar
          </button>
        </div>
      </form>

      <RequestState
        status={customers.status}
        skeleton={null}
        error={
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-[#E8431F]">
            _
          </div>
        }
      >
        <>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            {customers.data.map((customer, index) => (
              <article
                key={customer.id}
                className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      style={{
                        backgroundColor: [
                          "#FF5A3C",
                          "#1FAE6B",
                          "#11151C",
                          "#E2932A",
                          "#6D5DFB",
                          "#0F766E",
                        ][index % 6],
                      }}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    >
                      {customer.name
                        .split(" ")
                        .slice(0, 2)
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-[#11151C]">
                        {customer.name}
                      </h3>

                      <p className="truncate text-xs text-slate-400">
                        {customer.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        openComponent("clients-edit-customer", {
                          data: { id: customer.id },
                        })
                      }
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openComponent("clients-delete", {
                          data: { id: customer.id },
                        })
                      }
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-slate-400">
                        {customer.plan ? "Plan actual" : "Último plan"}
                      </p>

                      <p className="truncate text-sm font-bold text-[#11151C]">
                        {customer.plan?.name ?? customer.lastPlan}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-medium text-slate-400">
                        {customer.plan ? "Vence" : "Estado"}
                      </p>

                      <p className="text-sm font-bold text-[#11151C]">
                        {customer.plan?.expires ?? "Sin fecha"}
                      </p>
                    </div>
                  </div>

                  {customer.plan && (
                    <p className="mt-2 text-xs font-medium text-slate-400">
                      Inicio:{" "}
                      <span className="font-bold text-[#11151C]">
                        {customer.plan.start}
                      </span>
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <Badge
                      badge={getBadge(
                        {
                          active: {
                            label: "Activa",
                            background: "#EAFBF2",
                            color: "#168F57",
                          },
                          expiring: {
                            label: "Por vencer",
                            background: "#FFF7E8",
                            color: "#B9740F",
                          },
                          expired: {
                            label: "Vencida",
                            background: "#FFF1F2",
                            color: "#F43F5E",
                          },
                          none: {
                            label: "Sin membresía",
                            background: "#F1F5F9",
                            color: "#64748B",
                          },
                        },
                        customer.status,
                      )}
                    />

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          openComponent("clients-membership", {
                            data: { id: customer.id },
                          })
                        }
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openComponent("clients-payment", {
                            data: { id: customer.id },
                          })
                        }
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                      >
                        <CreditCard className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openComponent("clients-renew", {
                            data: { id: customer.id },
                          })
                        }
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-orange-50 hover:text-[#FF5A3C]"
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {customers.data.length === 0 && (
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 text-center text-sm font-medium text-slate-400">
              No se encontraron clientes.
            </div>
          )}
        </>
      </RequestState>
    </main>
  );
}

function CreateCustomerModal({ close }: RegisteredComponentProps) {
  const form = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: customerDefaultValues,
  });

  return (
    <Modal
      close={close}
      size="xl"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Alta rápida
          </p>

          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Nuevo cliente
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Completa los datos principales del cliente.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={form.handleSubmit(() => close())}
            className="cursor-pointer rounded-xl bg-[#FF5A3C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            Crear cliente
          </button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(() => close())}>
        <div className="grid gap-4">
          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Nombre completo
            </span>

            <input
              placeholder="Ej. María López Castro"
              {...form.register("name")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />

            {form.formState.errors.name && (
              <p className="mt-1 text-xs font-medium text-rose-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Teléfono
              </span>

              <input
                placeholder="987 654 321"
                {...form.register("phone")}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
              />

              {form.formState.errors.phone && (
                <p className="mt-1 text-xs font-medium text-rose-500">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Correo electrónico
              </span>

              <input
                placeholder="cliente@correo.com"
                {...form.register("email")}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
              />

              {form.formState.errors.email && (
                <p className="mt-1 text-xs font-medium text-rose-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function EditCustomerModal({ data, close }: RegisteredComponentProps) {
  const id = (data as { id?: string } | undefined)?.id;

  const form = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: customerDefaultValues,
  });

  return (
    <Modal
      close={close}
      size="xl"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Editar
          </p>

          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Editar cliente
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Completa los datos principales del cliente.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={form.handleSubmit(() => close())}
            className="cursor-pointer rounded-xl bg-[#FF5A3C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            Guardar cambios
          </button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(() => close())}>
        <input type="hidden" value={id ?? ""} />

        <div className="grid gap-4">
          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Nombre completo
            </span>

            <input
              placeholder="Ej. María López Castro"
              {...form.register("name")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />

            {form.formState.errors.name && (
              <p className="mt-1 text-xs font-medium text-rose-500">
                {form.formState.errors.name.message}
              </p>
            )}
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Teléfono
              </span>

              <input
                placeholder="987 654 321"
                {...form.register("phone")}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
              />

              {form.formState.errors.phone && (
                <p className="mt-1 text-xs font-medium text-rose-500">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Correo electrónico
              </span>

              <input
                placeholder="cliente@correo.com"
                {...form.register("email")}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
              />

              {form.formState.errors.email && (
                <p className="mt-1 text-xs font-medium text-rose-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function MembershipModal({ data, close }: RegisteredComponentProps) {
  const id = (data as { id?: string } | undefined)?.id;

  const form = useForm<MembershipValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: membershipDefaultValues,
  });

  return (
    <Modal
      close={close}
      size="xl"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Nueva membresía
          </p>

          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Registrar membresía
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Asigna un plan inicial al cliente seleccionado.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={form.handleSubmit(() => close())}
            className="cursor-pointer rounded-xl bg-[#11151C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-black active:scale-[0.98]"
          >
            Registrar membresía
          </button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(() => close())}>
        <input type="hidden" value={id ?? ""} />

        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Plan
            </span>

            <select
              {...form.register("plan")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            >
              <option value="monthly">Plan Mensual · S/ 120</option>
              <option value="quarterly">Plan Trimestral · S/ 320</option>
              <option value="semiannual">Plan Semestral · S/ 560</option>
              <option value="annual">Plan Anual · S/ 980</option>
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Monto
            </span>

            <div className="relative">
              <Banknote className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="number"
                {...form.register("amount", { valueAsNumber: true })}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
              />
            </div>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Inicio
            </span>

            <div className="relative">
              <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="date"
                {...form.register("start")}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
              />
            </div>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Fin
            </span>

            <div className="relative">
              <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="date"
                {...form.register("end")}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
              />
            </div>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Método de pago
            </span>

            <select
              {...form.register("method")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            >
              <option value="cash">Efectivo</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
              <option value="card">Tarjeta</option>
            </select>
          </label>
        </div>
      </form>
    </Modal>
  );
}

function PaymentModal({ data, close }: RegisteredComponentProps) {
  const id = (data as { id?: string } | undefined)?.id;

  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: paymentDefaultValues,
  });

  return (
    <Modal
      close={close}
      size="xl"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Caja rápida
          </p>

          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Registrar pago
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Agrega la información del pago realizado.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={form.handleSubmit(() => close())}
            className="cursor-pointer rounded-xl bg-[#FF5A3C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            Guardar pago
          </button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(() => close())}>
        <input type="hidden" value={id ?? ""} />

        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Concepto
            </span>

            <input
              {...form.register("concept")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Monto
            </span>

            <input
              type="number"
              {...form.register("amount", { valueAsNumber: true })}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Método
            </span>

            <select
              {...form.register("method")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            >
              <option value="cash">Efectivo</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
              <option value="card">Tarjeta</option>
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Fecha
            </span>

            <input
              type="date"
              {...form.register("date")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>
        </div>
      </form>
    </Modal>
  );
}

function RenewModal({ data, close }: RegisteredComponentProps) {
  const id = (data as { id?: string } | undefined)?.id;

  const form = useForm<MembershipValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: membershipDefaultValues,
  });

  return (
    <Modal
      close={close}
      size="xl"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Renovación
          </p>

          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Renovar membresía
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Selecciona el nuevo periodo y plan del cliente.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={form.handleSubmit(() => close())}
            className="cursor-pointer rounded-xl bg-[#1FAE6B] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#168F57] active:scale-[0.98]"
          >
            Renovar membresía
          </button>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(() => close())}>
        <input type="hidden" value={id ?? ""} />

        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Plan
            </span>

            <select
              {...form.register("plan")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            >
              <option value="monthly">Plan Mensual · S/ 120</option>
              <option value="quarterly">Plan Trimestral · S/ 320</option>
              <option value="semiannual">Plan Semestral · S/ 560</option>
              <option value="annual">Plan Anual · S/ 980</option>
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Monto
            </span>

            <input
              type="number"
              {...form.register("amount", { valueAsNumber: true })}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Nuevo inicio
            </span>

            <input
              type="date"
              {...form.register("start")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Nuevo fin
            </span>

            <input
              type="date"
              {...form.register("end")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Método de pago
            </span>

            <select
              {...form.register("method")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            >
              <option value="cash">Efectivo</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
              <option value="card">Tarjeta</option>
            </select>
          </label>
        </div>
      </form>
    </Modal>
  );
}

function DeleteModal({ data, close }: RegisteredComponentProps) {
  const id = (data as { id?: string } | undefined)?.id;

  return (
    <Modal
      close={close}
      size="md"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-rose-500">
            Eliminar
          </p>

          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Eliminar cliente
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Esta acción quitará el cliente del listado.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-600 active:scale-[0.98]"
          >
            Sí, eliminar
          </button>
        </>
      }
    >
      <input type="hidden" value={id ?? ""} />

      <p className="text-sm leading-6 text-slate-500">
        ¿Seguro que deseas eliminar este cliente? Revisa bien antes de
        continuar.
      </p>
    </Modal>
  );
}
