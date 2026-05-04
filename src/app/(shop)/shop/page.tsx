import { Container } from "@/components/ui";

export default function ShopPage() {
  return (
    <Container className="py-24">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Shop
      </h1>
      <p className="mt-3 max-w-prose text-zinc-600 dark:text-zinc-400">
        Product catalog will be wired to the backend at{" "}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm dark:bg-zinc-800">
          /products
        </code>{" "}
        once available.
      </p>
    </Container>
  );
}
