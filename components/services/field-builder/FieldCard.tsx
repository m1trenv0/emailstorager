import { ServiceField, ServiceFieldType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { FieldEditorForm } from './FieldEditorForm';

const fieldTypeIcons: Record<ServiceFieldType, string> = {
  string: '📝',
  number: '🔢',
  boolean: '✓/✗',
  date: '📅',
};

interface FieldCardProps {
  field: ServiceField;
  index: number;
  fieldNames: string[];
  isExpanded: boolean;
  isDragging: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<ServiceField>) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export function FieldCard({
  field,
  index,
  fieldNames,
  isExpanded,
  isDragging,
  onToggle,
  onUpdate,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
}: FieldCardProps) {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        className={`border rounded-lg bg-card transition-all ${
          isDragging ? 'opacity-50' : ''
        } ${isExpanded ? 'shadow-sm' : ''}`}
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
            <span className="text-lg mr-1">{fieldTypeIcons[field.type]}</span>
            <span className="font-mono font-medium text-sm">
              {field.name || (
                <span className="text-muted-foreground italic">
                  Unnamed field
                </span>
              )}
            </span>
            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted border ml-1">
              {field.type}
            </span>
            {field.required && (
              <span className="text-red-500 font-bold">*</span>
            )}
          </CollapsibleTrigger>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Remove field"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <CollapsibleContent>
          <FieldEditorForm
            field={field}
            index={index}
            fieldNames={fieldNames}
            onUpdate={onUpdate}
          />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
