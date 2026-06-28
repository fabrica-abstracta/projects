import { useEffect, useState } from "react";
import {
  Banknote,
  CalendarDays,
  CreditCard,
  Plus,
  Search,
  UserCheck,
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

type Client = {
  id: string;
  name: string;
  document: string;
  phone: string;
  plan: {
    name: string;
    status: string;
    end: string;
  } | null;
};

type Attendance = {
  id: string;
  type: string;
  date: string;
  time: string;
  person: string;
  document: string;
  concept: string;
  amount: number | null;
  method: string | null;
  status: string;
};

type AttendancesResponse = {
  data: Attendance[];
  page: number;
  totalPages: number;
  total: number;
};

type Summary = {
  attendances: number;
  visits: number;
  cash: number;
};

const filtersSchema = z.object({
  search: z.string(),
  period: z.string(),
});

const filtersDefaultValues = {
  search: "",
  period: "today",
};

const clientFiltersSchema = z.object({
  search: z.string(),
});

const clientFiltersDefaultValues = {
  search: "",
};

const attendanceSchema = z.object({
  client: z.string().min(1, "El cliente es requerido"),
  date: z.string().min(1, "La fecha es requerida"),
});

const attendanceDefaultValues = {
  client: "",
  date: "2026-06-28",
};

const visitSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  document: z.string().trim().min(1, "El documento es requerido"),
  amount: z.number().min(0, "El monto no puede ser negativo"),
  method: z.string().min(1, "El método es requerido"),
});

const visitDefaultValues = {
  name: "",
  document: "",
  amount: 15,
  method: "Efectivo",
};

type FiltersValues = z.infer<typeof filtersSchema>;
type ClientFiltersValues = z.infer<typeof clientFiltersSchema>;
type AttendanceValues = z.infer<typeof attendanceSchema>;
type VisitValues = z.infer<typeof visitSchema>;

