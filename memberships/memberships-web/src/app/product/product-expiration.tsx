import { useEffect } from "react";
import { CheckCircle2, Pencil, Search, Trash2 } from "lucide-react";
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

type ProductLot = {
  id: string;
  code: string;
  product: string;
  category: string;
  brand: string;
  quantity: number;
  available: number;
  expiration: string;
  entryDate: string;
  cost: number;
  status: string;
};

type Summary = {
  entries: number;
  available: number;
  warning: number;
  expired: number;
};

const filtersSchema = z.object({
  search: z.string(),
  status: z.string(),
  category: z.string(),
});

const filtersDefaultValues = {
  search: "",
  status: "",
  category: "",
};

const lotSchema = z.object({
  product: z.string().trim().min(1, "El producto es requerido"),
  available: z.number().min(0, "El disponible no puede ser negativo"),
  cost: z.number().min(0, "El costo no puede ser negativo"),
  expiration: z.string(),
});

const lotDefaultValues = {
  product: "",
  available: 0,
  cost: 0,
  expiration: "",
};

const consumeSchema = z.object({
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
  reason: z.string().min(1, "El motivo es requerido"),
  note: z.string(),
});

const consumeDefaultValues = {
  quantity: 1,
  reason: "Merma",
  note: "",
};

type FiltersValues = z.infer<typeof filtersSchema>;
type LotValues = z.infer<typeof lotSchema>;
type ConsumeValues = z.infer<typeof consumeSchema>;

