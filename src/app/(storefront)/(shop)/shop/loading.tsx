import { Container } from "@/components/ui";
import { Skeleton } from "@/components/ui/Loader";

export default function ShopLoading() {
  return (
    <Container className="py-12">
      <Skeleton className="h-8 w-56" rounded="md" />
      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4">
            <Skeleton className="aspect-square w-full" rounded="lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </Container>
  );
}