export function Attendances() {
  const clients = useRequest<Client[]>([]);
  const attendances = useRequest<AttendancesResponse>({
    data: [],
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const summary = useRequest<Summary>({
    attendances: 0,
    visits: 0,
    cash: 0,
  });

  const [page, setPage] = useState(1);
  const { registerComponent, openComponent } = useComponent();

  const filters = useForm<FiltersValues>({
    resolver: zodResolver(filtersSchema),
    defaultValues: filtersDefaultValues,
  });

  const clientFilters = useForm<ClientFiltersValues>({
    resolver: zodResolver(clientFiltersSchema),
    defaultValues: clientFiltersDefaultValues,
  });

  useEffect(() => {
    registerComponent("attendance-attendance", AttendanceModal);
    registerComponent("attendance-visit", VisitModal);
  }, [registerComponent]);

  useEffect(() => {
    clients.request(fetch.get("/attendances/clients"));

    attendances.request(
      fetch.get("/attendances", {
        query: {
          ...filters.getValues(),
          page: 1,
          perPage: 5,
        },
      }),
    );

    summary.request(
      fetch.get("/attendances/summary", {
        query: {
          period: filters.getValues("period"),
        },
      }),
    );
  }, []);

  return (
    <main className="min-h-screen bg-[#EEF1EF] p-5 text-[#11151C] md:p-8">
      <div className="mb-6">
        <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
          Control de entrada
        </p>

        <h1 className="font-fraunces -mt-0.5 text-2xl font-extrabold tracking-tight md:text-3xl">
          Asistencias
        </h1>

        <p className="mt-1 text-sm font-medium text-slate-500">
          Hoy tienes{" "}
          <span className="font-bold text-[#11151C]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.attendances + summary.data.visits}
            </RequestState>
          </span>{" "}
          registros de entrada.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Asistencias
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.attendances}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Clientes registrados
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Visitas
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.visits}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Entradas directas
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Caja visitas
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              S/ {summary.data.cash}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Ingresos por visita
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
        <section className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#11151C] text-white">
                <UserCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Registro rápido
                </p>

                <h2 className="font-fraunces text-xl font-bold text-[#11151C]">
                  Marcar asistencia
                </h2>
              </div>
            </div>
          </div>

          <div className="p-5">
            <form
              onSubmit={clientFilters.handleSubmit((values) =>
                clients.request(
                  fetch.get("/attendances/clients", { query: values }),
                ),
              )}
              className="relative"
            >
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                placeholder="Buscar cliente..."
                {...clientFilters.register("search")}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#FF5A3C] focus:ring-2 focus:ring-[#FF5A3C]/30"
              />
            </form>

            <RequestState
              status={clients.status}
              skeleton={null}
              error={
                <div className="mt-4 text-sm font-semibold text-[#E8431F]">
                  _
                </div>
              }
            >
              <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
                {clients.data.map((client, index) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() =>
                      openComponent("attendance-attendance", {
                        data: {
                          id: client.id,
                          clients: clients.data,
                        },
                        onComplete: () => {
                          attendances.request(
                            fetch.get("/attendances", {
                              query: {
                                ...filters.getValues(),
                                page,
                                perPage: 5,
                              },
                            }),
                          );

                          summary.request(
                            fetch.get("/attendances/summary", {
                              query: {
                                period: filters.getValues("period"),
                              },
                            }),
                          );
                        },
                      })
                    }
                    className="flex w-full cursor-pointer items-center justify-between gap-3 bg-white px-4 py-3 text-left transition hover:bg-slate-50"
                  >
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
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      >
                        {client.name
                          .split(" ")
                          .slice(0, 2)
                          .map((word) => word[0])
                          .join("")
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#11151C]">
                          {client.name}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {client.document} · {client.phone}
                        </p>
                      </div>
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
                          none: {
                            label: "Sin membresía",
                            background: "#F1F5F9",
                            color: "#64748B",
                          },
                        },
                        client.plan?.status ?? "none",
                      )}
                      className="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
                    />
                  </button>
                ))}
              </div>
            </RequestState>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  Registros filtrados
                </p>

                <h2 className="font-fraunces text-xl font-bold text-[#11151C]">
                  Movimiento de asistencias
                </h2>
              </div>

              <form
                onSubmit={filters.handleSubmit((values) => {
                  setPage(1);

                  attendances.request(
                    fetch.get("/attendances", {
                      query: {
                        ...values,
                        page: 1,
                        perPage: 5,
                      },
                    }),
                  );

                  summary.request(
                    fetch.get("/attendances/summary", {
                      query: {
                        period: values.period,
                      },
                    }),
                  );
                })}
                className="flex flex-col gap-3 lg:flex-row lg:items-center"
              >
                <div className="flex items-center gap-2 overflow-x-auto">
                  {[
                    { id: "today", label: "Hoy" },
                    { id: "yesterday", label: "Ayer" },
                    { id: "week", label: "Semana" },
                    { id: "month", label: "Mes" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        filters.setValue("period", item.id);
                        setPage(1);

                        attendances.request(
                          fetch.get("/attendances", {
                            query: {
                              search: filters.getValues("search"),
                              period: item.id,
                              page: 1,
                              perPage: 5,
                            },
                          }),
                        );

                        summary.request(
                          fetch.get("/attendances/summary", {
                            query: {
                              period: item.id,
                            },
                          }),
                        );
                      }}
                      className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                        filters.watch("period") === item.id
                          ? "bg-[#11151C] text-white"
                          : "border border-slate-200 bg-white text-slate-500 hover:border-[#FF5A3C]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-0 lg:w-64">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    placeholder="Buscar registros..."
                    {...filters.register("search")}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#FF5A3C] focus:ring-2 focus:ring-[#FF5A3C]/30"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    openComponent("attendance-visit", {
                      onComplete: () => {
                        attendances.request(
                          fetch.get("/attendances", {
                            query: {
                              ...filters.getValues(),
                              page,
                              perPage: 5,
                            },
                          }),
                        );

                        summary.request(
                          fetch.get("/attendances/summary", {
                            query: {
                              period: filters.getValues("period"),
                            },
                          }),
                        );
                      },
                    })
                  }
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A3C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Registrar visita
                </button>
              </form>
            </div>
          </div>

          <RequestState
            status={attendances.status}
            skeleton={null}
            error={
              <div className="p-5 text-sm font-semibold text-[#E8431F]">_</div>
            }
          >
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-3 font-bold">Hora</th>
                      <th className="px-5 py-3 font-bold">Tipo</th>
                      <th className="px-5 py-3 font-bold">Persona</th>
                      <th className="px-5 py-3 font-bold">Documento</th>
                      <th className="px-5 py-3 font-bold">Concepto</th>
                      <th className="px-5 py-3 font-bold">Pago</th>
                      <th className="px-5 py-3 font-bold">Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {attendances.data.data.map((attendance) => (
                      <tr
                        key={attendance.id}
                        className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 text-sm font-bold text-[#11151C]">
                          {attendance.time}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {attendance.type === "client"
                            ? "Asistencia"
                            : "Visita"}
                        </td>

                        <td className="px-5 py-4 text-sm font-bold text-[#11151C]">
                          {attendance.person}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {attendance.document}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500">
                          {attendance.concept}
                        </td>

                        <td className="px-5 py-4">
                          {attendance.amount ? (
                            <div>
                              <p className="text-sm font-black text-[#168F57]">
                                S/ {attendance.amount}
                              </p>

                              <p className="text-xs text-slate-400">
                                {attendance.method}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <Badge
                            badge={getBadge(
                              {
                                registered: {
                                  label: "Correcto",
                                  background: "#EAFBF2",
                                  color: "#168F57",
                                },
                                paid: {
                                  label: "Pagado",
                                  background: "#EAFBF2",
                                  color: "#168F57",
                                },
                                observed: {
                                  label: "Observado",
                                  background: "#FFF7E8",
                                  color: "#B9740F",
                                },
                                cancelled: {
                                  label: "Anulado",
                                  background: "#FFF1F2",
                                  color: "#F43F5E",
                                },
                              },
                              attendance.status,
                            )}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {attendances.data.data.map((attendance) => (
                  <div key={attendance.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#11151C]">
                          {attendance.person}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {attendance.time} · {attendance.concept}
                        </p>
                      </div>

                      <Badge
                        badge={getBadge(
                          {
                            registered: {
                              label: "Correcto",
                              background: "#EAFBF2",
                              color: "#168F57",
                            },
                            paid: {
                              label: "Pagado",
                              background: "#EAFBF2",
                              color: "#168F57",
                            },
                            observed: {
                              label: "Observado",
                              background: "#FFF7E8",
                              color: "#B9740F",
                            },
                            cancelled: {
                              label: "Anulado",
                              background: "#FFF1F2",
                              color: "#F43F5E",
                            },
                          },
                          attendance.status,
                        )}
                        className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                      />
                    </div>

                    {attendance.amount && (
                      <p className="mt-3 text-sm font-black text-[#168F57]">
                        S/ {attendance.amount} · {attendance.method}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {attendances.data.data.length === 0 && (
                <div className="p-6 text-center text-sm font-medium text-slate-400">
                  No se encontraron registros.
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                <p className="text-xs font-medium text-slate-400">
                  Página {attendances.data.page} de{" "}
                  {attendances.data.totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => {
                      setPage(page - 1);

                      attendances.request(
                        fetch.get("/attendances", {
                          query: {
                            ...filters.getValues(),
                            page: page - 1,
                            perPage: 5,
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
                    disabled={page === attendances.data.totalPages}
                    onClick={() => {
                      setPage(page + 1);

                      attendances.request(
                        fetch.get("/attendances", {
                          query: {
                            ...filters.getValues(),
                            page: page + 1,
                            perPage: 5,
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
      </div>
    </main>
  );
}

function AttendanceModal({
  close,
  complete,
  data,
}: RegisteredComponentProps<{ id?: string; clients?: Client[] }>) {
  const save = useRequest<unknown>(null);
  const id = data?.id ?? "";
  const clients = data?.clients ?? [];

  const form = useForm<AttendanceValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: attendanceDefaultValues,
  });

  useEffect(() => {
    form.setValue("client", id);
  }, [id]);

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post("/attendances", values)
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
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Asistencia
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Marcar asistencia
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Selecciona el cliente y la fecha del ingreso.
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
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#11151C] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-black active:scale-[0.98]"
          >
            <CreditCard className="h-4 w-4" />
            Guardar asistencia
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4">
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Cliente
          </span>
          <select
            {...form.register("client")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          >
            <option value="">Seleccionar cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Fecha
          </span>
          <div className="relative">
            <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              {...form.register("date")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </div>
        </label>
      </form>
    </Modal>
  );
}

function VisitModal({ close, complete }: RegisteredComponentProps) {
  const save = useRequest<unknown>(null);

  const form = useForm<VisitValues>({
    resolver: zodResolver(visitSchema),
    defaultValues: visitDefaultValues,
  });

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post("/attendances/visits", values)
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
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Visita
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Registrar visita
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Registra una visita directa con pago rápido.
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
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A3C] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            <CreditCard className="h-4 w-4" />
            Registrar visita
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4">
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Nombre
          </span>
          <input
            placeholder="Ej. Carlos Medina"
            {...form.register("name")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />
        </label>

        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Documento
          </span>
          <input
            placeholder="Ej. 70125478"
            {...form.register("document")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
      </form>
    </Modal>
  );
}
