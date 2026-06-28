import { useEffect, useState } from "react";
import { Eye, Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { RequestState } from "../../core/components";
import { fetch, useRequest } from "../../core/config/fetch";
import { Badge, getBadge, Modal } from "../../core/components/index";
import {
  useComponent,
  type RegisteredComponentProps,
} from "../../core/context/component";

type User = {
  id: string;
  names: string;
  email: string;
  phone: string;
  role: string;
  roleLabel: string;
  status: string;
  lastAccess: string;
  createdAt: string;
};

type Role = {
  id: string;
  name: string;
};

type UsersResponse = {
  data: User[];
  page: number;
  totalPages: number;
  total: number;
};

type Summary = {
  users: number;
  active: number;
  pending: number;
  blocked: number;
};

const filtersSchema = z.object({
  search: z.string(),
  role: z.string(),
  status: z.string(),
});

const filtersDefaultValues = {
  search: "",
  role: "",
  status: "",
};

const userSchema = z.object({
  names: z.string().trim().min(1, "El nombre es requerido"),
  email: z.string().trim().email("Correo inválido"),
  phone: z.string().trim().min(1, "El teléfono es requerido"),
  role: z.string().min(1, "El rol es requerido"),
  status: z.string().min(1, "El estado es requerido"),
});

const userDefaultValues = {
  names: "",
  email: "",
  phone: "",
  role: "reception",
  status: "pending",
};

type FiltersValues = z.infer<typeof filtersSchema>;
type UserValues = z.infer<typeof userSchema>;

export function Users() {
  const users = useRequest<UsersResponse>({
    data: [],
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const summary = useRequest<Summary>({
    users: 0,
    active: 0,
    pending: 0,
    blocked: 0,
  });

  const { registerComponent, openComponent } = useComponent();
  const roles = useRequest<Role[]>([]);
  const [page, setPage] = useState(1);

  const filters = useForm<FiltersValues>({
    resolver: zodResolver(filtersSchema),
    defaultValues: filtersDefaultValues,
  });

  const refreshUsers = () => {
    users.request(
      fetch.get("/users", {
        query: {
          ...filters.getValues(),
          page,
          perPage: 4,
        },
      }),
    );

    summary.request(fetch.get("/users/summary"));
  };

  useEffect(() => {
    registerComponent("users-create", CreateUserModal);
    registerComponent("users-edit", EditUserModal);
    registerComponent("users-detail", UserDetailModal);
    registerComponent("users-delete", DeleteUserModal);
    registerComponent("users-invite", InviteUserModal);
  }, [registerComponent]);

  useEffect(() => {
    users.request(
      fetch.get("/users", {
        query: {
          ...filtersDefaultValues,
          page: 1,
          perPage: 4,
        },
      }),
    );

    summary.request(fetch.get("/users/summary"));
    roles.request(fetch.get("/users/roles"));
  }, []);

  return (
    <main className="min-h-screen bg-[#EEF1EF] p-5 text-[#11151C] md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Equipo y accesos
          </p>

          <h1 className="font-fraunces -mt-0.5 text-2xl font-extrabold tracking-tight md:text-3xl">
            Usuarios
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Registra colaboradores, asigna roles y controla su acceso al
            sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            openComponent("users-create", {
              onComplete: refreshUsers,
            })
          }
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A3C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nuevo usuario
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Usuarios
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.users}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Total registrados
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Activos
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.active}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Con acceso habilitado
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Pendientes
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.pending}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Invitación sin usar
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Bloqueados
          </p>

          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.blocked}
            </RequestState>
          </p>

          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Acceso restringido
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <form
          onSubmit={filters.handleSubmit((values) => {
            setPage(1);

            users.request(
              fetch.get("/users", {
                query: {
                  ...values,
                  page: 1,
                  perPage: 4,
                },
              }),
            );
          })}
          className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Registros filtrados
            </p>

            <h2 className="font-fraunces text-xl font-bold text-[#11151C]">
              Colaboradores registrados
            </h2>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 lg:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                placeholder="Buscar usuario, correo o rol..."
                {...filters.register("search")}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#FF5A3C] focus:ring-2 focus:ring-[#FF5A3C]/30"
              />
            </div>

            <select
              {...filters.register("role")}
              onChange={(event) => {
                filters.setValue("role", event.target.value);
                setPage(1);

                users.request(
                  fetch.get("/users", {
                    query: {
                      ...filters.getValues(),
                      role: event.target.value,
                      page: 1,
                      perPage: 4,
                    },
                  }),
                );
              }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#FF5A3C] focus:ring-2 focus:ring-[#FF5A3C]/30"
            >
              <option value="">Todos los roles</option>
              {roles.data.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 px-5 py-3">
          {[
            { id: "", label: "Todos" },
            { id: "active", label: "Activos" },
            { id: "pending", label: "Pendientes" },
            { id: "blocked", label: "Bloqueados" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                filters.setValue("status", item.id);
                setPage(1);

                users.request(
                  fetch.get("/users", {
                    query: {
                      search: filters.getValues("search"),
                      role: filters.getValues("role"),
                      status: item.id,
                      page: 1,
                      perPage: 4,
                    },
                  }),
                );
              }}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                filters.watch("status") === item.id
                  ? "bg-[#11151C] text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-[#FF5A3C]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <RequestState
          status={users.status}
          skeleton={null}
          error={
            <div className="p-5 text-sm font-semibold text-[#E8431F]">_</div>
          }
        >
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[920px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-bold">Usuario</th>
                    <th className="px-5 py-3 font-bold">Rol</th>
                    <th className="px-5 py-3 font-bold">Teléfono</th>
                    <th className="px-5 py-3 font-bold">Último acceso</th>
                    <th className="px-5 py-3 font-bold">Estado</th>
                    <th className="px-5 py-3 text-right font-bold">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {users.data.data.map((user, index) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            style={{
                              backgroundColor: [
                                "#FF5A3C",
                                "#1FAE6B",
                                "#E2932A",
                                "#11151C",
                                "#6D5DFB",
                                "#0F766E",
                              ][index % 6],
                            }}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                          >
                            {user.names
                              .split(" ")
                              .slice(0, 2)
                              .map((word) => word[0])
                              .join("")
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#11151C]">
                              {user.names}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-[#11151C]">
                        {user.roleLabel}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {user.phone}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {user.lastAccess}
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          badge={getBadge(
                            {
                              active: {
                                label: "Activo",
                                background: "#EAFBF2",
                                color: "#168F57",
                              },
                              pending: {
                                label: "Pendiente",
                                background: "#FFF7E8",
                                color: "#B9740F",
                              },
                              blocked: {
                                label: "Bloqueado",
                                background: "#FFF1F2",
                                color: "#F43F5E",
                              },
                            },
                            user.status,
                          )}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openComponent("users-detail", {
                                data: { id: user.id },
                                onComplete: refreshUsers,
                              })
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openComponent("users-edit", {
                                data: { id: user.id },
                                onComplete: refreshUsers,
                              })
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openComponent("users-delete", {
                                data: { id: user.id },
                                onComplete: refreshUsers,
                              })
                            }
                            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {users.data.data.map((user, index) => (
                <div key={user.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        style={{
                          backgroundColor: [
                            "#FF5A3C",
                            "#1FAE6B",
                            "#E2932A",
                            "#11151C",
                            "#6D5DFB",
                            "#0F766E",
                          ][index % 6],
                        }}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      >
                        {user.names
                          .split(" ")
                          .slice(0, 2)
                          .map((word) => word[0])
                          .join("")
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#11151C]">
                          {user.names}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <Badge
                      badge={getBadge(
                        {
                          active: {
                            label: "Activo",
                            background: "#EAFBF2",
                            color: "#168F57",
                          },
                          pending: {
                            label: "Pendiente",
                            background: "#FFF7E8",
                            color: "#B9740F",
                          },
                          blocked: {
                            label: "Bloqueado",
                            background: "#FFF1F2",
                            color: "#F43F5E",
                          },
                        },
                        user.status,
                      )}
                      className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-400">
                      {user.roleLabel}
                    </p>

                    <p className="text-xs font-semibold text-slate-400">
                      {user.lastAccess}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openComponent("users-detail", {
                          data: { id: user.id },
                          onComplete: refreshUsers,
                        })
                      }
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openComponent("users-edit", {
                          data: { id: user.id },
                          onComplete: refreshUsers,
                        })
                      }
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openComponent("users-delete", {
                          data: { id: user.id },
                          onComplete: refreshUsers,
                        })
                      }
                      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-rose-100 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {users.data.data.length === 0 && (
              <div className="p-6 text-center text-sm font-medium text-slate-400">
                No se encontraron usuarios.
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <p className="text-xs font-medium text-slate-400">
                Página {users.data.page} de {users.data.totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => {
                    setPage(page - 1);

                    users.request(
                      fetch.get("/users", {
                        query: {
                          ...filters.getValues(),
                          page: page - 1,
                          perPage: 4,
                        },
                      }),
                    );
                  }}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>

                <button
                  type="button"
                  disabled={page === users.data.totalPages}
                  onClick={() => {
                    setPage(page + 1);

                    users.request(
                      fetch.get("/users", {
                        query: {
                          ...filters.getValues(),
                          page: page + 1,
                          perPage: 4,
                        },
                      }),
                    );
                  }}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        </RequestState>
      </section>
    </main>
  );
}

function CreateUserModal({ close, complete }: RegisteredComponentProps) {
  const save = useRequest<unknown>(null);
  const roles = useRequest<Role[]>([]);

  const form = useForm<UserValues>({
    resolver: zodResolver(userSchema),
    defaultValues: userDefaultValues,
  });

  useEffect(() => {
    roles.request(fetch.get("/users/roles"));
  }, []);

  return (
    <Modal
      close={close}
      size="xl"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Alta de colaborador
          </p>

          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Nuevo usuario
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Completa los datos principales del colaborador.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={form.handleSubmit((values) => {
              save.start();

              fetch
                .post("/users", values)
                .then(() => {
                  save.success(null);
                  complete();
                })
                .catch(save.fail);
            })}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF5A3C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            <ShieldCheck className="h-4 w-4" />
            Registrar usuario
          </button>
        </>
      }
    >
      <form
        onSubmit={form.handleSubmit((values) => {
          save.start();

          fetch
            .post("/users", values)
            .then(() => {
              save.success(null);
              complete();
            })
            .catch(save.fail);
        })}
      >
        <div className="grid gap-4">
          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Nombre completo
            </span>

            <input
              placeholder="Ej. Rosa Martínez"
              {...form.register("names")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Correo de acceso
            </span>

            <input
              placeholder="usuario@empresa.com"
              {...form.register("email")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Teléfono
              </span>

              <input
                placeholder="987 654 321"
                {...form.register("phone")}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Rol
              </span>

              <select
                {...form.register("role")}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
              >
                {roles.data.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Estado
            </span>

            <select
              {...form.register("status")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            >
              <option value="active">Activo</option>
              <option value="pending">Pendiente</option>
              <option value="blocked">Bloqueado</option>
            </select>
          </label>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Vista previa
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FF5A3C] text-sm font-bold text-white">
                {(form.watch("names") || "Nuevo usuario")
                  .split(" ")
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#11151C]">
                  {form.watch("names") || "Nuevo usuario"}
                </p>

                <p className="truncate text-xs text-slate-400">
                  {roles.data.find((role) => role.id === form.watch("role"))
                    ?.name || "Recepción"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function EditUserModal({ data, close, complete }: RegisteredComponentProps) {
  const id = (data as { id?: string } | undefined)?.id;
  const save = useRequest<unknown>(null);
  const roles = useRequest<Role[]>([]);

  const form = useForm<UserValues>({
    resolver: zodResolver(userSchema),
    defaultValues: userDefaultValues,
  });

  useEffect(() => {
    roles.request(fetch.get("/users/roles"));

    if (id) {
      fetch.get(`/users/${id}`).then((user: User) =>
        form.reset({
          names: user.names,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
        }),
      );
    }
  }, []);

  return (
    <Modal
      close={close}
      size="xl"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Editar
          </p>

          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Editar usuario
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Completa los datos principales del colaborador.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={form.handleSubmit((values) => {
              save.start();

              fetch
                .post("/users", {
                  id,
                  ...values,
                })
                .then(() => {
                  save.success(null);
                  complete();
                })
                .catch(save.fail);
            })}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF5A3C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            <ShieldCheck className="h-4 w-4" />
            Guardar cambios
          </button>
        </>
      }
    >
      <form
        onSubmit={form.handleSubmit((values) => {
          save.start();

          fetch
            .post("/users", {
              id,
              ...values,
            })
            .then(() => {
              save.success(null);
              complete();
            })
            .catch(save.fail);
        })}
      >
        <div className="grid gap-4">
          <input type="hidden" value={id ?? ""} />

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Nombre completo
            </span>

            <input
              placeholder="Ej. Rosa Martínez"
              {...form.register("names")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Correo de acceso
            </span>

            <input
              placeholder="usuario@empresa.com"
              {...form.register("email")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Teléfono
              </span>

              <input
                placeholder="987 654 321"
                {...form.register("phone")}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Rol
              </span>

              <select
                {...form.register("role")}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
              >
                {roles.data.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Estado
            </span>

            <select
              {...form.register("status")}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
            >
              <option value="active">Activo</option>
              <option value="pending">Pendiente</option>
              <option value="blocked">Bloqueado</option>
            </select>
          </label>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Vista previa
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FF5A3C] text-sm font-bold text-white">
                {(form.watch("names") || "Nuevo usuario")
                  .split(" ")
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join("")
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#11151C]">
                  {form.watch("names") || "Nuevo usuario"}
                </p>

                <p className="truncate text-xs text-slate-400">
                  {roles.data.find((role) => role.id === form.watch("role"))
                    ?.name || "Recepción"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function UserDetailModal({ data, close, complete }: RegisteredComponentProps) {
  const { openComponent } = useComponent();
  const id = (data as { id?: string } | undefined)?.id;
  const user = useRequest<User | null>(null);

  useEffect(() => {
    if (id) user.request(fetch.get(`/users/${id}`));
  }, []);

  return (
    <Modal
      close={close}
      size="md"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Perfil interno
          </p>

          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Detalle del usuario
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Resumen visual del colaborador seleccionado.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={() =>
              openComponent("users-edit", {
                data: { id },
                onComplete: complete,
              })
            }
            className="cursor-pointer rounded-xl bg-[#11151C] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() =>
              openComponent("users-invite", {
                data: { id },
                onComplete: complete,
              })
            }
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-[#11151C] transition hover:border-[#FF5A3C]"
          >
            Reenviar acceso
          </button>
        </>
      }
    >
      <RequestState
        status={user.status}
        skeleton={null}
        error={<span className="text-[#E8431F]">_</span>}
      >
        <>
          <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FF5A3C] text-lg font-bold text-white">
              {user.data?.names
                .split(" ")
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-black text-[#11151C]">
                {user.data?.names}
              </p>

              <p className="truncate text-xs text-slate-400">
                {user.data?.email}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-xs font-semibold text-slate-500">
                Teléfono
              </span>
              <span className="text-right text-sm font-semibold text-[#11151C]">
                {user.data?.phone}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-xs font-semibold text-slate-500">Rol</span>
              <span className="text-right text-sm font-semibold text-[#11151C]">
                {user.data?.roleLabel}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-xs font-semibold text-slate-500">
                Creado
              </span>
              <span className="text-right text-sm font-semibold text-[#11151C]">
                {user.data?.createdAt}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-xs font-semibold text-slate-500">
                Último acceso
              </span>
              <span className="text-right text-sm font-semibold text-[#11151C]">
                {user.data?.lastAccess}
              </span>
            </div>
          </div>
        </>
      </RequestState>
    </Modal>
  );
}

function DeleteUserModal({ data, close, complete }: RegisteredComponentProps) {
  const id = (data as { id?: string } | undefined)?.id;
  const remove = useRequest<unknown>(null);

  return (
    <Modal
      close={close}
      size="md"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-rose-500">
            Eliminar
          </p>

          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Eliminar usuario
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Esta acción bloqueará el acceso del colaborador.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => {
              remove.start();

              fetch
                .delete(`/users/${id}`)
                .then(() => {
                  remove.success(null);
                  complete();
                })
                .catch(remove.fail);
            }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-600 active:scale-[0.98]"
          >
            <ShieldCheck className="h-4 w-4" />
            Sí, eliminar
          </button>
        </>
      }
    >
      <p className="text-sm leading-6 text-slate-500">
        ¿Seguro que deseas eliminar este usuario? Verifica que no tenga
        operaciones pendientes antes de continuar.
      </p>
    </Modal>
  );
}

function InviteUserModal({ data, close, complete }: RegisteredComponentProps) {
  const id = (data as { id?: string } | undefined)?.id;
  const user = useRequest<User | null>(null);
  const invite = useRequest<unknown>(null);

  useEffect(() => {
    if (id) user.request(fetch.get(`/users/${id}`));
  }, []);

  return (
    <Modal
      close={close}
      size="md"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Invitación
          </p>

          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Reenviar acceso
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Envía nuevamente el enlace de acceso al colaborador.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={() => {
              invite.start();

              fetch
                .post(`/users/${id}/invite`)
                .then(() => {
                  invite.success(null);
                  complete();
                })
                .catch(invite.fail);
            }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#11151C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-black active:scale-[0.98]"
          >
            <ShieldCheck className="h-4 w-4" />
            Reenviar invitación
          </button>
        </>
      }
    >
      <RequestState
        status={user.status}
        skeleton={null}
        error={<span className="text-[#E8431F]">_</span>}
      >
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm font-bold text-[#11151C]">{user.data?.names}</p>

          <p className="mt-1 text-xs text-slate-400">{user.data?.email}</p>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Se enviará un nuevo correo de invitación para que el usuario pueda
            configurar su acceso.
          </p>
        </div>
      </RequestState>
    </Modal>
  );
}
