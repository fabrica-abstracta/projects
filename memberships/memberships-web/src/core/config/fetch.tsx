// Start Fetch

type ResponseType = "json" | "text" | "blob" | "raw";

type FetchOptions = {
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  response?: ResponseType;
};

const buildUrl = (path: string, query?: FetchOptions["query"]) => {
  const params = new URLSearchParams();

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  return `${import.meta.env.VITE_API_URL}${path}${params.toString() ? `?${params.toString()}` : ""}`;
};

const parseResponse = async (
  response: Response,
  type: ResponseType = "json",
) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw error;
  }

  if (type === "raw") return response;
  if (type === "text") return response.text();
  if (type === "blob") return response.blob();

  return response.json();
};

const request = async (
  method: string,
  path: string,
  body?: unknown,
  options: FetchOptions = {},
) => {
  const isFormData = body instanceof FormData;

  const response = await globalThis.fetch(buildUrl(path, options.query), {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  return parseResponse(response, options.response);
};

export const fetch = {
  get: (path: string, options?: FetchOptions) =>
    request("GET", path, undefined, options),

  post: (path: string, body?: unknown, options?: FetchOptions) =>
    request("POST", path, body, options),

  put: (path: string, body?: unknown, options?: FetchOptions) =>
    request("PUT", path, body, options),

  patch: (path: string, body?: unknown, options?: FetchOptions) =>
    request("PATCH", path, body, options),

  delete: (path: string, options?: FetchOptions) =>
    request("DELETE", path, undefined, options),
};

// End Fetch

// Start Hook Request

import { useState } from "react";
import { Toaster, toast } from "sonner";

export type Status = "idle" | "loading" | "success" | "error";

type Options = {
  toastError?: boolean;
};

const getMessage = (error: unknown) => {
  const value = error as {
    message?: string;
    error?: string;
    data?: { message?: string };
    response?: { message?: string };
  };

  return (
    value?.message ||
    value?.response?.message ||
    value?.data?.message ||
    value?.error ||
    "Ocurrió un error inesperado."
  );
};

export const RequestToaster = () => <Toaster richColors position="top-right" />;

export const useRequest = <T = unknown,>(
  initialData: T,
  options: Options = {},
) => {
  const [data, setData] = useState<T>(initialData);
  const [error, setError] = useState<unknown>(null);
  const [status, setStatus] = useState<Status>("idle");

  const start = () => {
    setStatus("loading");
    setError(null);
  };

  const success = (value?: T) => {
    if (value !== undefined) setData(value);
    setStatus("success");
  };

  const fail = (error: unknown) => {
    setError(error);
    setStatus("error");

    if (options.toastError !== false) {
      toast.error(getMessage(error));
    }
  };

  const request = (promise: Promise<T>) => {
    start();

    return promise.then(success).catch(fail);
  };

  const reset = () => {
    setData(initialData);
    setError(null);
    setStatus("idle");
  };

  return {
    data,
    error,
    status,

    setData,
    setError,
    setStatus,

    start,
    success,
    fail,
    request,
    reset,
  };
};

// End Hook Request
