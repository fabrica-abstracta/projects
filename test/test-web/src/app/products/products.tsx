import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetch, useRequest, type ApiMessage } from "../../core/config/fetch";
import { initialPagination, type Pagination } from "../../core/types";
import {
  useComponent,
  type RegisteredComponentProps,
} from "../../core/context/component";
import {
  searchProductsQuerySchema,
  upsertProductBodySchema,
  getProductParamsSchema,
  deleteProductParamsSchema,
} from "../validators";

type ProductSearchItem = {
  id: string;
  sku?: string;
  name?: string;
  description?: string;
  category?: string | { id: string; [key: string]: unknown };
  brand?: string | { id: string; [key: string]: unknown };
  stock?: number;
  alert?: number;
  price?: number;
  isActive?: boolean;
  created?: string;
  updated?: string;
};

type SearchProductsResponse = {
  data: ProductSearchItem[];
  pagination: Pagination;
};

type UpsertProductModalData = {
  id?: z.infer<typeof getProductParamsSchema>["id"];
};

type DeleteProductModalData = {
  id?: z.infer<typeof deleteProductParamsSchema>["id"];
};

const initialProductsResponse: SearchProductsResponse = {
  data: [],
  pagination: initialPagination,
};

export function Products() {
  const { registerComponent, openComponent } = useComponent();
  const productsRequest = useRequest<SearchProductsResponse>(initialProductsResponse);

  const searchProducts = (
    query: z.output<typeof searchProductsQuerySchema> = { page: 1, perPage: 10 },
  ) =>
    productsRequest.request(
      fetch.get("/products", {
        query: {
          page: query.page,
          perPage: query.perPage,
          sku: query.sku,
          name: query.name,
          description: query.description,
          category: query.category,
          brand: query.brand,
          stock: query.stock,
          alert: query.alert,
          price: query.price,
          isActive: query.isActive,
        },
      }),
    );

  useEffect(() => {
    registerComponent("upsertProduct", UpsertProductModal);
    registerComponent("deleteProduct", DeleteProductModal);
    void searchProducts();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => openComponent("upsertProduct")}
      >
        Nuevo Product
      </button>
      <pre>{JSON.stringify(productsRequest.data, null, 2)}</pre>
    </div>
  );
}

export function UpsertProductModal({
  data,
}: RegisteredComponentProps<UpsertProductModalData>) {
  const getProductRequest = useRequest<z.output<typeof upsertProductBodySchema> | null>(null);
  const upsertProductRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof upsertProductBodySchema>,
    unknown,
    z.output<typeof upsertProductBodySchema>
  >({
    resolver: zodResolver(upsertProductBodySchema),
    mode: "onChange",
    defaultValues: {
      id: data?.id,
    },
  });

  const getProduct = (id: z.infer<typeof getProductParamsSchema>["id"]) =>
    getProductRequest.request(fetch.get(`/products/${id}`));

  const upsertProduct = (body: z.output<typeof upsertProductBodySchema>) =>
    upsertProductRequest.request(fetch.post("/products", body));

  useEffect(() => {
    if (!data?.id) return;
    void getProduct(data.id);
  }, [data?.id]);

  useEffect(() => {
    if (!getProductRequest.data) return;
    form.reset(getProductRequest.data);
  }, [getProductRequest.data, form]);

  return (
    <div>
    <form onSubmit={form.handleSubmit(upsertProduct)}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Guardar Product
      </button>
    </form>
    </div>
  );
}

export function DeleteProductModal({
  data,
}: RegisteredComponentProps<DeleteProductModalData>) {
  const deleteProductRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof deleteProductParamsSchema>,
    unknown,
    z.output<typeof deleteProductParamsSchema>
  >({
    resolver: zodResolver(deleteProductParamsSchema),
    mode: "onChange",
    defaultValues: {
      id: data!.id,
    },
  });

  const deleteProduct = (id: z.infer<typeof deleteProductParamsSchema>["id"]) =>
    deleteProductRequest.request(fetch.delete(`/products/${id}`));

  return (
    <div>
    <form onSubmit={form.handleSubmit((body) => deleteProduct(body.id))}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Eliminar Product
      </button>
    </form>
    </div>
  );
}
