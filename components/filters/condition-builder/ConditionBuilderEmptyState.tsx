import { Plus } from 'lucide-react';

export function ConditionBuilderEmptyState() {
  return (
    <div className="border-2 border-dashed rounded-lg p-8 text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          <Plus className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">No conditions added yet</p>
        <p className="text-sm text-muted-foreground">
          Click &quot;Add Condition&quot; to create your first filter rule
        </p>
      </div>
    </div>
  );
}
