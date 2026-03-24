import { API_URL } from "@/config";

let baseURL = API_URL;

export const customClient = async <T>({
  url,
  method,
  params,
  data,
}: {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  params?: any;
  headers?: Record<string, string>;
  //@ts-ignore
  data?: BodyType<unknown>;

  responseType?: string;
}): Promise<T> => {
  const response = await fetch(
    `${baseURL}${url}${params ? "?" : ""}` + new URLSearchParams(params),
    {
      method,
      ...(data ? { body: JSON.stringify(data) } : {}),
      credentials: "include",
    },
  );
  if (!response.ok || response.status !== 200) {
    return undefined as T;
  }

  if (response.headers.get("Content-Type")?.includes("json")) {
    return response.json();
  }

  return response.text() as T;
};

export default customClient;
