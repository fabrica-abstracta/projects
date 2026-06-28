import { useEffect, useState } from "react";
import {
  Banknote,
  Eye,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  Trash2,
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

type Sale = {
  id: string;
  code: string;
  customer: string;
  detail: string;
  origin: string;
  method: string;
  amount: number;
  date: string;
  time: string;
  status: string;
};

type SalesResponse = {
  data: Sale[];
  page: number;
  totalPages: number;
  total: number;
};

type Summary = {
  today: number;
  todayCount: number;
  month: number;
  cancelled: number;
};

const filtersSchema = z.object({
  search: z.string(),
  method: z.string(),
  status: z.string(),
  origin: z.string(),
});

const filtersDefaultValues = {
  search: "",
  method: "",
  status: "",
  origin: "",
};

const saleSchema = z.object({
  customer: z.string().trim().min(1, "El cliente es requerido"),
  detail: z.string().trim().min(1, "El detalle es requerido"),
  origin: z.string().min(1, "El origen es requerido"),
  method: z.string().min(1, "El método es requerido"),
  amount: z.number().min(0, "El monto no puede ser negativo"),
  date: z.string().min(1, "La fecha es requerida"),
  time: z.string().min(1, "La hora es requerida"),
  status: z.string().min(1, "El estado es requerido"),
});

const saleDefaultValues = {
  customer: "",
  detail: "",
  origin: "membership",
  method: "cash",
  amount: 0,
  date: "2026-06-27",
  time: "10:30",
  status: "paid",
};

type FiltersValues = z.infer<typeof filtersSchema>;
type SaleValues = z.infer<typeof saleSchema>;

export function Sales() {
  const { registerComponent, openComponent } = useComponent();
  const sales = useRequest<SalesResponse>({
    data: [],
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const summary = useRequest<Summary>({
    today: 0,
    todayCount: 0,
    month: 0,
    cancelled: 0,
  });

  const [page, setPage] = useState(1);

  const filters = useForm<FiltersValues>({
    resolver: zodResolver(filtersSchema),
    defaultValues: filtersDefaultValues,
  });

  const reload = () => {
    sales.request(
      fetch.get("/sales", {
        query: {
          ...filters.getValues(),
          page,
          perPage: 6,
        },
      }),
    );

    summary.request(fetch.get("/sales/summary"));
  };

  useEffect(() => {
    registerComponent("sale-create", SaleCreateModal);
    registerComponent("sale-edit", SaleEditModal);
    registerComponent("sale-detail", SaleDetailModal);
    registerComponent("sale-delete", SaleDeleteModal);

    sales.request(
      fetch.get("/sales", {
        query: {
          ...filters.getValues(),
          page: 1,
          perPage: 6,
        },
      }),
    );

    summary.request(fetch.get("/sales/summary"));
  }, [registerComponent]);

  return (
    <main className="min-h-screen bg-[#EEF1EF] p-5 text-[#11151C] md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Caja y movimientos
          </p>

          <h1 className="font-fraunces -mt-0.5 text-2xl font-extrabold tracking-tight md:text-3xl">
            Ventas
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Consulta ingresos, métodos de pago y movimientos registrados.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openComponent("sale-create", { onComplete: reload })}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A3C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nueva venta
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Ingresos de hoy
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              S/ {summary.data.today.toFixed(2)}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.todayCount} ventas registradas
            </RequestState>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Ingresos del mes
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              S/ {summary.data.month.toFixed(2)}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Solo ventas pagadas
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Ventas anuladas
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.cancelled}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Requieren revisión
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <form
          onSubmit={filters.handleSubmit((values) => {
            setPage(1);

            sales.request(
              fetch.get("/sales", {
                query: {
                  ...values,
                  page: 1,
                  perPage: 6,
                },
              }),
            );
          })}
          className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Registros filtrados
            </p>

            <h2 className="font-fraunces text-xl font-bold text-[#11151C]">
              Detalle de ventas
            </h2>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 lg:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                placeholder="Buscar venta, cliente o código..."
                {...filters.register("search")}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#FF5A3C] focus:ring-2 focus:ring-[#FF5A3C]/30"
              />
            </div>

            <select
              {...filters.register("method")}
              onChange={(event) => {
                filters.setValue("method", event.target.value);
                setPage(1);

                sales.request(
                  fetch.get("/sales", {
                    query: {
                      ...filters.getValues(),
                      method: event.target.value,
                      page: 1,
                      perPage: 6,
                    },
                  }),
                );
              }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#FF5A3C] focus:ring-2 focus:ring-[#FF5A3C]/30"
            >
              <option value="">Todos los métodos</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="yape">Yape</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 px-5 py-3">
          {[
            { label: "Todas", status: "", origin: "" },
            { label: "Pagadas", status: "paid", origin: "" },
            { label: "Anuladas", status: "cancelled", origin: "" },
            { label: "Membresías", status: "", origin: "membership" },
            { label: "Productos", status: "", origin: "product" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                filters.setValue("status", item.status);
                filters.setValue("origin", item.origin);
                setPage(1);

                sales.request(
                  fetch.get("/sales", {
                    query: {
                      ...filters.getValues(),
                      status: item.status,
                      origin: item.origin,
                      page: 1,
                      perPage: 6,
                    },
                  }),
                );
              }}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                filters.watch("status") === item.status &&
                filters.watch("origin") === item.origin
                  ? "bg-[#11151C] text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-[#FF5A3C]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <RequestState
          status={sales.status}
          skeleton={null}
          error={
            <div className="p-5 text-sm font-semibold text-[#E8431F]">_</div>
          }
        >
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[960px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-bold">Detalle</th>
                    <th className="px-5 py-3 font-bold">Cliente</th>
                    <th className="px-5 py-3 font-bold">Método</th>
                    <th className="px-5 py-3 text-right font-bold">Monto</th>
                    <th className="px-5 py-3 font-bold">Fecha</th>
                    <th className="px-5 py-3 font-bold">Estado</th>
                    <th className="px-5 py-3 text-right font-bold">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {sales.data.data.map((sale, index) => (
                    <tr
                      key={sale.id}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="max-w-[230px] truncate text-sm font-bold text-[#11151C]">
                          {sale.detail}
                        </p>

                        <div className="flex items-center gap-2">
                          <p className="font-plex text-[11px] text-slate-400">
                            {sale.code}
                          </p>

                          <Badge
                            badge={getBadge(
                              {
                                membership: {
                                  label: "Membresía",
                                  background: "transparent",
                                  color: "#94A3B8",
                                },
                                product: {
                                  label: "Producto",
                                  background: "transparent",
                                  color: "#94A3B8",
                                },
                                service: {
                                  label: "Servicio",
                                  background: "transparent",
                                  color: "#94A3B8",
                                },
                                other: {
                                  label: "Otro",
                                  background: "transparent",
                                  color: "#94A3B8",
                                },
                              },
                              sale.origin,
                            )}
                            className="font-plex text-[11px]"
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            style={{
                              backgroundColor: [
                                "#1FAE6B",
                                "#E2932A",
                                "#FF5A3C",
                                "#11151C",
                                "#6D5DFB",
                                "#0F766E",
                              ][index % 6],
                            }}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          >
                            {sale.customer
                              .split(" ")
                              .slice(0, 2)
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()}
                          </div>

                          <p className="max-w-[190px] truncate text-sm font-medium text-[#11151C]">
                            {sale.customer}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          badge={getBadge(
                            {
                              cash: {
                                label: "Efectivo",
                                background: "#FFF1ED",
                                color: "#E8431F",
                              },
                              card: {
                                label: "Tarjeta",
                                background: "#EAFBF2",
                                color: "#168F57",
                              },
                              yape: {
                                label: "Yape",
                                background: "#FFF7E8",
                                color: "#B9740F",
                              },
                              transfer: {
                                label: "Transferencia",
                                background: "#F1F5F9",
                                color: "#11151C",
                              },
                            },
                            sale.method,
                          )}
                        />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <p
                          className={`font-plex text-sm font-bold tabular-nums ${
                            sale.status === "cancelled"
                              ? "text-slate-400 line-through"
                              : "text-[#11151C]"
                          }`}
                        >
                          S/ {sale.amount.toFixed(2)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#11151C]">
                          {sale.date}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          {sale.time}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          badge={getBadge(
                            {
                              paid: {
                                label: "Pagada",
                                background: "#EAFBF2",
                                color: "#168F57",
                              },
                              cancelled: {
                                label: "Anulada",
                                background: "#FFF1F2",
                                color: "#F43F5E",
                              },
                            },
                            sale.status,
                          )}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openComponent("sale-detail", {
                                data: { id: sale.id },
                                onComplete: reload,
                              })
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openComponent("sale-edit", {
                                data: { id: sale.id },
                                onComplete: reload,
                              })
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openComponent("sale-delete", {
                                data: { id: sale.id },
                                onComplete: reload,
                              })
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {sales.data.data.map((sale) => (
                <div key={sale.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#11151C]">
                        {sale.detail}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {sale.code} · {sale.customer}
                      </p>
                    </div>

                    <Badge
                      badge={getBadge(
                        {
                          paid: {
                            label: "Pagada",
                            background: "#EAFBF2",
                            color: "#168F57",
                          },
                          cancelled: {
                            label: "Anulada",
                            background: "#FFF1F2",
                            color: "#F43F5E",
                          },
                        },
                        sale.status,
                      )}
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm font-black text-[#11151C]">
                      S/ {sale.amount.toFixed(2)}
                    </p>

                    <p className="text-xs text-slate-400">
                      {sale.date} · {sale.time}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openComponent("sale-detail", {
                          data: { id: sale.id },
                          onComplete: reload,
                        })
                      }
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openComponent("sale-edit", {
                          data: { id: sale.id },
                          onComplete: reload,
                        })
                      }
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openComponent("sale-delete", {
                          data: { id: sale.id },
                          onComplete: reload,
                        })
                      }
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-rose-100 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {sales.data.data.length === 0 && (
              <div className="p-6 text-center text-sm font-medium text-slate-400">
                No se encontraron ventas.
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <p className="text-xs font-medium text-slate-400">
                Página {sales.data.page} de {sales.data.totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => {
                    setPage(page - 1);

                    sales.request(
                      fetch.get("/sales", {
                        query: {
                          ...filters.getValues(),
                          page: page - 1,
                          perPage: 6,
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
                  disabled={page === sales.data.totalPages}
                  onClick={() => {
                    setPage(page + 1);

                    sales.request(
                      fetch.get("/sales", {
                        query: {
                          ...filters.getValues(),
                          page: page + 1,
                          perPage: 6,
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

function SaleCreateModal({ close, complete }: RegisteredComponentProps) {
  const save = useRequest<unknown>(null);

  const form = useForm<SaleValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: saleDefaultValues,
  });

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post("/sales", values)
      .then(() => {
        save.success(null);
        complete();
      })
      .catch(save.fail);
  });

  return (
    <Modal
      close={close}
      size="xl"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Nueva
          </p>

          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Nueva venta
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Completa los datos principales del movimiento.
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
            onClick={submit}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF5A3C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            <ReceiptText className="h-4 w-4" />
            Registrar venta
          </button>
        </>
      }
    >
      <form onSubmit={submit}>
        <SaleFormFields form={form} />
      </form>
    </Modal>
  );
}

function SaleEditModal({ data, close, complete }: RegisteredComponentProps) {
  const id = (data as { id?: string } | undefined)?.id;
  const save = useRequest<unknown>(null);

  const form = useForm<SaleValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: saleDefaultValues,
  });

  useEffect(() => {
    if (id) {
      fetch.get(`/sales/${id}`).then((sale: Sale) =>
        form.reset({
          customer: sale.customer,
          detail: sale.detail,
          origin: sale.origin,
          method: sale.method,
          amount: sale.amount,
          date: sale.date,
          time: sale.time,
          status: sale.status,
        }),
      );
    }
  }, [id]);

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post("/sales", {
        id,
        ...values,
      })
      .then(() => {
        save.success(null);
        complete();
      })
      .catch(save.fail);
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
            Editar venta
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Completa los datos principales del movimiento.
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
            onClick={submit}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF5A3C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            <ReceiptText className="h-4 w-4" />
            Guardar cambios
          </button>
        </>
      }
    >
      <form onSubmit={submit}>
        <SaleFormFields form={form} />
      </form>
    </Modal>
  );
}

function SaleDetailModal({ data, close, complete }: RegisteredComponentProps) {
  const { openComponent } = useComponent();
  const id = (data as { id?: string } | undefined)?.id;
  const sale = useRequest<Sale | null>(null);

  useEffect(() => {
    if (id) {
      sale.request(fetch.get(`/sales/${id}`));
    }
  }, [id]);

  return (
    <Modal
      close={close}
      size="md"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Comprobante
          </p>

          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            {sale.data?.code ?? "Detalle de venta"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Resumen visual del movimiento seleccionado.
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
            Cerrar
          </button>

          <button
            type="button"
            onClick={() =>
              openComponent("sale-edit", {
                data: { id },
                onComplete: complete,
              })
            }
            className="cursor-pointer rounded-xl bg-[#11151C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-black active:scale-[0.98]"
          >
            Editar
          </button>
        </>
      }
    >
      <RequestState
        status={sale.status}
        skeleton={null}
        error={<span className="text-[#E8431F]">_</span>}
      >
        <>
          <div className="relative overflow-hidden rounded-2xl bg-[#11151C] p-5 text-white">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10" />

            <p className="relative text-xs font-semibold text-white/45">
              Monto cobrado
            </p>

            <p className="font-fraunces relative mt-1 text-4xl font-black">
              S/ {sale.data?.amount.toFixed(2)}
            </p>

            <div className="relative mt-5 flex items-center gap-2">
              <Badge
                badge={getBadge(
                  {
                    cash: {
                      label: "Efectivo",
                      background: "rgba(255,255,255,0.10)",
                      color: "#FFFFFF",
                    },
                    card: {
                      label: "Tarjeta",
                      background: "rgba(255,255,255,0.10)",
                      color: "#FFFFFF",
                    },
                    yape: {
                      label: "Yape",
                      background: "rgba(255,255,255,0.10)",
                      color: "#FFFFFF",
                    },
                    transfer: {
                      label: "Transferencia",
                      background: "rgba(255,255,255,0.10)",
                      color: "#FFFFFF",
                    },
                  },
                  sale.data!.method,
                )}
              />

              <Badge
                badge={getBadge(
                  {
                    paid: {
                      label: "Pagada",
                      background: "#1FAE6B",
                      color: "#FFFFFF",
                    },
                    cancelled: {
                      label: "Anulada",
                      background: "#F43F5E",
                      color: "#FFFFFF",
                    },
                  },
                  sale.data!.status,
                )}
              />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-xs font-semibold text-slate-500">
                Cliente
              </span>
              <span className="text-right text-sm font-semibold text-[#11151C]">
                {sale.data?.customer}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-xs font-semibold text-slate-500">
                Detalle
              </span>
              <span className="text-right text-sm font-semibold text-[#11151C]">
                {sale.data?.detail}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-xs font-semibold text-slate-500">
                Fecha
              </span>
              <span className="text-right text-sm font-semibold text-[#11151C]">
                {sale.data?.date} · {sale.data?.time}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-xs font-semibold text-slate-500">
                Atendido por
              </span>
              <span className="text-right text-sm font-semibold text-[#11151C]">
                Recepción
              </span>
            </div>
          </div>
        </>
      </RequestState>
    </Modal>
  );
}

function SaleDeleteModal({ data, close, complete }: RegisteredComponentProps) {
  const id = (data as { id?: string } | undefined)?.id;
  const remove = useRequest<unknown>(null);

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
            Eliminar venta
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Esta acción quitará el movimiento del listado.
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
            onClick={() => {
              remove.start();

              fetch
                .delete(`/sales/${id}`)
                .then(() => {
                  remove.success(null);
                  complete();
                })
                .catch(remove.fail);
            }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-600 active:scale-[0.98]"
          >
            <ReceiptText className="h-4 w-4" />
            Sí, eliminar
          </button>
        </>
      }
    >
      <p className="text-sm leading-6 text-slate-500">
        ¿Seguro que deseas eliminar esta venta? Revisa bien antes de continuar.
      </p>
    </Modal>
  );
}

function SaleFormFields({
  form,
}: {
  form: ReturnType<typeof useForm<SaleValues>>;
}) {
  return (
    <div className="grid gap-4">
      <label>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Cliente
        </span>

        <input
          placeholder="Ej. Diego Ramírez Soto"
          {...form.register("customer")}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
        />
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Detalle de venta
        </span>

        <input
          placeholder="Ej. Pago Plan Mensual"
          {...form.register("detail")}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Origen
          </span>

          <select
            {...form.register("origin")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          >
            <option value="membership">Membresía</option>
            <option value="product">Producto</option>
            <option value="service">Servicio</option>
            <option value="other">Otro</option>
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
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Método de pago
          </span>

          <select
            {...form.register("method")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          >
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="yape">Yape</option>
            <option value="transfer">Transferencia</option>
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Estado
          </span>

          <select
            {...form.register("status")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          >
            <option value="paid">Pagada</option>
            <option value="cancelled">Anulada</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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

        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Hora
          </span>

          <input
            type="time"
            {...form.register("time")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />
        </label>
      </div>
    </div>
  );
}
