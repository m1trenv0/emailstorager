import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ServiceFormBasicFieldsProps {
  name: string;
  description: string;
  mode: 'create' | 'edit';
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

export function ServiceFormBasicFields({
  name,
  description,
  mode,
  onNameChange,
  onDescriptionChange,
}: ServiceFormBasicFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="service-name" className="text-sm font-medium">
          Service Name
          <span className="text-red-500 ml-1">*</span>
          {mode === 'edit' && (
            <span className="text-xs text-muted-foreground ml-2 font-normal">
              (cannot be changed)
            </span>
          )}
        </Label>
        <Input
          id="service-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Social Media, Banking, E-commerce"
          disabled={mode === 'edit'}
          className={mode === 'edit' ? 'bg-muted cursor-not-allowed' : ''}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="service-description" className="text-sm font-medium">
          Description
          <span className="text-muted-foreground ml-1 font-normal text-xs">
            (optional)
          </span>
        </Label>
        <Textarea
          id="service-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe the purpose of this service..."
          rows={2}
          className="resize-none"
        />
      </div>
    </div>
  );
}
