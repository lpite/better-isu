export let API_URL = "";

if (process.env.NODE_ENV === "development") {
  API_URL = "http://localhost:3001";
}
