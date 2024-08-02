import { MemcacheClient } from "memcache-client";

export const cacheClient = new MemcacheClient({
  server: "localhost:11211",
});
