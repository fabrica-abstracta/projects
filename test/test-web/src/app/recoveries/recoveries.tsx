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
  searchRecoveriesQuerySchema,
  upsertRecoveryBodySchema,
  getRecoveryParamsSchema,
  deleteRecoveryParamsSchema,
} from "../validators";

type RecoverySearchItem = {
  id: string;
  user?: string | { id: string; [key: string]: unknown };
  code?: string;
  expires?: string;
  created?: string;
  updated?: string;
};

type SearchRecoveriesResponse = {
  data: RecoverySearchItem[];
  pagination: Pagination;
};

type UpsertRecoveryModalData = {
  id?: z.infer<typeof getRecoveryParamsSchema>["id"];
};

type DeleteRecoveryModalData = {
  id?: z.infer<typeof deleteRecoveryParamsSchema>["id"];
};

const initialRecoveriesResponse: SearchRecoveriesResponse = {
  data: [],
  pagination: initialPagination,
};

export function Recoveries() {
  const { registerComponent, openComponent } = useComponent();
  const recoveriesRequest = useRequest<SearchRecoveriesResponse>(initialRecoveriesResponse);

  const searchRecoveries = (
    query: z.output<typeof searchRecoveriesQuerySchema> = { page: 1, perPage: 10 },
  ) =>
    recoveriesRequest.request(
      fetch.get("/recoveries", {
        query: {
          page: query.page,
          perPage: query.perPage,
          user: query.user,
          code: query.code,
          ...(query.expires?.from && { "expires[from]": query.expires.from }),
          ...(query.expires?.to && { "expires[to]": query.expires.to }),
        },
      }),
    );

  useEffect(() => {
    registerComponent("upsertRecovery", UpsertRecoveryModal);
    registerComponent("deleteRecovery", DeleteRecoveryModal);
    void searchRecoveries();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => openComponent("upsertRecovery")}
      >
        Nuevo Recovery
      </button>
      <pre>{JSON.stringify(recoveriesRequest.data, null, 2)}</pre>
    </div>
  );
}

export function UpsertRecoveryModal({
  data,
}: RegisteredComponentProps<UpsertRecoveryModalData>) {
  const getRecoveryRequest = useRequest<z.output<typeof upsertRecoveryBodySchema> | null>(null);
  const upsertRecoveryRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof upsertRecoveryBodySchema>,
    unknown,
    z.output<typeof upsertRecoveryBodySchema>
  >({
    resolver: zodResolver(upsertRecoveryBodySchema),
    mode: "onChange",
    defaultValues: {
      id: data?.id,
    },
  });

  const getRecovery = (id: z.infer<typeof getRecoveryParamsSchema>["id"]) =>
    getRecoveryRequest.request(fetch.get(`/recoveries/${id}`));

  const upsertRecovery = (body: z.output<typeof upsertRecoveryBodySchema>) =>
    upsertRecoveryRequest.request(fetch.post("/recoveries", body));

  useEffect(() => {
    if (!data?.id) return;
    void getRecovery(data.id);
  }, [data?.id]);

  useEffect(() => {
    if (!getRecoveryRequest.data) return;
    form.reset(getRecoveryRequest.data);
  }, [getRecoveryRequest.data, form]);

  return (
    <div>
    <form onSubmit={form.handleSubmit(upsertRecovery)}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Guardar Recovery
      </button>
    </form>
    </div>
  );
}

export function DeleteRecoveryModal({
  data,
}: RegisteredComponentProps<DeleteRecoveryModalData>) {
  const deleteRecoveryRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof deleteRecoveryParamsSchema>,
    unknown,
    z.output<typeof deleteRecoveryParamsSchema>
  >({
    resolver: zodResolver(deleteRecoveryParamsSchema),
    mode: "onChange",
    defaultValues: {
      id: data!.id,
    },
  });

  const deleteRecovery = (id: z.infer<typeof deleteRecoveryParamsSchema>["id"]) =>
    deleteRecoveryRequest.request(fetch.delete(`/recoveries/${id}`));

  return (
    <div>
    <form onSubmit={form.handleSubmit((body) => deleteRecovery(body.id))}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Eliminar Recovery
      </button>
    </form>
    </div>
  );
}
