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
  searchSubscriptionsQuerySchema,
  upsertSubscriptionBodySchema,
  getSubscriptionParamsSchema,
  deleteSubscriptionParamsSchema,
} from "../validators";

type SubscriptionSearchItem = {
  id: string;
  user?: string | { id: string; [key: string]: unknown };
  plan?: { name?: string; description?: string; price?: number; features?: string[]; limits?: Record<string, number> };
  end?: string;
  created?: string;
  updated?: string;
};

type SearchSubscriptionsResponse = {
  data: SubscriptionSearchItem[];
  pagination: Pagination;
};

type UpsertSubscriptionModalData = {
  id?: z.infer<typeof getSubscriptionParamsSchema>["id"];
};

type DeleteSubscriptionModalData = {
  id?: z.infer<typeof deleteSubscriptionParamsSchema>["id"];
};

const initialSubscriptionsResponse: SearchSubscriptionsResponse = {
  data: [],
  pagination: initialPagination,
};

export function Subscriptions() {
  const { registerComponent, openComponent } = useComponent();
  const subscriptionsRequest = useRequest<SearchSubscriptionsResponse>(initialSubscriptionsResponse);

  const searchSubscriptions = (
    query: z.output<typeof searchSubscriptionsQuerySchema> = { page: 1, perPage: 10 },
  ) =>
    subscriptionsRequest.request(
      fetch.get("/subscriptions", {
        query: {
          page: query.page,
          perPage: query.perPage,
          user: query.user,
          ...(query.end?.from && { "end[from]": query.end.from }),
          ...(query.end?.to && { "end[to]": query.end.to }),
        },
      }),
    );

  useEffect(() => {
    registerComponent("upsertSubscription", UpsertSubscriptionModal);
    registerComponent("deleteSubscription", DeleteSubscriptionModal);
    void searchSubscriptions();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => openComponent("upsertSubscription")}
      >
        Nuevo Subscription
      </button>
      <pre>{JSON.stringify(subscriptionsRequest.data, null, 2)}</pre>
    </div>
  );
}

export function UpsertSubscriptionModal({
  data,
}: RegisteredComponentProps<UpsertSubscriptionModalData>) {
  const getSubscriptionRequest = useRequest<z.output<typeof upsertSubscriptionBodySchema> | null>(null);
  const upsertSubscriptionRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof upsertSubscriptionBodySchema>,
    unknown,
    z.output<typeof upsertSubscriptionBodySchema>
  >({
    resolver: zodResolver(upsertSubscriptionBodySchema),
    mode: "onChange",
    defaultValues: {
      id: data?.id,
    },
  });

  const getSubscription = (id: z.infer<typeof getSubscriptionParamsSchema>["id"]) =>
    getSubscriptionRequest.request(fetch.get(`/subscriptions/${id}`));

  const upsertSubscription = (body: z.output<typeof upsertSubscriptionBodySchema>) =>
    upsertSubscriptionRequest.request(fetch.post("/subscriptions", body));

  useEffect(() => {
    if (!data?.id) return;
    void getSubscription(data.id);
  }, [data?.id]);

  useEffect(() => {
    if (!getSubscriptionRequest.data) return;
    form.reset(getSubscriptionRequest.data);
  }, [getSubscriptionRequest.data, form]);

  return (
    <div>
    <form onSubmit={form.handleSubmit(upsertSubscription)}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Guardar Subscription
      </button>
    </form>
    </div>
  );
}

export function DeleteSubscriptionModal({
  data,
}: RegisteredComponentProps<DeleteSubscriptionModalData>) {
  const deleteSubscriptionRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof deleteSubscriptionParamsSchema>,
    unknown,
    z.output<typeof deleteSubscriptionParamsSchema>
  >({
    resolver: zodResolver(deleteSubscriptionParamsSchema),
    mode: "onChange",
    defaultValues: {
      id: data!.id,
    },
  });

  const deleteSubscription = (id: z.infer<typeof deleteSubscriptionParamsSchema>["id"]) =>
    deleteSubscriptionRequest.request(fetch.delete(`/subscriptions/${id}`));

  return (
    <div>
    <form onSubmit={form.handleSubmit((body) => deleteSubscription(body.id))}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Eliminar Subscription
      </button>
    </form>
    </div>
  );
}
