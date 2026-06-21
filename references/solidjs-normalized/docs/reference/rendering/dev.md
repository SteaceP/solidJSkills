# Dev

`DEV` is a development-only export from `solid-js`.
It exposes Solid's development hooks and internals for development tooling and diagnostics.

## Import

```ts
import { DEV } from "solid-js";
```
## Type

```ts
const DEV:
	| {
			readonly hooks: {
				afterUpdate: (() => void) | null;
				afterCreateOwner: ((owner: unknown) => void) | null;
				afterCreateSignal: ((signal: unknown) => void) | null;
				afterRegisterGraph: ((sourceMapValue: unknown) => void) | null;
			};
			readonly writeSignal: (...args: unknown[]) => unknown;
			readonly registerGraph: (...args: unknown[]) => unknown;
	  }
	| undefined;
```
## Value

- **Type:** development-only object or `undefined`

## Behavior

- In the development browser bundle, `DEV` is defined and exposes development hooks and internals.
- In production and server bundles, `DEV` is `undefined`.
- `DEV` is intended for tooling, diagnostics, and library code that needs development-only behavior.

## Examples

### Basic usage

```ts
import { DEV } from "solid-js";

if (DEV) {
	console.warn("development-only check");
}
```
## Related

- [`isDev`](is-dev.md)
- [`isServer`](is-server.md)
