import { FilterCondition, ServiceField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ConditionForm } from './ConditionForm';

interface ConditionCardProps {
  condition: FilterCondition;
  index: number;
  serviceFields: ServiceField[];
  isExpanded: boolean;
  isLastCondition: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<FilterCondition>) => void;
  onRemove: () => void;
}

export function ConditionCard({
  condition,
  index,
  serviceFields,
  isExpanded,
  isLastCondition,
  onToggle,
  onUpdate,
  onRemove,
}: ConditionCardProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div
        className={`border rounded-lg bg-card transition-all ${
          isExpanded ? 'shadow-sm' : ''
        }`}
      >
        <div className="flex items-center gap-2 p-3">
          <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
            <GripVertical className="h-4 w-4" />
          </div>

          <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left hover:text-foreground transition-colors">
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                isExpanded ? 'rotate-0' : '-rotate-90'
              }`}
            />
            <span className="font-mono font-medium text-sm">
              {condition.field || (
                <span className="text-muted-foreground italic">No field</span>
              )}
            </span>
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted border ml-1">
              {condition.operator}
            </span>
            {condition.value !== undefined && condition.value !== '' && (
              <span className="text-xs text-foreground px-2 py-0.5 rounded bg-accent border ml-1 font-mono">
                = {String(condition.value)}
              </span>
            )}
          </CollapsibleTrigger>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Remove condition"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <CollapsibleContent>
          <ConditionForm
            condition={condition}
            index={index}
            serviceFields={serviceFields}
            isLastCondition={isLastCondition}
            onUpdate={onUpdate}
          />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
