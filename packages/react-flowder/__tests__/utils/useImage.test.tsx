import { cleanup, renderHook } from "@testing-library/react-hooks";
import React, { FC, ReactNode } from "react";

import { Provider } from "../../src";
import { useImage } from "../../src/utils";

const images = {
  small: "http://placekitten.com/g/500/500",
  medium: "http://placekitten.com/g/1000/1000",
  large: "http://placekitten.com/g/2000/2000",
};

describe("useImage test", () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
  const wrapper: FC<{ children?: ReactNode | null }> = ({ children }) => <Provider>{children}</Provider>;

  test("load image", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useImage(images.small), { wrapper });
    await waitForNextUpdate();

    const [img, reset] = result.current;
    expect(img.src).toEqual(images.small);
    expect(() => reset()).not.toThrow();
  });

  test("load some image", async () => {
    const { result, waitForNextUpdate, waitFor } = renderHook(() => useImage([images.small, images.medium, images.large]), { wrapper });
    await waitForNextUpdate();
    await waitFor(() => result.current[0].src === images.small);
    await waitFor(() => result.current[0].src === images.medium);
    await waitFor(() => result.current[0].src === images.large);
  });
});
