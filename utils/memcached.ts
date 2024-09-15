import { MemcacheClient } from "memcache-client";

type MemcacheKeys =
  | `grades:${string | number}.${string | number}`
  | "week_type"
  | `rating:${string | number}.${string | number}.${string | number}`
  | `schedule:${string}`;

export const cacheClient = new MemcacheClient({
  server: "localhost:11211",
});
type CacheSet = typeof MemcacheClient.prototype.set;
type CacheSetParams = Parameters<CacheSet>;

type CacheGet = typeof MemcacheClient.prototype.get;
type CacheGetParams = Parameters<CacheGet>;

// Тестовий варіант ключів для кешу...

interface Test {
  schedule: {
    groupId: string;
    course: string;
    semester: string;
  };
  test: {
    groupId: string;
    course: string;
    semester: string;
  };
}

export const cache = {
  set: <T extends keyof Test>(
    k: Test[T] & { key: T },
    v: CacheSetParams[1],
    o: CacheSetParams[2],
    cb: CacheSetParams[3],
  ) => {
    const key = createKeyFromObj(k);

    return cacheClient.set(key, v, o, cb);
  },
  get: async <T extends keyof Test>(
    k: Test[T] & { key: T },
    o?: CacheGetParams[1],
    cb?: CacheGetParams[2],
  ) => {
    const key = createKeyFromObj(k);

    return cacheClient
      .get(key, o, cb)
      .then((res) => res?.value.toString())
      .catch((err) => {
        console.error(err);
        return undefined;
      });
  },
};

function createKeyFromObj(obj: Record<string, any>) {
  // Напевно сортування ключів потрібне, але я не впевнений...
  // логіка в тому щоб незалежно в якому передати ключі вони були завжди в однаковому порядку

  return `${obj.key}:${Object.entries(obj)
    .filter((el) => el[0] !== "key")
    .sort((a, b) => {
      const k1 = a[0];
      const k2 = b[0];
      if (k1 > k2) {
        return 1;
      }
      if (k1 < k2) {
        return -1;
      }
      return 0;
    })
    .map((el) => el[1])
    .join(".")}`;
}
