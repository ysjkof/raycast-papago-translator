import { getPreferenceValues } from "@raycast/api";
import axios from "axios";

const BASE_URL = "https://openapi.naver.com/v1/papago";
const preferences = getPreferenceValues<Preferences>();

interface Preferences {
  clientId: string;
  clientSecret: string;
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-Naver-Client-Id": preferences.clientId,
    "X-Naver-Client-Secret": preferences.clientSecret,
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

export default axiosInstance;
