import { api } from "~/lib/api";

export function swrFetcher<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  return api.get<T>(path, { params });
}
