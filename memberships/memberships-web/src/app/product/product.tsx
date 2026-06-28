import { useEffect, useState } from "react";
import {
  Archive,
  Building2,
  Layers3,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { RequestState } from "../../core/components";
import { fetch, useRequest } from "../../core/config/fetch";
import { Badge, getBadge, Modal, Sidebar } from "../../core/components/index";
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
  minStock: number;
  salePrice: number;
  cost: number;
  nearestExpiration: string;
  expirationStatus: string;
  status: string;
};

type ProductGroup = {
  id: string;
  name: string;
  products: number;
  status: string;
};

type ProductsResponse = {
  data: Product[];
  page: number;
  totalPages: number;
  total: number;
};

type Summary = {
  products: number;
  lowStock: number;
  expiring: number;
  expired: number;
};

const filtersSchema = z.object({
  search: z.string(),
  category: z.string(),
  stock: z.string(),
  expiration: z.string(),
});

const filtersDefaultValues = {
  search: "",
  category: "",
  stock: "",
  expiration: "",
};

const productSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  sku: z.string().trim().min(1, "El SKU es requerido"),
  status: z.string().min(1, "El estado es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
  brand: z.string().min(1, "La marca es requerida"),
  minStock: z.number().min(0, "El stock mínimo no puede ser negativo"),
  cost: z.number().min(0, "El costo no puede ser negativo"),
  salePrice: z.number().min(0, "El precio no puede ser negativo"),
});

const productDefaultValues = {
  name: "",
  sku: "",
  status: "active",
  category: "",
  brand: "",
  minStock: 10,
  cost: 0,
  salePrice: 0,
};

const stockSchema = z.object({
  quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
  expiration: z.string(),
  cost: z.number().min(0, "El costo no puede ser negativo"),
  salePrice: z.number().min(0, "El precio no puede ser negativo"),
  note: z.string(),
});

const stockDefaultValues = {
  quantity: 1,
  expiration: "",
  cost: 0,
  salePrice: 0,
  note: "",
};

const groupSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
});

const groupDefaultValues = {
  name: "",
};

type FiltersValues = z.infer<typeof filtersSchema>;
type ProductValues = z.infer<typeof productSchema>;
type StockValues = z.infer<typeof stockSchema>;
type GroupValues = z.infer<typeof groupSchema>;

