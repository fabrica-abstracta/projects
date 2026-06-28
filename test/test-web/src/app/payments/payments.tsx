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
  searchPaymentsQuerySchema,
  upsertPaymentBodySchema,
  getPaymentParamsSchema,
  deletePaymentParamsSchema,
} from "../validators";

type PaymentSearchItem = {
  id: string;
  subscription?: string | { id: string; [key: string]: unknown };
  user?: string | { id: string; [key: string]: unknown };
  amount?: number;
  method?: string;
  status?: "pending" | "completed" | "failed" | "refunded";
  transaction?: string;
  evidence?: string | { id: string; [key: string]: unknown };
  created?: string;
  updated?: string;
};

type SearchPaymentsResponse = {
  data: PaymentSearchItem[];
  pagination: Pagination;
};

type UpsertPaymentModalData = {
  id?: z.infer<typeof getPaymentParamsSchema>["id"];
};

type DeletePaymentModalData = {
  id?: z.infer<typeof deletePaymentParamsSchema>["id"];
};

const initialPaymentsResponse: SearchPaymentsResponse = {
  data: [],
  pagination: initialPagination,
};

export function Payments() {
  const { registerComponent, openComponent } = useComponent();
  const paymentsRequest = useRequest<SearchPaymentsResponse>(initialPaymentsResponse);

  const searchPayments = (
    query: z.output<typeof searchPaymentsQuerySchema> = { page: 1, perPage: 10 },
  ) =>
    paymentsRequest.request(
      fetch.get("/payments", {
        query: {
          page: query.page,
          perPage: query.perPage,
          subscription: query.subscription,
          user: query.user,
          amount: query.amount,
          method: query.method,
          status: query.status,
          transaction: query.transaction,
          evidence: query.evidence,
        },
      }),
    );

  useEffect(() => {
    registerComponent("upsertPayment", UpsertPaymentModal);
    registerComponent("deletePayment", DeletePaymentModal);
    void searchPayments();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => openComponent("upsertPayment")}
      >
        Nuevo Payment
      </button>
      <pre>{JSON.stringify(paymentsRequest.data, null, 2)}</pre>
    </div>
  );
}

export function UpsertPaymentModal({
  data,
}: RegisteredComponentProps<UpsertPaymentModalData>) {
  const getPaymentRequest = useRequest<z.output<typeof upsertPaymentBodySchema> | null>(null);
  const upsertPaymentRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof upsertPaymentBodySchema>,
    unknown,
    z.output<typeof upsertPaymentBodySchema>
  >({
    resolver: zodResolver(upsertPaymentBodySchema),
    mode: "onChange",
    defaultValues: {
      id: data?.id,
    },
  });

  const getPayment = (id: z.infer<typeof getPaymentParamsSchema>["id"]) =>
    getPaymentRequest.request(fetch.get(`/payments/${id}`));

  const upsertPayment = (body: z.output<typeof upsertPaymentBodySchema>) =>
    upsertPaymentRequest.request(fetch.post("/payments", body));

  useEffect(() => {
    if (!data?.id) return;
    void getPayment(data.id);
  }, [data?.id]);

  useEffect(() => {
    if (!getPaymentRequest.data) return;
    form.reset(getPaymentRequest.data);
  }, [getPaymentRequest.data, form]);

  return (
    <div>
    <form onSubmit={form.handleSubmit(upsertPayment)}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Guardar Payment
      </button>
    </form>
    </div>
  );
}

export function DeletePaymentModal({
  data,
}: RegisteredComponentProps<DeletePaymentModalData>) {
  const deletePaymentRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof deletePaymentParamsSchema>,
    unknown,
    z.output<typeof deletePaymentParamsSchema>
  >({
    resolver: zodResolver(deletePaymentParamsSchema),
    mode: "onChange",
    defaultValues: {
      id: data!.id,
    },
  });

  const deletePayment = (id: z.infer<typeof deletePaymentParamsSchema>["id"]) =>
    deletePaymentRequest.request(fetch.delete(`/payments/${id}`));

  return (
    <div>
    <form onSubmit={form.handleSubmit((body) => deletePayment(body.id))}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Eliminar Payment
      </button>
    </form>
    </div>
  );
}
