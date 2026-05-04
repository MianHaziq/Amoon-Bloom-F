import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { ArrowRight } from "@/components/icons";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bloom-700">
        Lost in the boutique
      </p>
      <h1 className="mt-3 font-display text-7xl font-medium leading-none text-ink-900 md:text-8xl">
        404
      </h1>
      <p className="mt-4 max-w-md text-base text-ink-500">
        The page you&rsquo;re looking for has been re-arranged or never
        bloomed. Let&rsquo;s get you back to something beautiful.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={ROUTES.home} className="contents">
          <Button size="lg" trailingIcon={<ArrowRight size={16} />}>
            Back home
          </Button>
        </Link>
        <Link href={ROUTES.shop} className="contents">
          <Button size="lg" variant="outline">
            Browse the boutique
          </Button>
        </Link>
      </div>
    </Container>
  );
}
