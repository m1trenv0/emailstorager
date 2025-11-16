// Service field value types
export type ServiceFieldValue = string | number | boolean | Date | null;

// Flexible status type - maps service name to field values
export type AliasStatus = Record<string, Record<string, ServiceFieldValue>>;

// Service field type definition
export type ServiceFieldType = 'string' | 'date' | 'boolean' | 'number';

export interface ServiceField {
  name: string;
  type: ServiceFieldType;
  required: boolean;
  dependsOn?: string[];
  description?: string;
  defaultValue?: ServiceFieldValue;
}

// Service model
export interface Service {
  id: string;
  name: string;
  description?: string;
  fields: ServiceField[];
  createdAt: Date;
  updatedAt: Date;
}

// Filter condition types
export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'exists'
  | 'not_exists';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value?: ServiceFieldValue;
}

// Filter category model
export interface FilterCategory {
  id: string;
  name: string;
  serviceId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Filter model
export interface Filter {
  id: string;
  name: string;
  categoryId: string;
  conditions: FilterCondition[];
  showAsTab: boolean;
  tabOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Extended types with relations
export interface FilterCategoryWithFilters extends FilterCategory {
  filters: Filter[];
}

export interface ServiceWithCategories extends Service {
  filterCategories: FilterCategoryWithFilters[];
}

export interface AccountWithAliases {
  id: string;
  primaryEmail: string;
  recoveryEmail: string;
  recoveryPassword: string;
  status: AliasStatus; // Service status for primary email
  createdAt: Date;
  lastAliasAddedAt: Date | null;
  aliasesAddedInPeriod: number;
  aliases: AliasWithStatus[];
}

export interface AliasWithStatus {
  id: string;
  accountId: string;
  email: string;
  status: AliasStatus;
  comments: string | null;
  createdAt: Date;
  countsTowardLimit: boolean;
}
