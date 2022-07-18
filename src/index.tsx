import { Action, ActionPanel, Icon, List, showToast, Toast } from "@raycast/api";
import { AxiosError } from "axios";
import { useState, useEffect } from "react";
import { LocalStorage } from "@raycast/api";
import { detectLangs, translateTerm } from "./model";

export interface Error extends AxiosError {
  title: string;
}
export interface Storage {
  [key: string]: string;
}

function Command() {
  const [error, setError] = useState<Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [languageCode, setLanguageCode] = useState("");
  const [storage, setStorage] = useState<Storage>({});

  const loadItems = async () => {
    const items = await LocalStorage.allItems();
    setStorage(items);
  };
  const findLocalStorageItem = (query: string) => storage[query];

  const rearrangeStorage = (query: string, rearrangeItem: string) => {
    setStorage((prevState) => {
      delete prevState[query];
      return { [query]: rearrangeItem, ...prevState };
    });
    return setIsLoading(false);
  };

  const removeHistoryItem = (key: string) => {
    LocalStorage.removeItem(key);
    setStorage((prevState) => {
      delete prevState[key];
      return { ...prevState };
    });
  };

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (query === "") return;
    const trimQuery = query.trim();

    setIsLoading(true);
    const existItem = findLocalStorageItem(trimQuery);
    if (existItem) {
      rearrangeStorage(trimQuery, existItem);
    }

    setLanguageCode("");
    detectLangs({ query, setLanguageCode, setIsLoading, setError });
  }, [query]);

  useEffect(() => {
    if (!languageCode) return;

    setIsLoading(true);
    translateTerm({ query: query.trim(), languageCode, setStorage, setIsLoading, setError });
  }, [languageCode]);

  useEffect(() => {
    if (error) {
      showToast({
        style: Toast.Style.Failure,
        title: error.title,
        message: error.message,
      });
    }
  }, [error]);

  return (
    <List
      searchBarPlaceholder="번역할 단어나 문장을 입력하세요"
      onSearchTextChange={setQuery}
      isLoading={isLoading}
      throttle
      isShowingDetail
    >
      {Object.entries(storage).map(([key, value], idx) => (
        <List.Item
          key={idx}
          title={key}
          detail={<List.Item.Detail markdown={value} />}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard title="Copy" content={value} />
              <Action.OpenInBrowser title="Open in Browser" url={`https://papago.naver.com/?&st=${query.trim()}`} />
              <Action
                icon={{ source: Icon.Trash }}
                title="Remove This History"
                onAction={() => removeHistoryItem(key)}
                shortcut={{ modifiers: ["ctrl"], key: "x" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

export default Command;
