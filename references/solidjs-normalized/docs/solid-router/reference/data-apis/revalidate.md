# Revalidate

`revalidate` retriggers [`query`](query.md) cache entries inside a transition.

## Import

```tsx
import { revalidate } from "@solidjs/router";
```
## Type

```tsx
function revalidate(
	key?: string | string[] | void,
	force?: boolean
): Promise<void>;
```
## Parameters

### `key`

- **Type:** `string | string[] | void`
- **Required:** No

Cache key or keys from a query function's [`key`](query.md#key) or [`keyFor`](query.md#keyfor) property.

### `force`

- **Type:** `boolean`
- **Default:** `true`
- **Required:** No

When `true`, matching cache entries are marked as cache misses before subscribers are retriggered.
When `false`, subscribers are retriggered without changing cache entry timestamps.

## Return value

- **Type:** `Promise<void>`

Resolves when the revalidation transition completes.

## Behavior

- Runs inside [`startTransition`](../../../reference/reactive-utilities/start-transition.md).
- When `key` is undefined, every cache entry matches.
- A string or array `key` matches cache entries by key prefix. [`query.key`](query.md#key) targets every cached argument set for that query; [`query.keyFor(...)`](query.md#keyfor) targets one serialized argument list.
- Matching cache entries update their live signal with the current timestamp, retriggering active cache reads through primitives such as [`createAsync`](create-async.md).
- Without active subscribers, `revalidate` does not call the query function.

## Examples

### Basic usage

```tsx
import { For } from "solid-js";
import { createAsync, query, revalidate } from "@solidjs/router";

const getTodos = query(async () => {
	const response = await fetch("/api/todos");
	return response.json() as Promise<{ id: string; title: string }[]>;
}, "todos");

function Todos() {
	const todos = createAsync(() => getTodos(), { initialValue: [] });

	function refreshTodos() {
		void revalidate(getTodos.key);
	}

	return (
		<>
			<button onClick={refreshTodos}>Refresh todos</button>
			<ul>
				<For each={todos()}>{(todo) => <li>{todo.title}</li>}</For>
			</ul>
		</>
	);
}
```
### Revalidate a query argument

```tsx
import { createAsync, query, revalidate } from "@solidjs/router";

const getProjectTasks = query(async (projectId: string) => {
	const response = await fetch(`/api/projects/${projectId}/tasks`);
	return response.json() as Promise<{ id: string; title: string }[]>;
}, "projectTasks");

function ProjectTasks(props: { projectId: string }) {
	const tasks = createAsync(() => getProjectTasks(props.projectId), {
		initialValue: [],
	});

	function refreshProjectTasks() {
		void revalidate(getProjectTasks.keyFor(props.projectId));
	}

	return (
		<>
			<button onClick={refreshProjectTasks}>Refresh project tasks</button>
			<div>{tasks().length} tasks</div>
		</>
	);
}
```
## Related

- [`query`](query.md)
- [`createAsync`](create-async.md)
- [`reload`](../response-helpers/reload.md)
