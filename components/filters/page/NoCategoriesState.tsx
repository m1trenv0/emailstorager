import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

interface NoCategoriesStateProps {
  onSyncCategories: () => Promise<void>;
}

export function NoCategoriesState({ onSyncCategories }: NoCategoriesStateProps) {
  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardContent className="py-12 text-center">
        <h3 className="mb-2 text-lg font-semibold">
          No filter categories available
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Filter categories are required to create filters. Click below to
          automatically create categories for your existing services.
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={onSyncCategories}>Create Filter Categories</Button>
          <Link href="/services">
            <Button variant="outline">Go to Services</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
