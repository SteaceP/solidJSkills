# SolidJS Head & Meta Management Guide (`@solidjs/meta`)

This guide documents the setup, dynamic tags, and SSR streaming extraction patterns using `@solidjs/meta`.

---

## 1. Installation & Provider Setup

Wrap your application root (or layout) with `<MetaProvider>`:

```tsx
import { MetaProvider, Title, Meta, Link } from "@solidjs/meta";

export default function App(props) {
  return (
    <MetaProvider>
      <Title>My Solid Application</Title>
      <Meta name="description" content="Default meta description" />
      <Link rel="canonical" href="https://example.com" />
      {props.children}
    </MetaProvider>
  );
}
```

---

## 2. Dynamic Route Titles and Social Cards

Child routes and components can override or append tags dynamically based on signals:

```tsx
import { Title, Meta } from "@solidjs/meta";

export default function ProductPage(props) {
  return (
    <>
      <Title>{props.product.title} | Store</Title>
      <Meta name="description" content={props.product.description} />
      <Meta property="og:title" content={props.product.title} />
      <Meta property="og:image" content={props.product.imageUrl} />
      
      <h1>{props.product.title}</h1>
    </>
  );
}
```

---

## 3. Server-Side Rendering (SSR) Head Extraction

In SSR environments without streaming (e.g. static SSG or `renderToString`), pass a tags array to `<MetaProvider tags={tags}>`:

```tsx
import { renderToString } from "solid-js/web";
import { MetaProvider, renderTags } from "@solidjs/meta";

export function handleSSRRequest() {
  const tags: any[] = [];
  const appHtml = renderToString(() => (
    <MetaProvider tags={tags}>
      <App />
    </MetaProvider>
  ));

  const headHtml = renderTags(tags);
  return `
    <!DOCTYPE html>
    <html>
      <head>${headHtml}</head>
      <body><div id="app">${appHtml}</div></body>
    </html>
  `;
}
```

In SolidStart, head tags stream automatically inside `<StartServer>` via `{assets}` in `entry-server.tsx`.
