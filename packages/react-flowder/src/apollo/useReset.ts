import { useApolloClient } from "@apollo/client";
import { useCallback } from "react";
import { useReset } from "react-flowder";

import { datasources } from "./cache";

export const useApolloReset = () => {
  const client = useApolloClient();
  const reset = useReset();

  const resetAll = useCallback(async () => {
    await client.resetStore();
    datasources.forEach((datasource) => {
      reset(datasource);
    });
  }, [client, reset]);

  return resetAll;
};
