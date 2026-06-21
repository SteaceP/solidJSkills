# Is Dev

`isDev` is a constant boolean exported by `solid-js/web`.

## Import

```ts
import { isDev } from "solid-js/web";
```
## Type

```ts
const isDev: boolean;
```
## Behavior

- `isDev` is a bundle constant: it is `true` in the development browser bundle and `false` in production and server bundles. [`DEV`](dev.md) is a separate development-only export from `solid-js`.
- Because it is exported as a constant, bundlers can eliminate unreachable branches.

## Examples

### Basic usage

```ts
import { isDev } from "solid-js/web";

if (isDev) {
	debugPanel.mount();
}
```
## Related

- [`DEV`](dev.md)
- [`isServer`](is-server.md)
