'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Edit2, Save, X, Trash2 } from 'lucide-react';

interface ServiceFieldEditorActionsProps {
  isEditing: boolean;
  isUpdating: boolean;
  hasChanges: boolean;
  onEditStart: () => void;
  onSave: () => void;
  onCancel: () => void;
  onRemoveService?: () => void;
}

export function ServiceFieldEditorActions({
  isEditing,
  isUpdating,
  hasChanges,
  onEditStart,
  onSave,
  onCancel,
  onRemoveService,
}: ServiceFieldEditorActionsProps) {
  if (!isEditing) {
    return (
      <Button
        size="sm"
        variant="ghost"
        className="h-6 px-2 shrink-0"
        onClick={onEditStart}
        disabled={isUpdating}
      >
        <Edit2 className="h-3 w-3 mr-1" />
        <span className="text-xs">Edit</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <Button
        size="sm"
        className="h-6 px-2 text-xs shrink-0"
        onClick={onSave}
        disabled={!hasChanges || isUpdating}
      >
        {isUpdating ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Save className="h-3 w-3 mr-1" />
        )}
        Save
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-6 px-2 shrink-0"
        onClick={onCancel}
        disabled={isUpdating}
      >
        <X className="h-3 w-3" />
      </Button>
      {onRemoveService && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onRemoveService}
          disabled={isUpdating}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
