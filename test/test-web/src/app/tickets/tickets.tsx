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
  searchTicketsQuerySchema,
  upsertTicketBodySchema,
  getTicketParamsSchema,
  deleteTicketParamsSchema,
} from "../validators";

type TicketSearchItem = {
  id: string;
  description?: string;
  type?: "request" | "incident" | "query";
  archive?: string | { id: string; [key: string]: unknown };
  response?: string;
  support?: string;
  status?: "open" | "closed";
  created?: string;
  updated?: string;
};

type SearchTicketsResponse = {
  data: TicketSearchItem[];
  pagination: Pagination;
};

type UpsertTicketModalData = {
  id?: z.infer<typeof getTicketParamsSchema>["id"];
};

type DeleteTicketModalData = {
  id?: z.infer<typeof deleteTicketParamsSchema>["id"];
};

const initialTicketsResponse: SearchTicketsResponse = {
  data: [],
  pagination: initialPagination,
};

export function Tickets() {
  const { registerComponent, openComponent } = useComponent();
  const ticketsRequest = useRequest<SearchTicketsResponse>(initialTicketsResponse);

  const searchTickets = (
    query: z.output<typeof searchTicketsQuerySchema> = { page: 1, perPage: 10 },
  ) =>
    ticketsRequest.request(
      fetch.get("/tickets", {
        query: {
          page: query.page,
          perPage: query.perPage,
          description: query.description,
          type: query.type,
          archive: query.archive,
          response: query.response,
          status: query.status,
          ...(query.support?.from && { "support[from]": query.support.from }),
          ...(query.support?.to && { "support[to]": query.support.to }),
        },
      }),
    );

  useEffect(() => {
    registerComponent("upsertTicket", UpsertTicketModal);
    registerComponent("deleteTicket", DeleteTicketModal);
    void searchTickets();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => openComponent("upsertTicket")}
      >
        Nuevo Ticket
      </button>
      <pre>{JSON.stringify(ticketsRequest.data, null, 2)}</pre>
    </div>
  );
}

export function UpsertTicketModal({
  data,
}: RegisteredComponentProps<UpsertTicketModalData>) {
  const getTicketRequest = useRequest<z.output<typeof upsertTicketBodySchema> | null>(null);
  const upsertTicketRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof upsertTicketBodySchema>,
    unknown,
    z.output<typeof upsertTicketBodySchema>
  >({
    resolver: zodResolver(upsertTicketBodySchema),
    mode: "onChange",
    defaultValues: {
      id: data?.id,
    },
  });

  const getTicket = (id: z.infer<typeof getTicketParamsSchema>["id"]) =>
    getTicketRequest.request(fetch.get(`/tickets/${id}`));

  const upsertTicket = (body: z.output<typeof upsertTicketBodySchema>) =>
    upsertTicketRequest.request(fetch.post("/tickets", body));

  useEffect(() => {
    if (!data?.id) return;
    void getTicket(data.id);
  }, [data?.id]);

  useEffect(() => {
    if (!getTicketRequest.data) return;
    form.reset(getTicketRequest.data);
  }, [getTicketRequest.data, form]);

  return (
    <div>
    <form onSubmit={form.handleSubmit(upsertTicket)}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Guardar Ticket
      </button>
    </form>
    </div>
  );
}

export function DeleteTicketModal({
  data,
}: RegisteredComponentProps<DeleteTicketModalData>) {
  const deleteTicketRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof deleteTicketParamsSchema>,
    unknown,
    z.output<typeof deleteTicketParamsSchema>
  >({
    resolver: zodResolver(deleteTicketParamsSchema),
    mode: "onChange",
    defaultValues: {
      id: data!.id,
    },
  });

  const deleteTicket = (id: z.infer<typeof deleteTicketParamsSchema>["id"]) =>
    deleteTicketRequest.request(fetch.delete(`/tickets/${id}`));

  return (
    <div>
    <form onSubmit={form.handleSubmit((body) => deleteTicket(body.id))}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Eliminar Ticket
      </button>
    </form>
    </div>
  );
}
