import { useEffect, useState } from "react";
import { Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { RequestState } from "../../core/components";
import { fetch, useRequest } from "../../core/config/fetch";
import {
  useComponent,
  type RegisteredComponentProps,
} from "../../core/context/component";
import { Badge, getBadge, Modal } from "../../core/components/index";
import modules from "../../core/data/modules.json";

type ModuleElement = {
  label: string;
  href: string;
  icon: string;
  description: string;
};

type ModuleGroup = {
  name: string;
  elements: ModuleElement[];
};

type ActionKey =
  | "search"
  | "create"
  | "update"
  | "delete"
  | "pay"
  | "renew"
  | "cancel"
  | "export";

type PermissionMap = Record<string, ActionKey[]>;

type Role = {
  id: string;
  name: string;
  description: string;
  status: string;
  users: number;
  permissions: PermissionMap;
};

type RolesResponse = {
  data: Role[];
  page: number;
  totalPages: number;
  total: number;
};

type Summary = {
  roles: number;
  active: number;
  inactive: number;
  users: number;
};

const menuModules = modules as ModuleGroup[];
const permissionPages = menuModules.flatMap((group) => group.elements);

const actions: { key: ActionKey; label: string }[] = [
  { key: "search", label: "Ver" },
  { key: "create", label: "Crear" },
  { key: "update", label: "Editar" },
  { key: "delete", label: "Eliminar" },
  { key: "pay", label: "Pagar" },
  { key: "renew", label: "Renovar" },
  { key: "cancel", label: "Cancelar" },
  { key: "export", label: "Exportar" },
];

const filtersSchema = z.object({
  search: z.string(),
  status: z.string(),
  assigned: z.string(),
});

const filtersDefaultValues = {
  search: "",
  status: "",
  assigned: "",
};

const roleSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  description: z.string().trim().min(1, "La descripción es requerida"),
  status: z.string().min(1, "El estado es requerido"),
});

const roleDefaultValues = {
  name: "",
  description: "",
  status: "active",
};

type FiltersValues = z.infer<typeof filtersSchema>;
type RoleValues = z.infer<typeof roleSchema>;

