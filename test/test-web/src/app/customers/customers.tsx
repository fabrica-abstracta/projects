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
  searchCustomersQuerySchema,
  upsertCustomerBodySchema,
  getCustomerParamsSchema,
  deleteCustomerParamsSchema,
} from "../validators";

type CustomerSearchItem = {
  id: string;
  user?: string | { id: string; [key: string]: unknown };
  slug?: string;
  document?: string;
  number?: string;
  names?: string;
  phone?: string;
  email?: string;
  schedule?: { monday?: { isOpen?: boolean; start?: string; end?: string }; tuesday?: { isOpen?: boolean; start?: string; end?: string }; wednesday?: { isOpen?: boolean; start?: string; end?: string }; thursday?: { isOpen?: boolean; start?: string; end?: string }; friday?: { isOpen?: boolean; start?: string; end?: string }; saturday?: { isOpen?: boolean; start?: string; end?: string }; sunday?: { isOpen?: boolean; start?: string; end?: string } };
  closedDates?: Record<string, string>;
  created?: string;
  updated?: string;
};

type SearchCustomersResponse = {
  data: CustomerSearchItem[];
  pagination: Pagination;
};

type UpsertCustomerModalData = {
  id?: z.infer<typeof getCustomerParamsSchema>["id"];
};

type DeleteCustomerModalData = {
  id?: z.infer<typeof deleteCustomerParamsSchema>["id"];
};

const initialCustomersResponse: SearchCustomersResponse = {
  data: [],
  pagination: initialPagination,
};

export function Customers() {
  const { registerComponent, openComponent } = useComponent();
  const customersRequest = useRequest<SearchCustomersResponse>(initialCustomersResponse);

  const searchCustomers = (
    query: z.output<typeof searchCustomersQuerySchema> = { page: 1, perPage: 10 },
  ) =>
    customersRequest.request(
      fetch.get("/customers", {
        query: {
          page: query.page,
          perPage: query.perPage,
          user: query.user,
          slug: query.slug,
          document: query.document,
          number: query.number,
          names: query.names,
          phone: query.phone,
          email: query.email,
        },
      }),
    );

  useEffect(() => {
    registerComponent("upsertCustomer", UpsertCustomerModal);
    registerComponent("deleteCustomer", DeleteCustomerModal);
    void searchCustomers();
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => openComponent("upsertCustomer")}
      >
        Nuevo Customer
      </button>
      <pre>{JSON.stringify(customersRequest.data, null, 2)}</pre>
    </div>
  );
}

export function UpsertCustomerModal({
  data,
}: RegisteredComponentProps<UpsertCustomerModalData>) {
  const getCustomerRequest = useRequest<z.output<typeof upsertCustomerBodySchema> | null>(null);
  const upsertCustomerRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof upsertCustomerBodySchema>,
    unknown,
    z.output<typeof upsertCustomerBodySchema>
  >({
    resolver: zodResolver(upsertCustomerBodySchema),
    mode: "onChange",
    defaultValues: {
      id: data?.id,
    },
  });

  const getCustomer = (id: z.infer<typeof getCustomerParamsSchema>["id"]) =>
    getCustomerRequest.request(fetch.get(`/customers/${id}`));

  const upsertCustomer = (body: z.output<typeof upsertCustomerBodySchema>) =>
    upsertCustomerRequest.request(fetch.post("/customers", body));

  useEffect(() => {
    if (!data?.id) return;
    void getCustomer(data.id);
  }, [data?.id]);

  useEffect(() => {
    if (!getCustomerRequest.data) return;
    form.reset(getCustomerRequest.data);
  }, [getCustomerRequest.data, form]);

  return (
    <div>
    <form onSubmit={form.handleSubmit(upsertCustomer)}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Guardar Customer
      </button>
    </form>
    </div>
  );
}

export function DeleteCustomerModal({
  data,
}: RegisteredComponentProps<DeleteCustomerModalData>) {
  const deleteCustomerRequest = useRequest<ApiMessage | null>(null);
  const form = useForm<
    z.input<typeof deleteCustomerParamsSchema>,
    unknown,
    z.output<typeof deleteCustomerParamsSchema>
  >({
    resolver: zodResolver(deleteCustomerParamsSchema),
    mode: "onChange",
    defaultValues: {
      id: data!.id,
    },
  });

  const deleteCustomer = (id: z.infer<typeof deleteCustomerParamsSchema>["id"]) =>
    deleteCustomerRequest.request(fetch.delete(`/customers/${id}`));

  return (
    <div>
    <form onSubmit={form.handleSubmit((body) => deleteCustomer(body.id))}>
      <input type="hidden" {...form.register("id")} />
      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        Eliminar Customer
      </button>
    </form>
    </div>
  );
}
