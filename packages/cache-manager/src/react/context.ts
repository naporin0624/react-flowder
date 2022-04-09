/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext } from "react";

import type { CacheManager } from "../core";

export const Context = createContext<CacheManager<any> | null>(null);