export function Roles() {
  const roles = useRequest<RolesResponse>({
    data: [],
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const summary = useRequest<Summary>({
    roles: 0,
    active: 0,
    inactive: 0,
    users: 0,
  });

  const [page, setPage] = useState(1);
  const { registerComponent, openComponent } = useComponent();

  const filters = useForm<FiltersValues>({
    resolver: zodResolver(filtersSchema),
    defaultValues: filtersDefaultValues,
  });

  useEffect(() => {
    registerComponent("role-create", CreateRoleModal);
    registerComponent("role-edit", EditRoleModal);
    registerComponent("role-permissions", PermissionsModal);
    registerComponent("role-delete", DeleteRoleModal);
  }, [registerComponent]);

  useEffect(() => {
    roles.request(
      fetch.get("/roles", {
        query: {
          ...filters.getValues(),
          page: 1,
          perPage: 4,
        },
      }),
    );

    summary.request(fetch.get("/roles/summary"));
  }, []);

  return (
    <main className="min-h-screen bg-[#EEF1EF] p-5 text-[#11151C] md:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Equipo y accesos
          </p>

          <h1 className="font-fraunces -mt-0.5 text-2xl font-extrabold tracking-tight md:text-3xl">
            Roles y permisos
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Define qué puede ver, crear, editar, eliminar o gestionar cada
            colaborador.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            openComponent("role-create", {
              onComplete: () => {
                roles.request(
                  fetch.get("/roles", {
                    query: {
                      ...filters.getValues(),
                      page,
                      perPage: 4,
                    },
                  }),
                );

                summary.request(fetch.get("/roles/summary"));
              },
            })
          }
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A3C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#E8431F] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nuevo rol
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Roles
          </p>
          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.roles}
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
            Disponibles para usar
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Inactivos
          </p>
          <p className="font-fraunces mt-3 text-3xl font-black leading-none text-[#050505]">
            <RequestState
              status={summary.status}
              skeleton={null}
              error={<span className="text-[#E8431F]">_</span>}
            >
              {summary.data.inactive}
            </RequestState>
          </p>
          <p className="mt-3 text-sm font-medium text-[#8190B3]">
            Temporalmente pausados
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white px-5 py-5 shadow-sm ring-1 ring-black/[0.02]">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#8190B3]">
            Usuarios asignados
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
            Colaboradores vinculados
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <form
          onSubmit={filters.handleSubmit((values) => {
            setPage(1);

            roles.request(
              fetch.get("/roles", {
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
              Roles configurados
            </h2>
          </div>

          <div className="relative min-w-0 lg:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              placeholder="Buscar rol o descripción..."
              {...filters.register("search")}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#FF5A3C] focus:ring-2 focus:ring-[#FF5A3C]/30"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 px-5 py-3">
          {[
            { label: "Todos", status: "", assigned: "" },
            { label: "Activos", status: "active", assigned: "" },
            { label: "Inactivos", status: "inactive", assigned: "" },
            { label: "Con usuarios", status: "", assigned: "true" },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                filters.setValue("status", item.status);
                filters.setValue("assigned", item.assigned);
                setPage(1);

                roles.request(
                  fetch.get("/roles", {
                    query: {
                      search: filters.getValues("search"),
                      status: item.status,
                      assigned: item.assigned,
                      page: 1,
                      perPage: 4,
                    },
                  }),
                );
              }}
              className={`cursor-pointer whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                filters.watch("status") === item.status &&
                filters.watch("assigned") === item.assigned
                  ? "bg-[#11151C] text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-[#FF5A3C]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <RequestState
          status={roles.status}
          skeleton={null}
          error={
            <div className="p-5 text-sm font-semibold text-[#E8431F]">_</div>
          }
        >
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-bold">Rol</th>
                    <th className="px-5 py-3 font-bold">Descripción</th>
                    <th className="px-5 py-3 font-bold">Estado</th>
                    <th className="px-5 py-3 text-center font-bold">
                      Usuarios
                    </th>
                    <th className="px-5 py-3 text-center font-bold">
                      Permisos
                    </th>
                    <th className="px-5 py-3 font-bold">Páginas</th>
                    <th className="px-5 py-3 text-right font-bold">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {roles.data.data.map((role) => {
                    const enabledPermissions = Object.values(
                      role.permissions,
                    ).reduce((sum, list) => sum + list.length, 0);

                    const enabledPages = permissionPages
                      .filter((page) => role.permissions[page.href]?.length > 0)
                      .map((page) => page.label);

                    return (
                      <tr
                        key={role.id}
                        className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-[#11151C]">
                            {role.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            ID #{role.id}
                          </p>
                        </td>

                        <td className="max-w-[320px] px-5 py-4">
                          <p className="line-clamp-2 text-sm leading-5 text-slate-500">
                            {role.description}
                          </p>
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
                                inactive: {
                                  label: "Inactivo",
                                  background: "#F1F5F9",
                                  color: "#64748B",
                                },
                              },
                              role.status,
                            )}
                          />
                        </td>

                        <td className="px-5 py-4 text-center">
                          <p className="font-plex text-sm font-black text-[#11151C]">
                            {role.users}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <p className="font-plex text-sm font-black text-[#11151C]">
                            {enabledPermissions}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex max-w-[280px] flex-wrap gap-1.5">
                            {enabledPages.slice(0, 4).map((page) => (
                              <span
                                key={page}
                                className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500"
                              >
                                {page}
                              </span>
                            ))}

                            {enabledPages.length > 4 && (
                              <span className="rounded-full bg-[#FFF1ED] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#E8431F]">
                                +{enabledPages.length - 4}
                              </span>
                            )}

                            {enabledPages.length === 0 && (
                              <span className="text-xs font-semibold text-slate-400">
                                Sin páginas
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                openComponent("role-permissions", {
                                  data: {
                                    id: role.id,
                                  },
                                  onComplete: () => {
                                    roles.request(
                                      fetch.get("/roles", {
                                        query: {
                                          ...filters.getValues(),
                                          page,
                                          perPage: 4,
                                        },
                                      }),
                                    );
                                  },
                                })
                              }
                              className="cursor-pointer rounded-lg bg-[#11151C] px-3 py-2 text-xs font-bold text-white transition hover:bg-black"
                            >
                              Permisos
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openComponent("role-edit", {
                                  data: {
                                    id: role.id,
                                  },
                                  onComplete: () => {
                                    roles.request(
                                      fetch.get("/roles", {
                                        query: {
                                          ...filters.getValues(),
                                          page,
                                          perPage: 4,
                                        },
                                      }),
                                    );

                                    summary.request(
                                      fetch.get("/roles/summary"),
                                    );
                                  },
                                })
                              }
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openComponent("role-delete", {
                                  data: {
                                    id: role.id,
                                  },
                                  onComplete: () => {
                                    roles.request(
                                      fetch.get("/roles", {
                                        query: {
                                          ...filters.getValues(),
                                          page,
                                          perPage: 4,
                                        },
                                      }),
                                    );

                                    summary.request(
                                      fetch.get("/roles/summary"),
                                    );
                                  },
                                })
                              }
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 lg:hidden">
              {roles.data.data.map((role) => {
                const enabledPermissions = Object.values(
                  role.permissions,
                ).reduce((sum, list) => sum + list.length, 0);

                const enabledPages = permissionPages.filter(
                  (page) => role.permissions[page.href]?.length > 0,
                );

                return (
                  <div key={role.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#11151C]">
                          {role.name}
                        </p>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {role.description}
                        </p>
                      </div>

                      <Badge
                        badge={getBadge(
                          {
                            active: {
                              label: "Activo",
                              background: "#EAFBF2",
                              color: "#168F57",
                            },
                            inactive: {
                              label: "Inactivo",
                              background: "#F1F5F9",
                              color: "#64748B",
                            },
                          },
                          role.status,
                        )}
                        className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
                      <span>{role.users} usuarios</span>
                      <span>{enabledPermissions} permisos</span>
                      <span>{enabledPages.length} páginas</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openComponent("role-permissions", {
                            data: {
                              id: role.id,
                            },
                            onComplete: () => {
                              roles.request(
                                fetch.get("/roles", {
                                  query: {
                                    ...filters.getValues(),
                                    page,
                                    perPage: 4,
                                  },
                                }),
                              );
                            },
                          })
                        }
                        className="cursor-pointer rounded-xl bg-[#11151C] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-black"
                      >
                        Permisos
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openComponent("role-edit", {
                            data: {
                              id: role.id,
                            },
                            onComplete: () => {
                              roles.request(
                                fetch.get("/roles", {
                                  query: {
                                    ...filters.getValues(),
                                    page,
                                    perPage: 4,
                                  },
                                }),
                              );

                              summary.request(fetch.get("/roles/summary"));
                            },
                          })
                        }
                        className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#11151C] transition hover:border-[#FF5A3C]"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openComponent("role-delete", {
                            data: {
                              id: role.id,
                            },
                            onComplete: () => {
                              roles.request(
                                fetch.get("/roles", {
                                  query: {
                                    ...filters.getValues(),
                                    page,
                                    perPage: 4,
                                  },
                                }),
                              );

                              summary.request(fetch.get("/roles/summary"));
                            },
                          })
                        }
                        className="cursor-pointer rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-bold text-rose-500 transition hover:bg-rose-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {roles.data.data.length === 0 && (
              <div className="p-6 text-center text-sm font-medium text-slate-400">
                No se encontraron roles.
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <p className="text-xs font-medium text-slate-400">
                Página {roles.data.page} de {roles.data.totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => {
                    setPage(page - 1);

                    roles.request(
                      fetch.get("/roles", {
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
                  disabled={page === roles.data.totalPages}
                  onClick={() => {
                    setPage(page + 1);

                    roles.request(
                      fetch.get("/roles", {
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

function CreateRoleModal({ close, complete }: RegisteredComponentProps) {
  const save = useRequest<unknown>(null);

  const form = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: roleDefaultValues,
  });

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post("/roles", values)
      .then(() => {
        save.success(null);
        complete();
      })
      .catch(save.fail);
  });

  return (
    <Modal
      close={close}
      size="lg"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Nuevo
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Nuevo rol
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Completa los datos principales del rol.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A3C] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            <ShieldCheck className="h-4 w-4" />
            Registrar rol
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4">
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Nombre del rol
          </span>
          <input
            placeholder="Ej. Recepción"
            {...form.register("name")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Descripción
          </span>
          <textarea
            rows={4}
            placeholder="Describe qué hará este rol."
            {...form.register("description")}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Estado
          </span>
          <select
            {...form.register("status")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </label>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Nota
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Primero registra el rol. Luego abre el modal de permisos para
            definir las acciones por página.
          </p>
        </div>
      </form>
    </Modal>
  );
}

function EditRoleModal({
  close,
  complete,
  data,
}: RegisteredComponentProps<{ id?: string }>) {
  const save = useRequest<unknown>(null);
  const id = data?.id;

  const form = useForm<RoleValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: roleDefaultValues,
  });

  useEffect(() => {
    fetch.get(`/roles/${id}`).then((role: Role) =>
      form.reset({
        name: role.name,
        description: role.description,
        status: role.status,
      }),
    );
  }, [id]);

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post("/roles", {
        id,
        ...values,
      })
      .then(() => {
        save.success(null);
        complete();
      })
      .catch(save.fail);
  });

  return (
    <Modal
      close={close}
      size="lg"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Editar
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Editar rol
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Completa los datos principales del rol.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A3C] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            <ShieldCheck className="h-4 w-4" />
            Guardar cambios
          </button>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4">
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Nombre del rol
          </span>
          <input
            placeholder="Ej. Recepción"
            {...form.register("name")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Descripción
          </span>
          <textarea
            rows={4}
            placeholder="Describe qué hará este rol."
            {...form.register("description")}
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Estado
          </span>
          <select
            {...form.register("status")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </label>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Nota
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Primero registra el rol. Luego abre el modal de permisos para
            definir las acciones por página.
          </p>
        </div>
      </form>
    </Modal>
  );
}

function PermissionsModal({
  close,
  complete,
  data,
}: RegisteredComponentProps<{ id?: string }>) {
  const role = useRequest<Role | null>(null);
  const save = useRequest<unknown>(null);
  const [permissions, setPermissions] = useState<PermissionMap>({});
  const id = data?.id;

  useEffect(() => {
    role.start();

    fetch
      .get(`/roles/${id}`)
      .then((value: Role) => {
        role.success(value);
        setPermissions(value.permissions);
      })
      .catch(role.fail);
  }, [id]);

  return (
    <Modal
      close={close}
      size="xl"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Matriz de permisos
          </p>
          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            {role.data?.name ?? "Permisos"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Las páginas salen directamente del JSON del menú.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              save.start();

              fetch
                .post(`/roles/${id}/permissions`, { permissions })
                .then(() => {
                  save.success(null);
                  complete();
                })
                .catch(save.fail);
            }}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A3C] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            <ShieldCheck className="h-4 w-4" />
            Guardar permisos
          </button>
        </>
      }
    >
      <RequestState
        status={role.status}
        skeleton={null}
        error={
          <div className="p-5 text-sm font-semibold text-[#E8431F]">_</div>
        }
      >
        <div className="overflow-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="w-[280px] px-5 py-3 font-bold">Página</th>
                {actions.map((action) => (
                  <th
                    key={action.key}
                    className="px-3 py-3 text-center font-bold"
                  >
                    {action.label}
                  </th>
                ))}
                <th className="px-5 py-3 text-right font-bold">Todo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionPages.map((page) => {
                const pageActions = permissions[page.href] ?? [];
                const allChecked = actions.every((action) =>
                  pageActions.includes(action.key),
                );

                return (
                  <tr key={page.href}>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-[#11151C]">
                        {page.label}
                      </p>
                      <p className="text-xs text-slate-400">
                        {page.description}
                      </p>
                      <p className="mt-1 font-plex text-[10px] font-bold uppercase tracking-wide text-slate-300">
                        {page.href}
                      </p>
                    </td>

                    {actions.map((action) => {
                      const checked = pageActions.includes(action.key);

                      return (
                        <td key={action.key} className="px-3 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setPermissions((current) => {
                                const values = current[page.href] ?? [];

                                return {
                                  ...current,
                                  [page.href]: checked
                                    ? values.filter(
                                        (item) => item !== action.key,
                                      )
                                    : [...values, action.key],
                                };
                              });
                            }}
                            className={`mx-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border text-xs font-black transition ${
                              checked
                                ? "border-[#FF5A3C] bg-[#FF5A3C] text-white"
                                : "border-slate-200 bg-white text-transparent hover:border-[#FF5A3C]"
                            }`}
                          >
                            ✓
                          </button>
                        </td>
                      );
                    })}

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setPermissions((current) => ({
                            ...current,
                            [page.href]: allChecked
                              ? []
                              : actions.map((action) => action.key),
                          }));
                        }}
                        className={`cursor-pointer rounded-lg px-3 py-2 text-xs font-bold transition ${
                          allChecked
                            ? "bg-[#11151C] text-white"
                            : "border border-slate-200 bg-white text-slate-500 hover:border-[#FF5A3C]"
                        }`}
                      >
                        {allChecked ? "Quitar" : "Todo"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </RequestState>
    </Modal>
  );
}

function DeleteRoleModal({
  close,
  complete,
  data,
}: RegisteredComponentProps<{ id?: string }>) {
  const remove = useRequest<unknown>(null);
  const id = data?.id;

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
            Eliminar rol
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Esta acción quitará el rol del listado.
          </p>
        </div>
      }
      footer={
        <>
          <button
            type="button"
            onClick={close}
            className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              remove.start();

              fetch
                .delete(`/roles/${id}`)
                .then(() => {
                  remove.success(null);
                  complete();
                })
                .catch(remove.fail);
            }}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-600 active:scale-[0.98]"
          >
            <ShieldCheck className="h-4 w-4" />
            Sí, eliminar
          </button>
        </>
      }
    >
      <p className="text-sm leading-6 text-slate-500">
        ¿Seguro que deseas eliminar este rol? Revisa bien antes de continuar.
      </p>
    </Modal>
  );
}
