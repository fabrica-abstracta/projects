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
  searchSalesQuerySchema,
  upsertSaleBodySchema,
  getSaleParamsSchema,
  deleteSaleParamsSchema,
} from "../validators";

type SaleSearchItem = {
  id: string;
  type?: string;
  customer?: string | { id: string; [key: string]: unknown };
  description?: string;
  products?: { sku?: string; name?: string; description?: string; category?: string; brand?: string; price?: number; quantity?: number; subtotal?: number }[];
  total?: number;
  method?: string;
  reference?: string;
  evidence?: string | { id: string; [key: string]: unknown };
  date?: string;
  created?: string;
  updated?: string;
};

type SearchSalesResponse = {
  data: SaleSearchItem[];
  pagination: Pagination;
};

type UpsertSaleModalData = {
  id?: z.infer<typeof getSaleParamsSchema>["id"];
};

type DeleteSaleModalData = {
  id?: z.infer<typeof deleteSaleParamsSchema>["id"];
};

const initialSalesResponse: SearchSalesResponse = {
  data: [],
  pagination: initialPagination,
};

export function Sales() {
  const { registerComponent, openComponent } = useComponent();
  const salesRequest = useRequest<SearchSalesResponse>(initialSalesResponse);

  const searchSales = (
    query: z.output<typeof searchSalesQuerySchema> = { page: 1, perPage: 10 },
  ) =>
    salesRequest.request(
      fetch.get("/sales", {
        query: {
          page: query.page,
          perPage: query.perPage,
          type: query.type,
          customer: query.customer,
          description: query.description,
          total: query.total,
          method: query.method,
          reference: query.reference,
          evidence: query.evidence,
          ...(query.date?.from && { "date[from]": query.date.from }),
          ...(query.date?.to && { "date[to]": query.date.to }),
        },
      }),
    );

  useEffect(() => {
    registerComponent("upsertSale", UpsertSaleModal);
    registerComponent("deleteSale", DeleteSaleModal);
    void searchSales();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => openComponent("upsertSale")}
      >
        Nuevo Sale
      </button>
      <pre>{JSON.stringify(salesRequest.data, null, 2)}</pre>
    </div>
  );
}

export function UpsertSaleModal({
  data,
}: RegisteredComponentProps<UpsertSaleModalData>) {
  const getSaleRequest = useRequest<z.output<typeof upsertSaleBodySchema> | null>(null);
  const upsertSaleRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof upsertSaleBodySchema>,
    unknown,
    z.output<typeof upsertSaleBodySchema>
  >({
    resolver: zodResolver(upsertSaleBodySchema),
    mode: "onChange",
    defaultValues: {
      id: data?.id,
    },
  });

  const getSale = (id: z.infer<typeof getSaleParamsSchema>["id"]) =>
    getSaleRequest.request(fetch.get(`/sales/${id}`));

  const upsertSale = (body: z.output<typeof upsertSaleBodySchema>) =>
    upsertSaleRequest.request(fetch.post("/sales", body));

  useEffect(() => {
    if (!data?.id) return;
    void getSale(data.id);
  }, [data?.id]);

  useEffect(() => {
    if (!getSaleRequest.data) return;
    form.reset(getSaleRequest.data);
  }, [getSaleRequest.data, form]);

  return (
    <div>
    <form onSubmit={form.handleSubmit(upsertSale)}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Guardar Sale
      </button>
    </form>
    </div>
  );
}

export function DeleteSaleModal({
  data,
}: RegisteredComponentProps<DeleteSaleModalData>) {
  const deleteSaleRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof deleteSaleParamsSchema>,
    unknown,
    z.output<typeof deleteSaleParamsSchema>
  >({
    resolver: zodResolver(deleteSaleParamsSchema),
    mode: "onChange",
    defaultValues: {
      id: data!.id,
    },
  });

  const deleteSale = (id: z.infer<typeof deleteSaleParamsSchema>["id"]) =>
    deleteSaleRequest.request(fetch.delete(`/sales/${id}`));

  return (
    <div>
    <form onSubmit={form.handleSubmit((body) => deleteSale(body.id))}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Eliminar Sale
      </button>
    </form>
    </div>
  );
}
