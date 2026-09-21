# Is Server

`isServer` is a constant boolean that indicates whether code is running in the server bundle.

## Import

```ts
import { isServer } from "solid-js/web";
```
## Type

```ts
const isServer: boolean;
```
## Behavior

- `isServer` is `true` in the server bundle and `false` in the browser bundle.
- Because it is exported as a constant, bundlers can eliminate unreachable branches.

## Examples

### Basic usage

```ts
import { isServer } from "solid-js/web";

if (isServer) {
	serverOnlyWork();
}
```
## Related

- [`DEV`](dev.md)
- [`isDev`](is-dev.md)
