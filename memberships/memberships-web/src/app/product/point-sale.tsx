import { useEffect } from "react";
import { Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
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

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  stock: number;
  price: number;
  expiration: string;
  status: string;
};

type CartItem = Product & {
  quantity: number;
};

type Cart = {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
};

type Summary = {
  products: number;
  lowStock: number;
  cash: number;
};

type Receipt = {
  code: string;
  status: string;
  method: string;
  total: number;
  items: CartItem[];
};

const filtersSchema = z.object({
  search: z.string(),
  category: z.string(),
});

const filtersDefaultValues = {
  search: "",
  category: "",
};

const paymentSchema = z.object({
  customer: z.string(),
  method: z.string().min(1, "El método es requerido"),
});

const paymentDefaultValues = {
  customer: "",
  method: "Yape",
};

type FiltersValues = z.infer<typeof filtersSchema>;
type PaymentValues = z.infer<typeof paymentSchema>;

export function ProductPointOfSale() {
  const { registerComponent, openComponent } = useComponent();
  const products = useRequest<Product[]>([]);
  const cart = useRequest<Cart>({
    items: [],
    subtotal: 0,
    discount: 0,
    total: 0,
  });
  const summary = useRequest<Summary>({
    products: 0,
    lowStock: 0,
    cash: 0,
  });

  const filters = useForm<FiltersValues>({
    resolver: zodResolver(filtersSchema),
    defaultValues: filtersDefaultValues,
  });

  const reload = () => {
    products.request(
      fetch.get("/point-of-sale/products", { query: filters.getValues() }),
    );
    cart.request(fetch.get("/point-of-sale/cart"));
    summary.request(fetch.get("/point-of-sale/summary"));
  };

  useEffect(() => {
    registerComponent("pos-payment", PaymentModal);
    registerComponent("pos-receipt", ReceiptModal);
    registerComponent("pos-clear-cart", ClearCartModal);

    products.request(
      fetch.get("/point-of-sale/products", { query: filters.getValues() }),
    );
    cart.request(fetch.get("/point-of-sale/cart"));
    summary.request(fetch.get("/point-of-sale/summary"));
  }, [registerComponent]);

  return (
    <main className="min-h-screen bg-[#EEF1EF] p-5 text-[#11151C] md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Caja rápida
          </p>

          <h1 className="font-fraunces -mt-0.5 text-2xl font-extrabold tracking-tight md:text-3xl">
            Punto de venta
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Vende bebidas, suplementos, snacks y accesorios desde una vista
            simple.
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Productos
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.products}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Items seleccionados
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Stock bajo
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.lowStock}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Revisar reposición
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Caja hoy
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
            Ventas de productos
          </p>
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <form
            onSubmit={filters.handleSubmit((values) =>
              products.request(
                fetch.get("/point-of-sale/products", { query: values }),
              ),
            )}
            className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Productos disponibles
              </p>

              <h2 className="font-fraunces text-xl font-bold text-[#11151C]">
                Catálogo rápido
              </h2>
            </div>

            <div className="relative min-w-0 lg:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                placeholder="Buscar producto..."
                {...filters.register("search")}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#FF5A3C] focus:ring-2 focus:ring-[#FF5A3C]/30"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 px-5 py-3">
            {[
              { id: "", label: "Todos" },
              { id: "Bebidas", label: "Bebidas" },
              { id: "Suplementos", label: "Suplementos" },
              { id: "Accesorios", label: "Accesorios" },
              { id: "Snacks", label: "Snacks" },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  filters.setValue("category", item.id);

                  products.request(
                    fetch.get("/point-of-sale/products", {
                      query: {
                        search: filters.getValues("search"),
                        category: item.id,
                      },
                    }),
                  );
                }}
                className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                  filters.watch("category") === item.id
                    ? "bg-[#11151C] text-white"
                    : "border border-slate-200 bg-white text-slate-500 hover:border-[#FF5A3C]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <RequestState
            status={products.status}
            skeleton={null}
            error={
              <div className="p-5 text-sm font-semibold text-[#E8431F]">_</div>
            }
          >
            <>
              <div className="grid gap-4 p-5 md:grid-cols-2 2xl:grid-cols-3">
                {products.data.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#FF5A3C] hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#11151C]">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {product.category} · {product.brand}
                        </p>
                      </div>

                      <Badge
                        badge={getBadge(
                          {
                            ok: {
                              label: "Ok",
                              background: "#EAFBF2",
                              color: "#168F57",
                            },
                            warning: {
                              label: "Por vencer",
                              background: "#FFF7E8",
                              color: "#B9740F",
                            },
                          },
                          product.status,
                        )}
                        className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                      />
                    </div>

                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <p className="font-fraunces text-3xl font-black text-[#11151C]">
                          S/ {product.price}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Stock: {product.stock}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          cart.request(
                            fetch
                              .post("/point-of-sale/cart", {
                                product: product.id,
                              })
                              .then((value) => {
                                summary.request(
                                  fetch.get("/point-of-sale/summary"),
                                );

                                return value as Cart;
                              }),
                          );
                        }}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#11151C] text-white transition hover:bg-black"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {products.data.length === 0 && (
                <div className="p-6 text-center text-sm font-medium text-slate-400">
                  No se encontraron productos.
                </div>
              )}
            </>
          </RequestState>
        </div>

        <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Carrito
              </p>

              <h2 className="font-fraunces text-xl font-bold text-[#11151C]">
                Venta actual
              </h2>
            </div>

            <ShoppingCart className="h-5 w-5 text-[#FF5A3C]" />
          </div>

          <RequestState
            status={cart.status}
            skeleton={null}
            error={
              <div className="p-5 text-sm font-semibold text-[#E8431F]">_</div>
            }
          >
            <>
              <div className="divide-y divide-slate-100">
                {cart.data.items.map((item) => (
                  <div key={item.id} className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#11151C]">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          S/ {item.price} · {item.category}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          cart.request(
                            fetch
                              .delete(`/point-of-sale/cart/${item.id}`)
                              .then((value) => {
                                summary.request(
                                  fetch.get("/point-of-sale/summary"),
                                );

                                return value as Cart;
                              }),
                          );
                        }}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-xl border border-slate-200">
                        <button
                          type="button"
                          disabled={item.quantity <= 1}
                          onClick={() => {
                            cart.request(
                              fetch
                                .patch(`/point-of-sale/cart/${item.id}`, {
                                  quantity: item.quantity - 1,
                                })
                                .then((value) => {
                                  summary.request(
                                    fetch.get("/point-of-sale/summary"),
                                  );

                                  return value as Cart;
                                }),
                            );
                          }}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center text-slate-400 transition hover:text-[#11151C] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <span className="min-w-8 text-center text-sm font-black text-[#11151C]">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            cart.request(
                              fetch
                                .patch(`/point-of-sale/cart/${item.id}`, {
                                  quantity: item.quantity + 1,
                                })
                                .then((value) => {
                                  summary.request(
                                    fetch.get("/point-of-sale/summary"),
                                  );

                                  return value as Cart;
                                }),
                            );
                          }}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center text-slate-400 transition hover:text-[#11151C]"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-sm font-black text-[#11151C]">
                        S/ {(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {cart.data.items.length === 0 && (
                <div className="p-6 text-center text-sm font-medium text-slate-400">
                  El carrito está vacío.
                </div>
              )}

              <div className="border-t border-slate-100 p-5">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold text-[#11151C]">
                      S/ {cart.data.subtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Descuento</span>
                    <span className="font-bold text-[#11151C]">
                      S/ {cart.data.discount.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-slate-100 pt-3 text-lg">
                    <span className="font-black text-[#11151C]">Total</span>
                    <span className="font-black text-[#11151C]">
                      S/ {cart.data.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={cart.data.items.length === 0}
                    onClick={() =>
                      openComponent("pos-clear-cart", { onComplete: reload })
                    }
                    className="cursor-pointer rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Vaciar
                  </button>

                  <button
                    type="button"
                    disabled={cart.data.items.length === 0}
                    onClick={() =>
                      openComponent("pos-payment", {
                        data: { cart: cart.data },
                        onComplete: (value) => {
                          reload();
                          openComponent("pos-receipt", {
                            data: { receipt: value },
                          });
                        },
                      })
                    }
                    className="cursor-pointer rounded-xl bg-[#FF5A3C] py-3 text-sm font-bold text-white transition hover:bg-[#E8431F] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Cobrar
                  </button>
                </div>
              </div>
            </>
          </RequestState>
        </aside>
      </section>
    </main>
  );
}

function PaymentModal({ data, close, complete }: RegisteredComponentProps) {
  const cart = (data as { cart?: Cart } | undefined)?.cart ?? {
    items: [],
    subtotal: 0,
    discount: 0,
    total: 0,
  };

  const save = useRequest<unknown>(null);

  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: paymentDefaultValues,
  });

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post("/point-of-sale/checkout", values)
      .then((value) => {
        save.success(null);
        complete(value as Receipt);
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
            Pago
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Confirmar venta
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Registra el cliente y método de pago.
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
            Cobrar S/ {cart.total.toFixed(2)}
          </button>
        </>
      }
    >
      <form onSubmit={submit}>
        <div className="mb-5 rounded-2xl bg-[#11151C] p-5 text-white">
          <p className="text-xs font-semibold text-white/45">Total a cobrar</p>
          <p className="font-fraunces mt-1 text-4xl font-black">
            S/ {cart.total.toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-white/45">
            {cart.items.length} productos en el carrito
          </p>
        </div>

        <div className="grid gap-4">
          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Cliente
            </span>
            <input
              placeholder="Cliente opcional"
              {...form.register("customer")}
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
        </div>
      </form>
    </Modal>
  );
}

function ReceiptModal({ data, close }: RegisteredComponentProps) {
  const receipt = (data as { receipt?: Receipt } | undefined)?.receipt ?? null;

  return (
    <Modal
      close={close}
      size="md"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Venta registrada
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            {receipt?.code ?? "Comprobante"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Resumen de la venta realizada.
          </p>
        </div>
      }
      footer={
        <button
          type="button"
          onClick={close}
          className="cursor-pointer rounded-xl bg-[#11151C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black active:scale-[0.98]"
        >
          Nueva venta
        </button>
      }
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#11151C] p-5 text-white">
        <p className="text-xs font-semibold text-white/45">Total cobrado</p>
        <p className="font-fraunces mt-1 text-4xl font-black">
          S/ {receipt?.total.toFixed(2) ?? "0.00"}
        </p>
        <p className="mt-2 text-xs text-white/45">{receipt?.method}</p>
      </div>

      <div className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
        {receipt?.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div>
              <p className="text-sm font-bold text-[#11151C]">{item.name}</p>
              <p className="text-xs text-slate-400">
                {item.quantity} x S/ {item.price}
              </p>
            </div>
            <p className="text-sm font-black text-[#11151C]">
              S/ {(item.quantity * item.price).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </Modal>
  );
}

function ClearCartModal({ close, complete }: RegisteredComponentProps) {
  const remove = useRequest<unknown>(null);

  return (
    <Modal
      close={close}
      size="md"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-rose-500">
            Carrito
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Vaciar carrito
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Esta acción quitará todos los productos seleccionados.
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
                .delete("/point-of-sale/cart")
                .then(() => {
                  remove.success(null);
                  complete();
                })
                .catch(remove.fail);
            }}
            className="cursor-pointer rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 active:scale-[0.98]"
          >
            Sí, vaciar
          </button>
        </>
      }
    >
      <p className="text-sm leading-6 text-slate-500">
        ¿Seguro que deseas vaciar el carrito? Revisa bien antes de continuar.
      </p>
    </Modal>
  );
}
