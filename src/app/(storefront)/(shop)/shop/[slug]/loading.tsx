import { Container, Section } from "@/components/ui";
import { Skeleton } from "@/components/ui/Loader";

export default function ProductLoading() {
  return (
    <>
      <section className="bg-cream-50 pt-8 pb-4">
        <Container>
          <Skeleton className="h-3 w-64" rounded="md" />
        </Container>
      </section>
      <Section spacing="sm" tone="cream">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div className="flex flex-col gap-4">
            <Skeleton className="aspect-square w-full" rounded="lg" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full" rounded="md" />
              ))}
            </div>
          </div>
          {/* Info column */}
          <div className="flex flex-col gap-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-8 w-32" />
            <div className="mt-2 flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="mt-4 h-12 w-full" rounded="lg" />
            <Skeleton className="h-12 w-full" rounded="lg" />
          </div>
        </div>
      </Section>
    </>
  );
}
