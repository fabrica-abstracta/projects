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
  searchUsersQuerySchema,
  upsertUserBodySchema,
  getUserParamsSchema,
  deleteUserParamsSchema,
} from "../validators";

type UserSearchItem = {
  id: string;
  names?: string;
  email?: string;
  password?: string;
  role?: string | { id: string; [key: string]: unknown };
  created?: string;
  updated?: string;
};

type SearchUsersResponse = {
  data: UserSearchItem[];
  pagination: Pagination;
};

type UpsertUserModalData = {
  id?: z.infer<typeof getUserParamsSchema>["id"];
};

type DeleteUserModalData = {
  id?: z.infer<typeof deleteUserParamsSchema>["id"];
};

const initialUsersResponse: SearchUsersResponse = {
  data: [],
  pagination: initialPagination,
};

export function Users() {
  const { registerComponent, openComponent } = useComponent();
  const usersRequest = useRequest<SearchUsersResponse>(initialUsersResponse);

  const searchUsers = (
    query: z.output<typeof searchUsersQuerySchema> = { page: 1, perPage: 10 },
  ) =>
    usersRequest.request(
      fetch.get("/users", {
        query: {
          page: query.page,
          perPage: query.perPage,
          names: query.names,
          email: query.email,
          password: query.password,
          role: query.role,
        },
      }),
    );

  useEffect(() => {
    registerComponent("upsertUser", UpsertUserModal);
    registerComponent("deleteUser", DeleteUserModal);
    void searchUsers();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => openComponent("upsertUser")}
      >
        Nuevo User
      </button>
      <pre>{JSON.stringify(usersRequest.data, null, 2)}</pre>
    </div>
  );
}

export function UpsertUserModal({
  data,
}: RegisteredComponentProps<UpsertUserModalData>) {
  const getUserRequest = useRequest<z.output<typeof upsertUserBodySchema> | null>(null);
  const upsertUserRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof upsertUserBodySchema>,
    unknown,
    z.output<typeof upsertUserBodySchema>
  >({
    resolver: zodResolver(upsertUserBodySchema),
    mode: "onChange",
    defaultValues: {
      id: data?.id,
    },
  });

  const getUser = (id: z.infer<typeof getUserParamsSchema>["id"]) =>
    getUserRequest.request(fetch.get(`/users/${id}`));

  const upsertUser = (body: z.output<typeof upsertUserBodySchema>) =>
    upsertUserRequest.request(fetch.post("/users", body));

  useEffect(() => {
    if (!data?.id) return;
    void getUser(data.id);
  }, [data?.id]);

  useEffect(() => {
    if (!getUserRequest.data) return;
    form.reset(getUserRequest.data);
  }, [getUserRequest.data, form]);

  return (
    <div>
    <form onSubmit={form.handleSubmit(upsertUser)}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Guardar User
      </button>
    </form>
    </div>
  );
}

export function DeleteUserModal({
  data,
}: RegisteredComponentProps<DeleteUserModalData>) {
  const deleteUserRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof deleteUserParamsSchema>,
    unknown,
    z.output<typeof deleteUserParamsSchema>
  >({
    resolver: zodResolver(deleteUserParamsSchema),
    mode: "onChange",
    defaultValues: {
      id: data!.id,
    },
  });

  const deleteUser = (id: z.infer<typeof deleteUserParamsSchema>["id"]) =>
    deleteUserRequest.request(fetch.delete(`/users/${id}`));

  return (
    <div>
    <form onSubmit={form.handleSubmit((body) => deleteUser(body.id))}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Eliminar User
      </button>
    </form>
    </div>
  );
}
