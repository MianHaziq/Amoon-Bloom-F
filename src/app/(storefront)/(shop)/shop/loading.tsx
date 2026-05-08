import { Container } from "@/components/ui";
import { Skeleton } from "@/components/ui/Loader";

export default function ShopLoading() {
  return (
    <Container className="py-12">
      <Skeleton className="h-8 w-56" rounded="md" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[4/5] w-full" rounded="lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </Container>
  );
}
