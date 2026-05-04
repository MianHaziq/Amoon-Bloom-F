import { Container } from "@/components/ui";

export default function RegisterPage() {
  return (
    <Container className="flex flex-1 items-center justify-center py-24">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Create account
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Register form scaffolding lives in{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            features/auth
          </code>
          .
        </p>
      </div>
    </Container>
  );
}
