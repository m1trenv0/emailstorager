export type ServiceStatus = 'registered' | 'banned' | 'delivered' | 'pending';

export interface AliasStatus {
  aliexpress?: ServiceStatus;
  augment?: ServiceStatus;
}

export interface AccountWithAliases {
  id: string;
  primaryEmail: string;
  recoveryEmail: string;
  recoveryPassword: string;
  createdAt: Date;
  lastAliasAddedAt: Date | null;
  aliases: AliasWithStatus[];
}

export interface AliasWithStatus {
  id: string;
  accountId: string;
  email: string;
  status: AliasStatus;
  comments: string | null;
  createdAt: Date;
}
