export let API_URL = "";

if (process.env.NODE_ENV === "development") {
  API_URL = "https://444jm7vuswlze34rhplvied5ky0bpwlv.lambda-url.eu-central-1.on.aws";
}
