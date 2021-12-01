# `cache-manager`

A simple function memoization management library.

## Usage

```typescript
import { createCacheManager, parser } from "@naporin0624/cache-manager";

let keyCount = 0;
const buildKey = (a: number, b: string) => {
  return `buildKey__${++keyCount}_${a}_${b}`;
}
const config = parser({
  buildKey,
  noCache: [() => `noCache__${++keyCount}`, { maxAge: 1 }] as const,
  noClear: [() => `noClear__${++keyCount}`, { maxAge: -1 }] as const,
});

const cacheManager = createCacheManager(config);

buildKey(1, "1") === buildKey(1, "1") // false
cacheManager.buildKey(1, "1") === cacheManager.buildKey(1, "1") // true

const a = cacheManager.noCache()
// after 1ms
a === cacheManager.noCache() // false

const b = cacheManager.noClear();
// Long time passed.
b === cacheManager.noClear() // true 
```
