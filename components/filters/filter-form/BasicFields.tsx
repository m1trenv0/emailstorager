import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ServiceField } from '@/lib/types';

interface FilterCategory {
  id: string;
  name: string;
  serviceId: string;
  service: { name: string; fields: ServiceField[] };
}

interface BasicFieldsProps {
  name: string;
  categoryId: string;
  showAsTab: boolean;
  tabOrder: number;
  categories: FilterCategory[];
  mode: 'create' | 'edit';
  onNameChange: (name: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onShowAsTabChange: (checked: boolean) => void;
  onTabOrderChange: (order: number) => void;
}

export function BasicFields({
  name,
  categoryId,
  showAsTab,
  tabOrder,
  categories,
  mode,
  onNameChange,
  onCategoryChange,
  onShowAsTabChange,
  onTabOrderChange,
}: BasicFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="filter-name" className="text-sm font-medium">
          Filter Name
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="filter-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Active Orders, Banned Accounts"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="filter-category" className="text-sm font-medium">
          Category (Service)
          <span className="text-red-500 ml-1">*</span>
          {mode === 'edit' && (
            <span className="text-xs text-muted-foreground ml-2 font-normal">
              (cannot be changed)
            </span>
          )}
        </Label>
        <Select
          value={categoryId}
          onValueChange={onCategoryChange}
          disabled={mode === 'edit'}
        >
          <SelectTrigger
            className={mode === 'edit' ? 'bg-muted cursor-not-allowed' : ''}
          >
            <SelectValue placeholder="Select a category..." />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name} ({category.service.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="show-as-tab"
          checked={showAsTab}
          onCheckedChange={(checked) => onShowAsTabChange(checked as boolean)}
        />
        <Label htmlFor="show-as-tab" className="cursor-pointer text-sm">
          Show as tab
        </Label>
      </div>

      {showAsTab && (
        <div className="space-y-2 pl-6">
          <Label htmlFor="tab-order" className="text-sm font-medium">
            Tab Order
            <span className="text-xs text-muted-foreground ml-2 font-normal">
              (lower = first)
            </span>
          </Label>
          <Input
            id="tab-order"
            type="number"
            min="0"
            value={tabOrder}
            onChange={(e) => onTabOrderChange(parseInt(e.target.value) || 0)}
            placeholder="0"
            className="max-w-[120px]"
          />
        </div>
      )}
    </div>
  );
}
