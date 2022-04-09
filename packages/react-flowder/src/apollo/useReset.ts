import { useApolloClient } from "@apollo/client";
import { useReset } from "@naporin0624/react-flowder";
import { useCallback } from "react";

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