export function Products() {
  const { registerComponent, openComponent } = useComponent();
  const products = useRequest<ProductsResponse>({
    data: [],
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const summary = useRequest<Summary>({
    products: 0,
    lowStock: 0,
    expiring: 0,
    expired: 0,
  });

  const categories = useRequest<ProductGroup[]>([]);
  const brands = useRequest<ProductGroup[]>([]);

  const [page, setPage] = useState(1);

  const filters = useForm<FiltersValues>({
    resolver: zodResolver(filtersSchema),
    defaultValues: filtersDefaultValues,
  });

  const reload = () => {
    products.request(
      fetch.get("/products", {
        query: {
          ...filters.getValues(),
          page,
          perPage: 4,
        },
      }),
    );

    summary.request(fetch.get("/products/summary"));
    categories.request(fetch.get("/products/categories"));
    brands.request(fetch.get("/products/brands"));
  };

  useEffect(() => {
    registerComponent("product-create", ProductCreateModal);
    registerComponent("product-edit", ProductEditModal);
    registerComponent("product-delete", DeleteProductModal);
    registerComponent("product-stock", StockModal);
    registerComponent("product-categories", ProductCategoriesSidebar);
    registerComponent("product-brands", ProductBrandsSidebar);

    products.request(
      fetch.get("/products", {
        query: {
          ...filters.getValues(),
          page: 1,
          perPage: 4,
        },
      }),
    );

    summary.request(fetch.get("/products/summary"));
    categories.request(fetch.get("/products/categories"));
    brands.request(fetch.get("/products/brands"));
  }, [registerComponent]);

  return (
    <main className="min-h-screen bg-[#EEF1EF] p-5 text-[#11151C] md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Inventario y ventas
          </p>

          <h1 className="font-fraunces -mt-0.5 text-2xl font-extrabold tracking-tight md:text-3xl">
            Productos
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Controla bebidas, suplementos, snacks y accesorios del gimnasio.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              openComponent("product-categories", { onComplete: reload })
            }
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#FF5A3C] hover:text-[#11151C]"
          >
            <Layers3 className="h-4 w-4" />
            Categorías
          </button>

          <button
            type="button"
            onClick={() =>
              openComponent("product-brands", { onComplete: reload })
            }
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#FF5A3C] hover:text-[#11151C]"
          >
            <Building2 className="h-4 w-4" />
            Marcas
          </button>

          <button
            type="button"
            onClick={() =>
              openComponent("product-create", { onComplete: reload })
            }
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A3C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E8431F] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Nuevo producto
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            Total registrados
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
            Requieren reposición
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
              {summary.data.expiring}
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
          onSubmit={filters.handleSubmit((values) => {
            setPage(1);

            products.request(
              fetch.get("/products", {
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
          <div>
            <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Registros filtrados
            </p>

            <h2 className="font-fraunces text-xl font-bold text-[#11151C]">
              Catálogo de productos
            </h2>
          </div>

          <div className="relative min-w-0 lg:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              placeholder="Buscar producto, marca o categoría..."
              {...filters.register("search")}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#FF5A3C] focus:ring-2 focus:ring-[#FF5A3C]/30"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 px-5 py-3">
          {[
            { label: "Todos", category: "", stock: "", expiration: "" },
            {
              label: "Bebidas",
              category: "Bebidas",
              stock: "",
              expiration: "",
            },
            {
              label: "Suplementos",
              category: "Suplementos",
              stock: "",
              expiration: "",
            },
            {
              label: "Snacks",
              category: "Snacks",
              stock: "",
              expiration: "",
            },
            {
              label: "Stock bajo",
              category: "",
              stock: "low",
              expiration: "",
            },
            {
              label: "Por vencer",
              category: "",
              stock: "",
              expiration: "warning",
            },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                filters.setValue("category", item.category);
                filters.setValue("stock", item.stock);
                filters.setValue("expiration", item.expiration);
                setPage(1);

                products.request(
                  fetch.get("/products", {
                    query: {
                      search: filters.getValues("search"),
                      category: item.category,
                      stock: item.stock,
                      expiration: item.expiration,
                      page: 1,
                      perPage: 4,
                    },
                  }),
                );
              }}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                filters.watch("category") === item.category &&
                filters.watch("stock") === item.stock &&
                filters.watch("expiration") === item.expiration
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
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-bold">Producto</th>
                    <th className="px-5 py-3 font-bold">Categoría</th>
                    <th className="px-5 py-3 font-bold">Marca</th>
                    <th className="px-5 py-3 text-center font-bold">Stock</th>
                    <th className="px-5 py-3 text-right font-bold">Precio</th>
                    <th className="px-5 py-3 font-bold">Vencimiento</th>
                    <th className="px-5 py-3 font-bold">Estado</th>
                    <th className="px-5 py-3 text-right font-bold">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {products.data.data.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-[#11151C]">
                          {product.name}
                        </p>

                        <p className="font-plex mt-0.5 text-[11px] text-slate-400">
                          {product.sku}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                        {product.category}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {product.brand}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <p
                          className={`font-plex text-sm font-black ${
                            product.stock <= product.minStock
                              ? "text-[#E8431F]"
                              : "text-[#11151C]"
                          }`}
                        >
                          {product.stock}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          mín. {product.minStock}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-black text-[#11151C]">
                        S/ {product.salePrice}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#11151C]">
                          {product.nearestExpiration}
                        </p>

                        <Badge
                          badge={getBadge(
                            {
                              ok: {
                                label: "Correcto",
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
                            },
                            product.expirationStatus,
                          )}
                          className="mt-1 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                        />
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          badge={getBadge(
                            {
                              active: {
                                label: "Activo",
                                background: "#EAFBF2",
                                color: "#168F57",
                              },
                              inactive: {
                                label: "Inactivo",
                                background: "#F1F5F9",
                                color: "#64748B",
                              },
                            },
                            product.status,
                          )}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openComponent("product-stock", {
                                data: { id: product.id },
                                onComplete: reload,
                              })
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                          >
                            <Archive className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openComponent("product-edit", {
                                data: { id: product.id },
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
                              openComponent("product-delete", {
                                data: { id: product.id },
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
              {products.data.data.map((product) => (
                <div key={product.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-black text-[#11151C]">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {product.sku} · {product.category}
                      </p>
                    </div>

                    <Badge
                      badge={getBadge(
                        {
                          ok: {
                            label: "Correcto",
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
                        },
                        product.expirationStatus,
                      )}
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <p className="font-bold text-slate-500">
                      Stock:{" "}
                      <span className="text-[#11151C]">{product.stock}</span>
                    </p>

                    <p className="font-black text-[#11151C]">
                      S/ {product.salePrice}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openComponent("product-stock", {
                          data: { id: product.id },
                          onComplete: reload,
                        })
                      }
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                    >
                      <Archive className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openComponent("product-edit", {
                          data: { id: product.id },
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
                        openComponent("product-delete", {
                          data: { id: product.id },
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

            {products.data.data.length === 0 && (
              <div className="p-6 text-center text-sm font-medium text-slate-400">
                No se encontraron productos.
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <p className="text-xs font-medium text-slate-400">
                Página {products.data.page} de {products.data.totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => {
                    setPage(page - 1);

                    products.request(
                      fetch.get("/products", {
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
                  disabled={page === products.data.totalPages}
                  onClick={() => {
                    setPage(page + 1);

                    products.request(
                      fetch.get("/products", {
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

function ProductCreateModal({ close, complete }: RegisteredComponentProps) {
  const categories = useRequest<ProductGroup[]>([]);
  const brands = useRequest<ProductGroup[]>([]);
  const save = useRequest<unknown>(null);

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: productDefaultValues,
  });

  useEffect(() => {
    categories.request(fetch.get("/products/categories"));
    brands.request(fetch.get("/products/brands"));
  }, []);

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post("/products", values)
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
            Nuevo
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Nuevo producto
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Completa los datos principales del producto.
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
            Crear producto
          </button>
        </>
      }
    >
      <form onSubmit={submit}>
        <ProductFormFields
          form={form}
          categories={categories.data}
          brands={brands.data}
        />
      </form>
    </Modal>
  );
}

function ProductEditModal({ data, close, complete }: RegisteredComponentProps) {
  const id = (data as { id?: string } | undefined)?.id;
  const categories = useRequest<ProductGroup[]>([]);
  const brands = useRequest<ProductGroup[]>([]);
  const save = useRequest<unknown>(null);

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: productDefaultValues,
  });

  useEffect(() => {
    categories.request(fetch.get("/products/categories"));
    brands.request(fetch.get("/products/brands"));

    if (id) {
      fetch.get(`/products/${id}`).then((product: Product) =>
        form.reset({
          name: product.name,
          sku: product.sku,
          status: product.status,
          category: product.category,
          brand: product.brand,
          minStock: product.minStock,
          cost: product.cost,
          salePrice: product.salePrice,
        }),
      );
    }
  }, [id]);

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post("/products", {
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
            Editar producto
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Actualiza los datos principales del producto.
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
        <ProductFormFields
          form={form}
          categories={categories.data}
          brands={brands.data}
        />
      </form>
    </Modal>
  );
}

function StockModal({ data, close, complete }: RegisteredComponentProps) {
  const id = (data as { id?: string } | undefined)?.id;
  const product = useRequest<Product | null>(null);
  const save = useRequest<unknown>(null);

  const form = useForm<StockValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: stockDefaultValues,
  });

  useEffect(() => {
    if (id) {
      fetch.get(`/products/${id}`).then((value: Product) => {
        product.success(value);
        form.setValue("salePrice", value.salePrice);
        form.setValue("cost", value.cost);
      });
    }
  }, [id]);

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post(`/products/${id}/stock`, values)
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
            Inventario
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Agregar stock
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {product.data?.name ?? "Registra una nueva entrada de inventario."}
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
            Agregar stock
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
              Vencimiento
            </span>
            <input
              type="date"
              {...form.register("expiration")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
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
                Precio venta
              </span>
              <input
                type="number"
                {...form.register("salePrice", { valueAsNumber: true })}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
              />
            </label>
          </div>

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

function DeleteProductModal({
  data,
  close,
  complete,
}: RegisteredComponentProps) {
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
            Eliminar producto
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Esta acción quitará el producto del catálogo.
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
                .delete(`/products/${id}`)
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
        ¿Seguro que deseas eliminar este producto? Revisa bien antes de
        continuar.
      </p>
    </Modal>
  );
}

function ProductCategoriesSidebar(props: RegisteredComponentProps) {
  return <ProductGroupsSidebar {...props} type="categories" />;
}

function ProductBrandsSidebar(props: RegisteredComponentProps) {
  return <ProductGroupsSidebar {...props} type="brands" />;
}

function ProductGroupsSidebar({
  close,
  complete,
  type,
}: RegisteredComponentProps & { type: "categories" | "brands" }) {
  const items = useRequest<ProductGroup[]>([]);
  const save = useRequest<unknown>(null);
  const remove = useRequest<unknown>(null);

  const form = useForm<GroupValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: groupDefaultValues,
  });

  const path =
    type === "categories" ? "/products/categories" : "/products/brands";

  const reload = () => {
    items.request(fetch.get(path));
  };

  useEffect(() => {
    reload();
  }, [type]);

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post(path, values)
      .then(() => {
        save.success(null);
        form.reset(groupDefaultValues);
        reload();
        complete();
      })
      .catch(save.fail);
  });

  return (
    <Sidebar
      close={close}
      side="right"
      size="md"
      header={
        <div>
          <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
            {type === "categories" ? "Catálogo" : "Productos"}
          </p>
          <h2 className="font-fraunces text-lg font-bold text-[#11151C]">
            {type === "categories" ? "Categorías" : "Marcas"}
          </h2>
        </div>
      }
      footer={
        <form onSubmit={submit} className="grid gap-3">
          <input
            placeholder={
              type === "categories" ? "Nueva categoría" : "Nueva marca"
            }
            {...form.register("name")}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />

          <button
            type="button"
            onClick={submit}
            className="h-11 cursor-pointer rounded-xl bg-[#FF5A3C] text-sm font-semibold text-white transition hover:bg-[#E8431F]"
          >
            Agregar
          </button>
        </form>
      }
    >
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
        {items.data.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div>
              <p className="text-sm font-bold text-[#11151C]">{item.name}</p>
              <p className="text-xs text-slate-400">
                {item.products} productos
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                remove.start();

                fetch
                  .delete(`${path}/${item.id}`)
                  .then(() => {
                    remove.success(null);
                    reload();
                    complete();
                  })
                  .catch(remove.fail);
              }}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </Sidebar>
  );
}

function ProductFormFields({
  form,
  categories,
  brands,
}: {
  form: ReturnType<typeof useForm<ProductValues>>;
  categories: ProductGroup[];
  brands: ProductGroup[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="md:col-span-2">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Nombre
        </span>
        <input
          placeholder="Ej. Bebida hidratante"
          {...form.register("name")}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
        />
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          SKU
        </span>
        <input
          placeholder="SKU-001"
          {...form.register("sku")}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
        />
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Estado
        </span>
        <select
          {...form.register("status")}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
        >
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Categoría
        </span>
        <select
          {...form.register("category")}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
        >
          <option value="">Seleccionar categoría</option>
          {categories.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Marca
        </span>
        <select
          {...form.register("brand")}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
        >
          <option value="">Seleccionar marca</option>
          {brands.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Stock mínimo
        </span>
        <input
          type="number"
          {...form.register("minStock", { valueAsNumber: true })}
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
          Precio venta
        </span>
        <input
          type="number"
          {...form.register("salePrice", { valueAsNumber: true })}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
        />
      </label>
    </div>
  );
}
