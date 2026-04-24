export const LINE_STAMP_STORE_VISITED_STORAGE_KEY =
  "nazotype:line-stamp-store-visited:v1";

export const LINE_STAMP_STORE_VISITED_EVENT =
  "nazotype:line-stamp-store-visited";

export function hasVisitedLineStampStore() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(LINE_STAMP_STORE_VISITED_STORAGE_KEY) === "1"
    );
  } catch {
    return false;
  }
}

export function markLineStampStoreVisited() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LINE_STAMP_STORE_VISITED_STORAGE_KEY, "1");
  } catch {
    // localStorage が使えない環境では無視
  }

  window.dispatchEvent(new Event(LINE_STAMP_STORE_VISITED_EVENT));
}
