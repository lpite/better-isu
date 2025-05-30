export let API_URL = "";

if (process.env.NODE_ENV === "development") {
  API_URL = "https://4fw4nhik6tvkvjbnbvrqxcwpoe0jqhlp.lambda-url.eu-central-1.on.aws";
}