export function ProductExpirations() {
  const { registerComponent, openComponent } = useComponent();
  const lots = useRequest<ProductLot[]>([]);
  const summary = useRequest<Summary>({
    entries: 0,
    available: 0,
    warning: 0,
    expired: 0,
  });

  const filters = useForm<FiltersValues>({
    resolver: zodResolver(filtersSchema),
    defaultValues: filtersDefaultValues,
  });

  const reload = () => {
    lots.request(
      fetch.get("/product-lots", {
        query: {
          ...filters.getValues(),
          perPage: 5,
        },
      }),
    );

    summary.request(fetch.get("/product-lots/summary"));
  };

  useEffect(() => {
    registerComponent("lot-edit", EditLotModal);
    registerComponent("lot-consume", ConsumeLotModal);
    registerComponent("lot-delete", DeleteLotModal);

    lots.request(fetch.get("/product-lots", { query: filters.getValues() }));
    summary.request(fetch.get("/product-lots/summary"));
  }, [registerComponent]);

  return (
    <main className="min-h-screen bg-[#EEF1EF] p-5 text-[#11151C] md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Inventario y vencimientos
          </p>

          <h1 className="font-fraunces -mt-0.5 text-2xl font-extrabold tracking-tight md:text-3xl">
            Vencimientos
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Revisa entradas de stock, fechas de vencimiento y retiros.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Entradas
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.entries}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Registros de stock
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Disponibles
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.available}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Unidades vendibles
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Por vencer
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.warning}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Próximos 30 días
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Vencidos
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.expired}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Retirar de venta
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <form
          onSubmit={filters.handleSubmit((values) =>
            lots.request(fetch.get("/product-lots", { query: values })),
          )}
          className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Control por entrada
            </p>

            <h2 className="font-fraunces text-xl font-bold text-[#11151C]">
              Stock con vencimiento
            </h2>
          </div>

          <div className="relative min-w-0 lg:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              placeholder="Buscar producto, marca o código..."
              {...filters.register("search")}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#FF5A3C] focus:ring-2 focus:ring-[#FF5A3C]/30"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 px-5 py-3">
          {[
            { label: "Todos", status: "", category: "" },
            { label: "Por vencer", status: "warning", category: "" },
            { label: "Vencidos", status: "expired", category: "" },
            { label: "Bebidas", status: "", category: "Bebidas" },
            { label: "Suplementos", status: "", category: "Suplementos" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                filters.setValue("status", item.status);
                filters.setValue("category", item.category);

                lots.request(
                  fetch.get("/product-lots", {
                    query: {
                      search: filters.getValues("search"),
                      status: item.status,
                      category: item.category,
                    },
                  }),
                );
              }}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                filters.watch("status") === item.status &&
                filters.watch("category") === item.category
                  ? "bg-[#11151C] text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-[#FF5A3C]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <RequestState
          status={lots.status}
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
                    <th className="px-5 py-3 font-bold">Entrada</th>
                    <th className="px-5 py-3 font-bold">Producto</th>
                    <th className="px-5 py-3 font-bold">Categoría</th>
                    <th className="px-5 py-3 text-center font-bold">
                      Cantidad
                    </th>
                    <th className="px-5 py-3 text-center font-bold">
                      Disponible
                    </th>
                    <th className="px-5 py-3 font-bold">Vencimiento</th>
                    <th className="px-5 py-3 font-bold">Estado</th>
                    <th className="px-5 py-3 text-right font-bold">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {lots.data.map((lot) => (
                    <tr
                      key={lot.id}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-plex text-xs font-black text-[#11151C]">
                          {lot.code}
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {lot.entryDate}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-[#11151C]">
                          {lot.product}
                        </p>

                        <p className="text-xs text-slate-400">{lot.brand}</p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {lot.category}
                      </td>

                      <td className="px-5 py-4 text-center text-sm font-bold text-[#11151C]">
                        {lot.quantity}
                      </td>

                      <td className="px-5 py-4 text-center text-sm font-bold text-[#11151C]">
                        {lot.available}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-[#11151C]">
                        {lot.expiration}
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          badge={getBadge(
                            {
                              available: {
                                label: "Disponible",
                                background: "#EAFBF2",
                                color: "#168F57",
                              },
                              warning: {
                                label: "Por vencer",
                                background: "#FFF7E8",
                                color: "#B9740F",
                              },
                              expired: {
                                label: "Vencido",
                                background: "#FFF1F2",
                                color: "#F43F5E",
                              },
                              sold: {
                                label: "Agotado",
                                background: "#F1F5F9",
                                color: "#64748B",
                              },
                            },
                            lot.status,
                          )}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openComponent("lot-consume", {
                                data: { id: lot.id },
                                onComplete: reload,
                              })
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openComponent("lot-edit", {
                                data: { id: lot.id },
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
                              openComponent("lot-delete", {
                                data: { id: lot.id },
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

            <div className="divide-y divide-slate-100 lg:hidden">
              {lots.data.map((lot) => (
                <div key={lot.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-[#11151C]">
                        {lot.product}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {lot.code} · {lot.entryDate}
                      </p>
                    </div>

                    <Badge
                      badge={getBadge(
                        {
                          available: {
                            label: "Disponible",
                            background: "#EAFBF2",
                            color: "#168F57",
                          },
                          warning: {
                            label: "Por vencer",
                            background: "#FFF7E8",
                            color: "#B9740F",
                          },
                          expired: {
                            label: "Vencido",
                            background: "#FFF1F2",
                            color: "#F43F5E",
                          },
                          sold: {
                            label: "Agotado",
                            background: "#F1F5F9",
                            color: "#64748B",
                          },
                        },
                        lot.status,
                      )}
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <p className="font-bold text-slate-500">
                      Disponible:{" "}
                      <span className="text-[#11151C]">{lot.available}</span>
                    </p>

                    <p className="font-bold text-[#11151C]">{lot.expiration}</p>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openComponent("lot-consume", {
                          data: { id: lot.id },
                          onComplete: reload,
                        })
                      }
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openComponent("lot-edit", {
                          data: { id: lot.id },
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
                        openComponent("lot-delete", {
                          data: { id: lot.id },
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

            {lots.data.length === 0 && (
              <div className="p-6 text-center text-sm font-medium text-slate-400">
                No se encontraron entradas.
              </div>
            )}
          </>
        </RequestState>
      </section>
    </main>
  );
}

function EditLotModal({ data, close, complete }: RegisteredComponentProps) {
  const id = (data as { id?: string } | undefined)?.id;
  const save = useRequest<unknown>(null);

  const form = useForm<LotValues>({
    resolver: zodResolver(lotSchema),
    defaultValues: lotDefaultValues,
  });

  useEffect(() => {
    if (id) {
      fetch.get(`/product-lots/${id}`).then((lot: ProductLot) =>
        form.reset({
          product: lot.product,
          available: lot.available,
          cost: lot.cost,
          expiration: lot.expiration,
        }),
      );
    }
  }, [id]);

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post("/product-lots", {
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
      size="md"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Editar
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Editar lote
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Actualiza los datos principales de la entrada.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="cursor-pointer rounded-xl bg-[#FF5A3C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E8431F] active:scale-[0.98]"
          >
            Guardar cambios
          </button>
        </>
      }
    >
      <form onSubmit={submit}>
        <div className="grid gap-4">
          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Producto
            </span>
            <input
              {...form.register("product")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Disponible
            </span>
            <input
              type="number"
              {...form.register("available", { valueAsNumber: true })}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Costo
            </span>
            <input
              type="number"
              {...form.register("cost", { valueAsNumber: true })}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Vencimiento
            </span>
            <input
              type="date"
              {...form.register("expiration")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>
        </div>
      </form>
    </Modal>
  );
}

function ConsumeLotModal({ data, close, complete }: RegisteredComponentProps) {
  const id = (data as { id?: string } | undefined)?.id;
  const lot = useRequest<ProductLot | null>(null);
  const save = useRequest<unknown>(null);

  const form = useForm<ConsumeValues>({
    resolver: zodResolver(consumeSchema),
    defaultValues: consumeDefaultValues,
  });

  useEffect(() => {
    if (id) {
      lot.request(fetch.get(`/product-lots/${id}`));
    }
  }, [id]);

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post(`/product-lots/${id}/consume`, values)
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
            Consumo
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Consumir lote
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {lot.data?.product ?? "Registra una salida del lote."}
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="cursor-pointer rounded-xl bg-[#11151C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black active:scale-[0.98]"
          >
            Registrar consumo
          </button>
        </>
      }
    >
      <form onSubmit={submit}>
        <div className="grid gap-4">
          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Cantidad
            </span>
            <input
              type="number"
              {...form.register("quantity", { valueAsNumber: true })}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Motivo
            </span>
            <select
              {...form.register("reason")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            >
              <option value="Merma">Merma</option>
              <option value="Venta">Venta</option>
              <option value="Uso interno">Uso interno</option>
              <option value="Ajuste">Ajuste</option>
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Nota
            </span>
            <textarea
              rows={3}
              {...form.register("note")}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>
        </div>
      </form>
    </Modal>
  );
}

function DeleteLotModal({ data, close, complete }: RegisteredComponentProps) {
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
            Eliminar entrada
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Esta acción quitará la entrada del listado.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              remove.start();

              fetch
                .delete(`/product-lots/${id}`)
                .then(() => {
                  remove.success(null);
                  complete();
                })
                .catch(remove.fail);
            }}
            className="cursor-pointer rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 active:scale-[0.98]"
          >
            Sí, eliminar
          </button>
        </>
      }
    >
      <p className="text-sm leading-6 text-slate-500">
        ¿Seguro que deseas eliminar esta entrada? Revisa bien antes de
        continuar.
      </p>
    </Modal>
  );
}
