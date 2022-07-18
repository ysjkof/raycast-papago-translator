import { LocalStorage } from "@raycast/api";
import QueryString from "qs";
import axiosInstance from "./fetcher";
import { Error, Storage } from ".";
import { ERROR_CODE } from "./errorCode";

const LANGUAGE_DETECT_ENDPOINT = "/detectLangs";
const TRANSLATE_ENDPOINT = "/n2mt";

interface DetectLangs {
  query: string;
  setLanguageCode: React.Dispatch<React.SetStateAction<string>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<Error | undefined>>;
}

interface TranslateTerm {
  query: string;
  languageCode: string;
  setStorage: React.Dispatch<React.SetStateAction<Storage>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<Error | undefined>>;
}

export const detectLangs = async ({ query, setLanguageCode, setIsLoading, setError }: DetectLangs) => {
  await axiosInstance
    .post(LANGUAGE_DETECT_ENDPOINT, QueryString.stringify({ query }))
    .then((response) => {
      if (response.data.langCode) setLanguageCode(response.data.langCode);
      setIsLoading(false);
    })
    .catch((errors) => {
      setError({
        ...errors,
        title: ERROR_CODE[errors.response.status as keyof typeof ERROR_CODE] || "지원하지 않는 언어입니다",
      });
      setIsLoading(false);
    });
};

export const translateTerm = async ({ query, languageCode, setStorage, setIsLoading, setError }: TranslateTerm) => {
  await axiosInstance
    .post(
      TRANSLATE_ENDPOINT,
      QueryString.stringify({
        text: query,
        source: languageCode,
        target: languageCode === "en" ? "ko" : "en",
      })
    )
    .then((response) => {
      LocalStorage.setItem(query, response.data.message.result.translatedText);
      setStorage((prevState) => ({ [query]: response.data.message.result.translatedText, ...prevState }));
      setIsLoading(false);
    })
    .catch((errors) => {
      setError({
        ...errors,
        title: ERROR_CODE[errors.response.status as keyof typeof ERROR_CODE] || "번역하는 중에 문제가 발생했습니다",
      });
      setIsLoading(false);
    });
};
