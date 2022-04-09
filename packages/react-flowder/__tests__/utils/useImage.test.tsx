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
  beforeEach(() => {
    const imageElement = document.createElement("img");

    jest.spyOn(document, "createElement").mockImplementation(() => {
      setTimeout(() => {
        imageElement.dispatchEvent(new Event("load"));
      }, 1000);

      return imageElement;
    });
  });
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });
  const wrapper: FC<{ children?: ReactNode | null }> = ({ children }) => <Provider>{children}</Provider>;

  test("load image", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useImage(images.small), { wrapper });
    await waitForNextUpdate();
    expect(result.current[0].src).toEqual(images.small);
  });
});
