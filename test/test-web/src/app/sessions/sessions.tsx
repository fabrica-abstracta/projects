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
  searchSessionsQuerySchema,
  upsertSessionBodySchema,
  getSessionParamsSchema,
  deleteSessionParamsSchema,
} from "../validators";

type SessionSearchItem = {
  id: string;
  user?: string | { id: string; [key: string]: unknown };
  device?: string;
  ip?: string;
  expires?: string;
  created?: string;
  updated?: string;
};

type SearchSessionsResponse = {
  data: SessionSearchItem[];
  pagination: Pagination;
};

type UpsertSessionModalData = {
  id?: z.infer<typeof getSessionParamsSchema>["id"];
};

type DeleteSessionModalData = {
  id?: z.infer<typeof deleteSessionParamsSchema>["id"];
};

const initialSessionsResponse: SearchSessionsResponse = {
  data: [],
  pagination: initialPagination,
};

export function Sessions() {
  const { registerComponent, openComponent } = useComponent();
  const sessionsRequest = useRequest<SearchSessionsResponse>(initialSessionsResponse);

  const searchSessions = (
    query: z.output<typeof searchSessionsQuerySchema> = { page: 1, perPage: 10 },
  ) =>
    sessionsRequest.request(
      fetch.get("/sessions", {
        query: {
          page: query.page,
          perPage: query.perPage,
          user: query.user,
          device: query.device,
          ip: query.ip,
          ...(query.expires?.from && { "expires[from]": query.expires.from }),
          ...(query.expires?.to && { "expires[to]": query.expires.to }),
        },
      }),
    );

  useEffect(() => {
    registerComponent("upsertSession", UpsertSessionModal);
    registerComponent("deleteSession", DeleteSessionModal);
    void searchSessions();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => openComponent("upsertSession")}
      >
        Nuevo Session
      </button>
      <pre>{JSON.stringify(sessionsRequest.data, null, 2)}</pre>
    </div>
  );
}

export function UpsertSessionModal({
  data,
}: RegisteredComponentProps<UpsertSessionModalData>) {
  const getSessionRequest = useRequest<z.output<typeof upsertSessionBodySchema> | null>(null);
  const upsertSessionRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof upsertSessionBodySchema>,
    unknown,
    z.output<typeof upsertSessionBodySchema>
  >({
    resolver: zodResolver(upsertSessionBodySchema),
    mode: "onChange",
    defaultValues: {
      id: data?.id,
    },
  });

  const getSession = (id: z.infer<typeof getSessionParamsSchema>["id"]) =>
    getSessionRequest.request(fetch.get(`/sessions/${id}`));

  const upsertSession = (body: z.output<typeof upsertSessionBodySchema>) =>
    upsertSessionRequest.request(fetch.post("/sessions", body));

  useEffect(() => {
    if (!data?.id) return;
    void getSession(data.id);
  }, [data?.id]);

  useEffect(() => {
    if (!getSessionRequest.data) return;
    form.reset(getSessionRequest.data);
  }, [getSessionRequest.data, form]);

  return (
    <div>
    <form onSubmit={form.handleSubmit(upsertSession)}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Guardar Session
      </button>
    </form>
    </div>
  );
}

export function DeleteSessionModal({
  data,
}: RegisteredComponentProps<DeleteSessionModalData>) {
  const deleteSessionRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof deleteSessionParamsSchema>,
    unknown,
    z.output<typeof deleteSessionParamsSchema>
  >({
    resolver: zodResolver(deleteSessionParamsSchema),
    mode: "onChange",
    defaultValues: {
      id: data!.id,
    },
  });

  const deleteSession = (id: z.infer<typeof deleteSessionParamsSchema>["id"]) =>
    deleteSessionRequest.request(fetch.delete(`/sessions/${id}`));

  return (
    <div>
    <form onSubmit={form.handleSubmit((body) => deleteSession(body.id))}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Eliminar Session
      </button>
    </form>
    </div>
  );
}
