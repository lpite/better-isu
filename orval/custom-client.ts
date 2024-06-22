const baseURL = '';


export const customClient = async <T>({
  url,
  method,
  params,
  data,
}: {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: any;
  //@ts-ignore
  data?: BodyType<unknown>;

  responseType?: string;
}): Promise<T> => {
  const response = await fetch(
    `${baseURL}${url}${params ? "?" : ""}` + new URLSearchParams(params),
    {
      method,
      ...(data ? { body: JSON.stringify(data) } : {}),
    },
  );
  if (response.headers.get("Content-Type")?.includes("json")) {

    return response.json();
  }

  return response.text() as T
};

 
export default customClient;

 

// In some case with react-query and swr you want to be able to override the return error type so you can also do it here like this

// export type ErrorType = {};

// In case you want to wrap the body type (optional)

// (if the custom instance is processing data before sending it, like changing the case for example)

// export type BodyType = {}