import { useEffect } from "react";
import {
  Banknote,
  CalendarDays,
  Check,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { RequestState } from "../../core/components";
import { fetch, useRequest } from "../../core/config/fetch";
import { Modal } from "../../core/components/index";
import {
  useComponent,
  type RegisteredComponentProps,
} from "../../core/context/component";

type Plan = {
  id: string;
  name: string;
  duration: number;
  price: number;
  currency: string;
  active: number;
  benefits: string[];
};

const planSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  duration: z.number().min(1, "La duración debe ser mayor a 0"),
  price: z.number().min(0, "El precio no puede ser negativo"),
  currency: z.string().trim().min(1, "La moneda es requerida"),
  benefits: z.string().trim().min(1, "Los beneficios son requeridos"),
});

const planDefaultValues = {
  name: "",
  duration: 30,
  price: 0,
  currency: "PEN",
  benefits: "",
};

type PlanValues = z.infer<typeof planSchema>;

export function Plans() {
  const { registerComponent, openComponent } = useComponent();
  const plans = useRequest<Plan[]>([]);

  const reload = () => {
    plans.request(fetch.get("/plans"));
  };

  useEffect(() => {
    registerComponent("plan-create", PlanCreateModal);
    registerComponent("plan-edit", PlanEditModal);
    registerComponent("plan-delete", PlanDeleteModal);

    reload();
  }, [registerComponent]);

  return (
    <main className="flex-1 bg-[#EEF1EF] p-5 text-[#11151C] md:p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="font-plex text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Catálogo
          </p>

          <h1 className="font-fraunces -mt-0.5 text-2xl font-extrabold tracking-tight text-[#11151C] md:text-3xl">
            Planes de membresía
          </h1>

          <p className="mt-1 text-sm font-medium text-slate-500">
            Actualmente tienes{" "}
            <span className="font-bold text-[#11151C]">
              <RequestState
                status={plans.status}
                skeleton={null}
                error={<span className="text-[#E8431F]">_</span>}
              >
                {plans.data.length}
              </RequestState>
            </span>{" "}
            {plans.data.length === 1 ? "plan registrado" : "planes registrados"}
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            openComponent("plan-create", {
              onComplete: reload,
            })
          }
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[#FF5A3C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo plan</span>
        </button>
      </div>

      <RequestState
        status={plans.status}
        skeleton={null}
        error={
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-[#E8431F]">
            _
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.data.map((plan) => (
            <div
              key={plan.id}
              className="relative flex flex-col rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <p className="font-plex text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  {plan.duration} días
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      openComponent("plan-edit", {
                        data: { id: plan.id },
                        onComplete: reload,
                      })
                    }
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#11151C]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openComponent("plan-delete", {
                        data: { id: plan.id },
                        onComplete: reload,
                      })
                    }
                    className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-fraunces mt-2 text-lg font-bold text-[#11151C]">
                {plan.name}
              </h3>

              <p className="font-fraunces mt-2 text-3xl font-black tabular-nums text-[#11151C]">
                {plan.currency === "PEN" ? "S/ " : "$ "}
                {plan.price}
              </p>

              <p className="-mt-1 mb-4 text-xs text-slate-400">
                pago único por {plan.duration} días
              </p>

              <ul className="flex-1 space-y-2.5">
                {plan.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1FAE6B]" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-400">
                  {plan.active}{" "}
                  {plan.active === 1 ? "miembro vigente" : "miembros vigentes"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </RequestState>
    </main>
  );
}

function PlanCreateModal({ close, complete }: RegisteredComponentProps) {
  const save = useRequest<unknown>(null);

  const form = useForm<PlanValues>({
    resolver: zodResolver(planSchema),
    defaultValues: planDefaultValues,
  });

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post("/plans", {
        name: values.name,
        duration: values.duration,
        price: values.price,
        currency: values.currency,
        benefits: values.benefits
          .split("\n")
          .map((benefit) => benefit.trim())
          .filter(Boolean),
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
      size="xl"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Crear
          </p>

          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Nuevo plan
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Completa los datos principales del plan.
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
            onClick={submit}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF5A3C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            Crear plan
          </button>
        </>
      }
    >
      <form onSubmit={submit}>
        <PlanFormFields form={form} />
      </form>
    </Modal>
  );
}

function PlanEditModal({ data, close, complete }: RegisteredComponentProps) {
  const id = (data as { id?: string } | undefined)?.id;
  const save = useRequest<unknown>(null);

  const form = useForm<PlanValues>({
    resolver: zodResolver(planSchema),
    defaultValues: planDefaultValues,
  });

  useEffect(() => {
    if (id) {
      fetch.get(`/plans/${id}`).then((plan: Plan) =>
        form.reset({
          name: plan.name,
          duration: plan.duration,
          price: plan.price,
          currency: plan.currency,
          benefits: plan.benefits.join("\n"),
        }),
      );
    }
  }, [id]);

  const submit = form.handleSubmit((values) => {
    save.start();

    fetch
      .post("/plans", {
        id,
        name: values.name,
        duration: values.duration,
        price: values.price,
        currency: values.currency,
        benefits: values.benefits
          .split("\n")
          .map((benefit) => benefit.trim())
          .filter(Boolean),
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
      size="xl"
      header={
        <div>
          <p className="font-plex text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF5A3C]">
            Editar
          </p>

          <h2 className="font-fraunces mt-1 text-2xl font-extrabold tracking-tight text-[#11151C]">
            Editar plan
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Completa los datos principales del plan.
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
            onClick={submit}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#FF5A3C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#E8431F] active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            Guardar cambios
          </button>
        </>
      }
    >
      <form onSubmit={submit}>
        <PlanFormFields form={form} />
      </form>
    </Modal>
  );
}

function PlanDeleteModal({ data, close, complete }: RegisteredComponentProps) {
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
            Eliminar plan
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Esta acción quitará el plan del catálogo.
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
                .delete(`/plans/${id}`)
                .then(() => {
                  remove.success(null);
                  complete();
                })
                .catch(remove.fail);
            }}
            className="cursor-pointer rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-600 active:scale-[0.98]"
          >
            Sí, eliminar
          </button>
        </>
      }
    >
      <p className="text-sm leading-6 text-slate-500">
        ¿Seguro que deseas eliminar este plan? Revisa bien antes de continuar.
      </p>
    </Modal>
  );
}

function PlanFormFields({
  form,
}: {
  form: ReturnType<typeof useForm<PlanValues>>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="md:col-span-2">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Nombre del plan
        </span>

        <input
          placeholder="Ej. Plan Mensual"
          {...form.register("name")}
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
        />

        {form.formState.errors.name && (
          <p className="mt-1 text-xs font-medium text-rose-500">
            {form.formState.errors.name.message}
          </p>
        )}
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Duración
        </span>

        <div className="relative">
          <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="number"
            placeholder="30"
            {...form.register("duration", { valueAsNumber: true })}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />
        </div>

        {form.formState.errors.duration && (
          <p className="mt-1 text-xs font-medium text-rose-500">
            {form.formState.errors.duration.message}
          </p>
        )}
      </label>

      <label>
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Precio
        </span>

        <div className="relative">
          <Banknote className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="number"
            placeholder="120"
            {...form.register("price", { valueAsNumber: true })}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
          />
        </div>

        {form.formState.errors.price && (
          <p className="mt-1 text-xs font-medium text-rose-500">
            {form.formState.errors.price.message}
          </p>
        )}
      </label>

      <label className="md:col-span-2">
        <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Beneficios
        </span>

        <textarea
          rows={5}
          placeholder={
            "Acceso a sala de pesas\nClases grupales\nCasillero personal"
          }
          {...form.register("benefits")}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#FF5A3C] focus:ring-4 focus:ring-[#FF5A3C]/10"
        />

        {form.formState.errors.benefits && (
          <p className="mt-1 text-xs font-medium text-rose-500">
            {form.formState.errors.benefits.message}
          </p>
        )}

        <p className="mt-1.5 text-xs text-slate-400">
          Escribe un beneficio por línea.
        </p>
      </label>
    </div>
  );
}
