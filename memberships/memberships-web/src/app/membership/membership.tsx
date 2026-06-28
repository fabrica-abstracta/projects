import { useEffect, useState } from "react";
import {
  Banknote,
  CalendarDays,
  CreditCard,
  Plus,
  RefreshCcw,
  Search,
  XCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { RequestState } from "../../core/components";
import { fetch, useRequest } from "../../core/config/fetch";
import {
  useComponent,
  type RegisteredComponentProps,
} from "../../core/context/component";
import { Badge, getBadge, Modal } from "../../core/components/index";

type Membership = {
  id: string;
  client: string;
  phone: string;
  plan: string;
  start: string;
  end: string;
  status: string;
  payment: string;
  amount: number;
  method: string;
};

type MembershipsResponse = {
  data: Membership[];
  page: number;
  totalPages: number;
  total: number;
};

type Summary = {
  clients: number;
  active: number;
  expiring: number;
  expired: number;
};

const filtersSchema = z.object({
  search: z.string(),
  status: z.string(),
});

const filtersDefaultValues = {
  search: "",
  status: "",
};

const membershipSchema = z.object({
  client: z.string().min(1, "El cliente es requerido"),
  plan: z.string().min(1, "El plan es requerido"),
  start: z.string().min(1, "La fecha de inicio es requerida"),
  end: z.string().min(1, "La fecha de fin es requerida"),
  amount: z.number().min(0, "El monto no puede ser negativo"),
  method: z.string().min(1, "El método es requerido"),
});

const membershipDefaultValues = {
  client: "",
  plan: "",
  start: "",
  end: "",
  amount: 120,
  method: "cash",
};

const paymentSchema = z.object({
  amount: z.number().min(0, "El monto no puede ser negativo"),
  date: z.string().min(1, "La fecha es requerida"),
  method: z.string().min(1, "El método es requerido"),
});

const paymentDefaultValues = {
  amount: 120,
  date: "",
  method: "cash",
};

const cancelSchema = z.object({
  reason: z.string().trim().min(1, "El motivo es requerido"),
});

const cancelDefaultValues = {
  reason: "",
};

type FiltersValues = z.infer<typeof filtersSchema>;
type MembershipValues = z.infer<typeof membershipSchema>;
type PaymentValues = z.infer<typeof paymentSchema>;
type CancelValues = z.infer<typeof cancelSchema>;

export function Memberships() {
  const memberships = useRequest<MembershipsResponse>({
    data: [],
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const summary = useRequest<Summary>({
    clients: 0,
    active: 0,
    expiring: 0,
    expired: 0,
  });

  const [page, setPage] = useState(1);
  const { registerComponent, openComponent } = useComponent();

  const filters = useForm<FiltersValues>({
    resolver: zodResolver(filtersSchema),
    defaultValues: filtersDefaultValues,
  });

  useEffect(() => {
    registerComponent("membership-create", MembershipModal);
    registerComponent("membership-payment", PaymentModal);
    registerComponent("membership-renew", RenewModal);
    registerComponent("membership-cancel", CancelModal);
  }, [registerComponent]);

  useEffect(() => {
    memberships.request(
      fetch.get("/memberships", {
        query: {
          ...filters.getValues(),
          page: 1,
          perPage: 4,
        },
      }),
    );

    summary.request(fetch.get("/memberships/summary"));
  }, []);

  return (
    <main className="min-h-screen bg-[#EEF1EF] p-5 text-[#11151C] md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Control de vigencias
          </p>

          <h1 className="font-fraunces -mt-0.5 text-2xl font-extrabold tracking-tight md:text-3xl">
            Membresías
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Gestiona planes, pagos, renovaciones y vencimientos por cliente.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            openComponent("membership-create", {
              onComplete: () => {
                memberships.request(
                  fetch.get("/memberships", {
                    query: {
                      ...filters.getValues(),
                      page,
                      perPage: 4,
                    },
                  }),
                );

                summary.request(fetch.get("/memberships/summary"));
              },
            })
          }
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A3C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E8431F] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nueva membresía
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Clientes
          </p>
          <p className="font-fraunces mt-2 text-3xl font-black text-[#11151C]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.clients}
            </RequestState>
          </p>
          <p className="mt-1 text-xs text-slate-400">Total registrados</p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Activos
          </p>
          <p className="font-fraunces mt-2 text-3xl font-black text-[#11151C]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.active}
            </RequestState>
          </p>
          <p className="mt-1 text-xs text-slate-400">Membresía vigente</p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Por vencer
          </p>
          <p className="font-fraunces mt-2 text-3xl font-black text-[#11151C]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.expiring}
            </RequestState>
          </p>
          <p className="mt-1 text-xs text-slate-400">Requieren seguimiento</p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Vencidos
          </p>
          <p className="font-fraunces mt-2 text-3xl font-black text-[#11151C]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.expired}
            </RequestState>
          </p>
          <p className="mt-1 text-xs text-slate-400">Listos para renovar</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <form
          onSubmit={filters.handleSubmit((values) => {
            setPage(1);

            memberships.request(
              fetch.get("/memberships", {
                query: {
                  ...values,
                  page: 1,
                  perPage: 4,
                },
              }),
            );
          })}
          className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              placeholder="Buscar cliente, teléfono o plan..."
              {...filters.register("search")}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#FF5A3C] focus:ring-2 focus:ring-[#FF5A3C]/30"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: "", label: "Todas" },
              { id: "active", label: "Activas" },
              { id: "expiring", label: "Por vencer" },
              { id: "expired", label: "Vencidas" },
              { id: "pending", label: "Pendientes" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  filters.setValue("status", item.id);
                  setPage(1);

                  memberships.request(
                    fetch.get("/memberships", {
                      query: {
                        search: filters.getValues("search"),
                        status: item.id,
                        page: 1,
                        perPage: 4,
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
          </div>
        </form>

        <RequestState
          status={memberships.status}
          skeleton={null}
          error={
            <div className="p-5 text-sm font-semibold text-[#E8431F]">_</div>
          }
        >
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-bold">Cliente</th>
                    <th className="px-5 py-3 font-bold">Plan</th>
                    <th className="px-5 py-3 font-bold">Inicio</th>
                    <th className="px-5 py-3 font-bold">Vence</th>
                    <th className="px-5 py-3 font-bold">Estado</th>
                    <th className="px-5 py-3 font-bold">Pago</th>
                    <th className="px-5 py-3 font-bold">Monto</th>
                    <th className="px-5 py-3 text-right font-bold">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {memberships.data.data.map((membership) => (
                    <tr
                      key={membership.id}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#11151C] text-xs font-bold text-white">
                            {membership.client
                              .split(" ")
                              .slice(0, 2)
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#11151C]">
                              {membership.client}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              {membership.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold">
                        {membership.plan}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {membership.start}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {membership.end}
                      </td>

                      <td className="px-5 py-4">
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
                              cancelled: {
                                label: "Cancelada",
                                background: "#F1F5F9",
                                color: "#64748B",
                              },
                            },
                            membership.status,
                          )}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          badge={getBadge(
                            {
                              paid: {
                                label: "Pagado",
                                background: "transparent",
                                color: "#168F57",
                              },
                              pending: {
                                label: "Pendiente",
                                background: "transparent",
                                color: "#B9740F",
                              },
                            },
                            membership.payment,
                          )}
                          className="text-sm font-black"
                        />

                        <p className="text-xs text-slate-400">
                          {membership.method}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm font-black">
                        S/ {membership.amount}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openComponent("membership-payment", {
                                data: {
                                  id: membership.id,
                                },
                                onComplete: () => {
                                  memberships.request(
                                    fetch.get("/memberships", {
                                      query: {
                                        ...filters.getValues(),
                                        page,
                                        perPage: 4,
                                      },
                                    }),
                                  );

                                  summary.request(
                                    fetch.get("/memberships/summary"),
                                  );
                                },
                              })
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openComponent("membership-renew", {
                                data: {
                                  id: membership.id,
                                },
                                onComplete: () => {
                                  memberships.request(
                                    fetch.get("/memberships", {
                                      query: {
                                        ...filters.getValues(),
                                        page,
                                        perPage: 4,
                                      },
                                    }),
                                  );

                                  summary.request(
                                    fetch.get("/memberships/summary"),
                                  );
                                },
                              })
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-orange-50 hover:text-[#FF5A3C]"
                          >
                            <RefreshCcw className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openComponent("membership-cancel", {
                                data: {
                                  id: membership.id,
                                },
                                onComplete: () => {
                                  memberships.request(
                                    fetch.get("/memberships", {
                                      query: {
                                        ...filters.getValues(),
                                        page,
                                        perPage: 4,
                                      },
                                    }),
                                  );

                                  summary.request(
                                    fetch.get("/memberships/summary"),
                                  );
                                },
                              })
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 lg:hidden">
              {memberships.data.data.map((membership) => (
                <div key={membership.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">
                        {membership.client}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {membership.plan} · vence {membership.end}
                      </p>
                    </div>

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
                          cancelled: {
                            label: "Cancelada",
                            background: "#F1F5F9",
                            color: "#64748B",
                          },
                        },
                        membership.status,
                      )}
                      className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Badge
                      badge={getBadge(
                        {
                          paid: {
                            label: "Pagado",
                            background: "transparent",
                            color: "#168F57",
                          },
                          pending: {
                            label: "Pendiente",
                            background: "transparent",
                            color: "#B9740F",
                          },
                        },
                        membership.payment,
                      )}
                      className="text-sm font-black"
                    />

                    <p className="text-sm font-black">S/ {membership.amount}</p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openComponent("membership-payment", {
                          data: {
                            id: membership.id,
                          },
                          onComplete: () => {
                            memberships.request(
                              fetch.get("/memberships", {
                                query: {
                                  ...filters.getValues(),
                                  page,
                                  perPage: 4,
                                },
                              }),
                            );

                            summary.request(fetch.get("/memberships/summary"));
                          },
                        })
                      }
                      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500"
                    >
                      <CreditCard className="h-4 w-4" />
                      Pago
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openComponent("membership-renew", {
                          data: {
                            id: membership.id,
                          },
                          onComplete: () => {
                            memberships.request(
                              fetch.get("/memberships", {
                                query: {
                                  ...filters.getValues(),
                                  page,
                                  perPage: 4,
                                },
                              }),
                            );

                            summary.request(fetch.get("/memberships/summary"));
                          },
                        })
                      }
                      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A3C] px-3 py-2 text-xs font-bold text-white"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Renovar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openComponent("membership-cancel", {
                          data: {
                            id: membership.id,
                          },
                          onComplete: () => {
                            memberships.request(
                              fetch.get("/memberships", {
                                query: {
                                  ...filters.getValues(),
                                  page,
                                  perPage: 4,
                                },
                              }),
                            );

                            summary.request(fetch.get("/memberships/summary"));
                          },
                        })
                      }
                      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-500"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {memberships.data.data.length === 0 && (
              <div className="p-6 text-center text-sm font-medium text-slate-400">
                No se encontraron membresías.
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <p className="text-xs font-medium text-slate-400">
                Página {memberships.data.page} de {memberships.data.totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => {
                    setPage(page - 1);

                    memberships.request(
                      fetch.get("/memberships", {
                        query: {
                          ...filters.getValues(),
                          page: page - 1,
                          perPage: 4,
                        },
                      }),
                    );
                  }}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>

                <button
                  type="button"
                  disabled={page === memberships.data.totalPages}
                  onClick={() => {
                    setPage(page + 1);

                    memberships.request(
                      fetch.get("/memberships", {
                        query: {
                          ...filters.getValues(),
                          page: page + 1,
                          perPage: 4,
                        },
                      }),
                    );
                  }}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        </RequestState>
      </section>
    </main>
  );
}

function MembershipModal({ close, complete }: RegisteredComponentProps) {
  const save = useRequest<unknown>(null);

  const form = useForm<MembershipValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: membershipDefaultValues,
  });

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post("/memberships", values)
      .then(() => {
        save.success(null);
        complete();
      })
      .catch(save.fail);
  });

  return (
    <Modal
      close={close}
      size="lg"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Nueva
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Crear membresía
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Completa los datos principales de la membresía.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="h-11 cursor-pointer rounded-xl bg-[#FF5A3C] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            Crear membresía
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Cliente
          </span>
          <select
            {...form.register("client")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          >
            <option value="">Seleccionar cliente</option>
            <option value="Diego Ramírez Soto">Diego Ramírez Soto</option>
            <option value="Valentina Cruz Paredes">
              Valentina Cruz Paredes
            </option>
            <option value="Camila Torres Vega">Camila Torres Vega</option>
            <option value="Mateo Fernández Ruiz">Mateo Fernández Ruiz</option>
          </select>
        </label>

        <label className="md:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Plan
          </span>
          <select
            {...form.register("plan")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          >
            <option value="">Seleccionar plan</option>
            <option value="Plan Mensual">Plan Mensual · S/ 120</option>
            <option value="Plan Trimestral">Plan Trimestral · S/ 320</option>
            <option value="Plan Semestral">Plan Semestral · S/ 560</option>
            <option value="Plan Anual">Plan Anual · S/ 980</option>
          </select>
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
            Método
          </span>
          <select
            {...form.register("method")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Yape">Yape</option>
            <option value="Plin">Plin</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
        </label>
      </form>
    </Modal>
  );
}

function PaymentModal({
  close,
  complete,
  data,
}: RegisteredComponentProps<{ id?: string }>) {
  const save = useRequest<unknown>(null);
  const id = data?.id;

  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: paymentDefaultValues,
  });

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post(`/memberships/${id}/payments`, values)
      .then(() => {
        save.success(null);
        complete();
      })
      .catch(save.fail);
  });

  return (
    <Modal
      close={close}
      size="lg"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Caja
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
            className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="h-11 cursor-pointer rounded-xl bg-[#11151C] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-black active:scale-[0.98]"
          >
            Guardar pago
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
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
            Fecha
          </span>
          <input
            type="date"
            {...form.register("date")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />
        </label>
        <label className="md:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Método
          </span>
          <select
            {...form.register("method")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Yape">Yape</option>
            <option value="Plin">Plin</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
        </label>
      </form>
    </Modal>
  );
}

function RenewModal({
  close,
  complete,
  data,
}: RegisteredComponentProps<{ id?: string }>) {
  const save = useRequest<unknown>(null);
  const id = data?.id;

  const form = useForm<MembershipValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: membershipDefaultValues,
  });

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post(`/memberships/${id}/renew`, values)
      .then(() => {
        save.success(null);
        complete();
      })
      .catch(save.fail);
  });

  return (
    <Modal
      close={close}
      size="lg"
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
            className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="h-11 cursor-pointer rounded-xl bg-[#FF5A3C] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            Renovar membresía
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Nuevo plan
          </span>
          <select
            {...form.register("plan")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          >
            <option value="">Seleccionar plan</option>
            <option value="Plan Mensual">Plan Mensual · S/ 120</option>
            <option value="Plan Trimestral">Plan Trimestral · S/ 320</option>
            <option value="Plan Semestral">Plan Semestral · S/ 560</option>
            <option value="Plan Anual">Plan Anual · S/ 980</option>
          </select>
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
            <option value="Efectivo">Efectivo</option>
            <option value="Yape">Yape</option>
            <option value="Plin">Plin</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
        </label>
      </form>
    </Modal>
  );
}

function CancelModal({
  close,
  complete,
  data,
}: RegisteredComponentProps<{ id?: string }>) {
  const save = useRequest<unknown>(null);
  const id = data?.id;

  const form = useForm<CancelValues>({
    resolver: zodResolver(cancelSchema),
    defaultValues: cancelDefaultValues,
  });

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post(`/memberships/${id}/cancel`, values)
      .then(() => {
        save.success(null);
        complete();
      })
      .catch(save.fail);
  });

  return (
    <Modal
      close={close}
      size="md"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-rose-500">
            Cancelación
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Cancelar membresía
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Esta acción marcará la membresía como cancelada.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="h-11 cursor-pointer rounded-xl bg-rose-500 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-600 active:scale-[0.98]"
          >
            Confirmar cancelación
          </button>
        </>
      }
    >
      <form onSubmit={submit}>
        <p className="text-sm leading-6 text-slate-500">
          ¿Seguro que deseas cancelar esta membresía? Revisa bien antes de
          continuar.
        </p>
        <label className="mt-5 block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Motivo
          </span>
          <textarea
            rows={4}
            placeholder="Ej. Cliente solicitó cancelar la membresía."
            {...form.register("reason")}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />
        </label>
      </form>
    </Modal>
  );
}
