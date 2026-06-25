import { api } from "~/lib/api";

export function swrFetcher<T>(url: string): Promise<T> {
  return api.get<T>(url);
}
