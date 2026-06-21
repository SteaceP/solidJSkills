`app.config.ts` is the app configuration entrypoint.

## Import

```tsx
import { defineConfig } from "@solidjs/start/config";
```

## Type

```tsx
export default defineConfig(baseConfig);
```

## Parameters

`app.config.ts` passes its configuration object to [`defineConfig`](/solid-start/reference/config/define-config).

## Return value

The default export is the value returned by [`defineConfig`](/solid-start/reference/config/define-config).

## Behavior

- The config entry uses `@solidjs/start/config`.
- This file is read as the app configuration file.

## Examples

### Basic usage

```tsx
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({});
```

## Related

- [`defineConfig`](/solid-start/reference/config/define-config)
