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
  searchRolesQuerySchema,
  upsertRoleBodySchema,
  getRoleParamsSchema,
  deleteRoleParamsSchema,
} from "../validators";

type RoleSearchItem = {
  id: string;
  name?: string;
  description?: string;
  permissions?: Record<string, string[]>;
  created?: string;
  updated?: string;
};

type SearchRolesResponse = {
  data: RoleSearchItem[];
  pagination: Pagination;
};

type UpsertRoleModalData = {
  id?: z.infer<typeof getRoleParamsSchema>["id"];
};

type DeleteRoleModalData = {
  id?: z.infer<typeof deleteRoleParamsSchema>["id"];
};

const initialRolesResponse: SearchRolesResponse = {
  data: [],
  pagination: initialPagination,
};

export function Roles() {
  const { registerComponent, openComponent } = useComponent();
  const rolesRequest = useRequest<SearchRolesResponse>(initialRolesResponse);

  const searchRoles = (
    query: z.output<typeof searchRolesQuerySchema> = { page: 1, perPage: 10 },
  ) =>
    rolesRequest.request(
      fetch.get("/roles", {
        query: {
          page: query.page,
          perPage: query.perPage,
          name: query.name,
          description: query.description,
        },
      }),
    );

  useEffect(() => {
    registerComponent("upsertRole", UpsertRoleModal);
    registerComponent("deleteRole", DeleteRoleModal);
    void searchRoles();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => openComponent("upsertRole")}
      >
        Nuevo Role
      </button>
      <pre>{JSON.stringify(rolesRequest.data, null, 2)}</pre>
    </div>
  );
}

export function UpsertRoleModal({
  data,
}: RegisteredComponentProps<UpsertRoleModalData>) {
  const getRoleRequest = useRequest<z.output<typeof upsertRoleBodySchema> | null>(null);
  const upsertRoleRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof upsertRoleBodySchema>,
    unknown,
    z.output<typeof upsertRoleBodySchema>
  >({
    resolver: zodResolver(upsertRoleBodySchema),
    mode: "onChange",
    defaultValues: {
      id: data?.id,
    },
  });

  const getRole = (id: z.infer<typeof getRoleParamsSchema>["id"]) =>
    getRoleRequest.request(fetch.get(`/roles/${id}`));

  const upsertRole = (body: z.output<typeof upsertRoleBodySchema>) =>
    upsertRoleRequest.request(fetch.post("/roles", body));

  useEffect(() => {
    if (!data?.id) return;
    void getRole(data.id);
  }, [data?.id]);

  useEffect(() => {
    if (!getRoleRequest.data) return;
    form.reset(getRoleRequest.data);
  }, [getRoleRequest.data, form]);

  return (
    <div>
    <form onSubmit={form.handleSubmit(upsertRole)}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Guardar Role
      </button>
    </form>
    </div>
  );
}

export function DeleteRoleModal({
  data,
}: RegisteredComponentProps<DeleteRoleModalData>) {
  const deleteRoleRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof deleteRoleParamsSchema>,
    unknown,
    z.output<typeof deleteRoleParamsSchema>
  >({
    resolver: zodResolver(deleteRoleParamsSchema),
    mode: "onChange",
    defaultValues: {
      id: data!.id,
    },
  });

  const deleteRole = (id: z.infer<typeof deleteRoleParamsSchema>["id"]) =>
    deleteRoleRequest.request(fetch.delete(`/roles/${id}`));

  return (
    <div>
    <form onSubmit={form.handleSubmit((body) => deleteRole(body.id))}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Eliminar Role
      </button>
    </form>
    </div>
  );
}
