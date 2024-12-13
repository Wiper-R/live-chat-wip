import axios from "axios";
import env from "../env";

const auth0Axios = axios.create({
  baseURL: env.ISSUER_BASE_URL,
  responseType: "json",
});

export default auth0Axios;
