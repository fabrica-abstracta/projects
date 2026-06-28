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
  searchArchivesQuerySchema,
  upsertArchiveBodySchema,
  getArchiveParamsSchema,
  deleteArchiveParamsSchema,
} from "../validators";

type ArchiveSearchItem = {
  id: string;
  bucket?: string;
  object?: string;
  name?: string;
  mime?: string;
  size?: number;
  created?: string;
  updated?: string;
};

type SearchArchivesResponse = {
  data: ArchiveSearchItem[];
  pagination: Pagination;
};

type UpsertArchiveModalData = {
  id?: z.infer<typeof getArchiveParamsSchema>["id"];
};

type DeleteArchiveModalData = {
  id?: z.infer<typeof deleteArchiveParamsSchema>["id"];
};

const initialArchivesResponse: SearchArchivesResponse = {
  data: [],
  pagination: initialPagination,
};

export function Archives() {
  const { registerComponent, openComponent } = useComponent();
  const archivesRequest = useRequest<SearchArchivesResponse>(initialArchivesResponse);

  const searchArchives = (
    query: z.output<typeof searchArchivesQuerySchema> = { page: 1, perPage: 10 },
  ) =>
    archivesRequest.request(
      fetch.get("/archives", {
        query: {
          page: query.page,
          perPage: query.perPage,
          bucket: query.bucket,
          object: query.object,
          name: query.name,
          mime: query.mime,
          size: query.size,
        },
      }),
    );

  useEffect(() => {
    registerComponent("upsertArchive", UpsertArchiveModal);
    registerComponent("deleteArchive", DeleteArchiveModal);
    void searchArchives();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => openComponent("upsertArchive")}
      >
        Nuevo Archive
      </button>
      <pre>{JSON.stringify(archivesRequest.data, null, 2)}</pre>
    </div>
  );
}

export function UpsertArchiveModal({
  data,
}: RegisteredComponentProps<UpsertArchiveModalData>) {
  const getArchiveRequest = useRequest<z.output<typeof upsertArchiveBodySchema> | null>(null);
  const upsertArchiveRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof upsertArchiveBodySchema>,
    unknown,
    z.output<typeof upsertArchiveBodySchema>
  >({
    resolver: zodResolver(upsertArchiveBodySchema),
    mode: "onChange",
    defaultValues: {
      id: data?.id,
    },
  });

  const getArchive = (id: z.infer<typeof getArchiveParamsSchema>["id"]) =>
    getArchiveRequest.request(fetch.get(`/archives/${id}`));

  const upsertArchive = (body: z.output<typeof upsertArchiveBodySchema>) =>
    upsertArchiveRequest.request(fetch.post("/archives", body));

  useEffect(() => {
    if (!data?.id) return;
    void getArchive(data.id);
  }, [data?.id]);

  useEffect(() => {
    if (!getArchiveRequest.data) return;
    form.reset(getArchiveRequest.data);
  }, [getArchiveRequest.data, form]);

  return (
    <div>
    <form onSubmit={form.handleSubmit(upsertArchive)}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Guardar Archive
      </button>
    </form>
    </div>
  );
}

export function DeleteArchiveModal({
  data,
}: RegisteredComponentProps<DeleteArchiveModalData>) {
  const deleteArchiveRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof deleteArchiveParamsSchema>,
    unknown,
    z.output<typeof deleteArchiveParamsSchema>
  >({
    resolver: zodResolver(deleteArchiveParamsSchema),
    mode: "onChange",
    defaultValues: {
      id: data!.id,
    },
  });

  const deleteArchive = (id: z.infer<typeof deleteArchiveParamsSchema>["id"]) =>
    deleteArchiveRequest.request(fetch.delete(`/archives/${id}`));

  return (
    <div>
    <form onSubmit={form.handleSubmit((body) => deleteArchive(body.id))}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Eliminar Archive
      </button>
    </form>
    </div>
  );
}
