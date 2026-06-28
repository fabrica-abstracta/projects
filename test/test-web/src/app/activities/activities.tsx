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
  searchActivitiesQuerySchema,
  upsertActivityBodySchema,
  getActivityParamsSchema,
  deleteActivityParamsSchema,
} from "../validators";

type ActivitySearchItem = {
  id: string;
  type?: string;
  user?: string | { id: string; [key: string]: unknown };
  customer?: string | { id: string; [key: string]: unknown };
  summary?: string;
  description?: string;
  created?: string;
  updated?: string;
};

type SearchActivitiesResponse = {
  data: ActivitySearchItem[];
  pagination: Pagination;
};

type UpsertActivityModalData = {
  id?: z.infer<typeof getActivityParamsSchema>["id"];
};

type DeleteActivityModalData = {
  id?: z.infer<typeof deleteActivityParamsSchema>["id"];
};

const initialActivitiesResponse: SearchActivitiesResponse = {
  data: [],
  pagination: initialPagination,
};

export function Activities() {
  const { registerComponent, openComponent } = useComponent();
  const activitiesRequest = useRequest<SearchActivitiesResponse>(initialActivitiesResponse);

  const searchActivities = (
    query: z.output<typeof searchActivitiesQuerySchema> = { page: 1, perPage: 10 },
  ) =>
    activitiesRequest.request(
      fetch.get("/activities", {
        query: {
          page: query.page,
          perPage: query.perPage,
          type: query.type,
          user: query.user,
          customer: query.customer,
          summary: query.summary,
          description: query.description,
        },
      }),
    );

  useEffect(() => {
    registerComponent("upsertActivity", UpsertActivityModal);
    registerComponent("deleteActivity", DeleteActivityModal);
    void searchActivities();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => openComponent("upsertActivity")}
      >
        Nuevo Activity
      </button>
      <pre>{JSON.stringify(activitiesRequest.data, null, 2)}</pre>
    </div>
  );
}

export function UpsertActivityModal({
  data,
}: RegisteredComponentProps<UpsertActivityModalData>) {
  const getActivityRequest = useRequest<z.output<typeof upsertActivityBodySchema> | null>(null);
  const upsertActivityRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof upsertActivityBodySchema>,
    unknown,
    z.output<typeof upsertActivityBodySchema>
  >({
    resolver: zodResolver(upsertActivityBodySchema),
    mode: "onChange",
    defaultValues: {
      id: data?.id,
    },
  });

  const getActivity = (id: z.infer<typeof getActivityParamsSchema>["id"]) =>
    getActivityRequest.request(fetch.get(`/activities/${id}`));

  const upsertActivity = (body: z.output<typeof upsertActivityBodySchema>) =>
    upsertActivityRequest.request(fetch.post("/activities", body));

  useEffect(() => {
    if (!data?.id) return;
    void getActivity(data.id);
  }, [data?.id]);

  useEffect(() => {
    if (!getActivityRequest.data) return;
    form.reset(getActivityRequest.data);
  }, [getActivityRequest.data, form]);

  return (
    <div>
    <form onSubmit={form.handleSubmit(upsertActivity)}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Guardar Activity
      </button>
    </form>
    </div>
  );
}

export function DeleteActivityModal({
  data,
}: RegisteredComponentProps<DeleteActivityModalData>) {
  const deleteActivityRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof deleteActivityParamsSchema>,
    unknown,
    z.output<typeof deleteActivityParamsSchema>
  >({
    resolver: zodResolver(deleteActivityParamsSchema),
    mode: "onChange",
    defaultValues: {
      id: data!.id,
    },
  });

  const deleteActivity = (id: z.infer<typeof deleteActivityParamsSchema>["id"]) =>
    deleteActivityRequest.request(fetch.delete(`/activities/${id}`));

  return (
    <div>
    <form onSubmit={form.handleSubmit((body) => deleteActivity(body.id))}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Eliminar Activity
      </button>
    </form>
    </div>
  );
}
