import { useEffect, useState } from "react";
import { getErrorMessage } from "../api/client";

// Calls loadFn() when the page opens, and again whenever `key` changes
// (for example, a new filter or a new id in the URL).
// Returns { data, error, loading }.
export default function useApiData(loadFn, key) {
  const [result, setResult] = useState({ key: null, data: null, error: "" });

  useEffect(() => {
    let ignore = false; // stops an older, slower request from overwriting a newer one

    loadFn()
      .then((data) => {
        if (!ignore) setResult({ key, data, error: "" });
      })
      .catch((err) => {
        if (!ignore) setResult({ key, data: null, error: getErrorMessage(err) });
      });

    return () => {
      ignore = true;
    };
    // We only want to reload when `key` changes, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Still loading if the saved result is for a different key than the current one
  const loading = result.key !== key;
  return { data: result.data, error: result.error, loading };
}