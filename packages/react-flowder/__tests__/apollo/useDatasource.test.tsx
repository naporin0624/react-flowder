import { gql } from "@apollo/client";
import { MockedProvider } from "@apollo/client/testing";
import { renderHook } from "@testing-library/react-hooks";
import React, { FC, ReactNode } from "react";

import { Provider } from "../../src";
import { useDatasource, useSyncQuery } from "../../src/apollo/useQuery";

describe("useSyncQuery test", () => {
  const GET_USERS = gql`
    query getUsers {
      users {
        id
        name
      }
    }
  `;
  const ERROR = gql`
    query getUsers {
      errors {
        id
        name
      }
    }
  `;
  const usersMock = {
    request: {
      query: GET_USERS,
    },
    result: {
      data: {
        users: [
          { id: 1, name: "napo1" },
          { id: 2, name: "napo2" },
        ],
      },
    },
  };

  const errorMock = {
    request: {
      query: ERROR,
      variables: { name: "error" },
    },
    error: new Error(""),
  };

  const wrapper: FC<{ children?: ReactNode | undefined }> = ({ children }) => {
    return (
      <MockedProvider mocks={[usersMock, errorMock]} addTypename={false}>
        <Provider>{children}</Provider>
      </MockedProvider>
    );
  };

  test("testing useDatasource", () => {
    const { result } = renderHook(() => useDatasource(GET_USERS), { wrapper });
    expect(() => result.current({})).not.toThrow();
    expect(() => result.current({ pollInterval: 100 })).not.toThrow();
  });

  test("testing success useSyncQuery", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSyncQuery(GET_USERS), { wrapper });
    await waitForNextUpdate();
    expect(result.current).toEqual(usersMock.result.data);
  });

  test("testing error useSyncQuery", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSyncQuery(ERROR, { variables: { name: "error" } }), { wrapper });
    await waitForNextUpdate();
    expect(result.error).toEqual(errorMock.error);
  });
});
