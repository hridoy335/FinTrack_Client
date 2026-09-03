import { AccountType, Coa, CoaGroup, CoaListSection } from './coa.model';

export function groupCoasByType(coas: Coa[], accountTypes: AccountType[]): CoaGroup[] {
  return accountTypes
    .map((accountType) => ({
      accountType,
      accounts: coas
        .filter((c) => c.accountTypeId === accountType.id)
        .sort((a, b) => a.accountCode.localeCompare(b.accountCode))
    }))
    .filter((group) => group.accounts.length > 0);
}

export function parentOptions(coas: Coa[], accountTypeId: number): Coa[] {
  return coas.filter((c) => c.accountTypeId === accountTypeId && c.parentId == null);
}

const TYPE_LEAF_BASE: Record<number, number> = {
  1: 10100,
  2: 20100,
  3: 30100,
  4: 40100,
  5: 50100
};

export function defaultParentForType(coas: Coa[], accountTypeId: number): Coa | undefined {
  return parentOptions(coas, accountTypeId)[0];
}

export function suggestNextAccountCode(coas: Coa[], accountTypeId: number, parentId: number): string {
  const siblings = coas.filter(
    (c) => c.accountTypeId === accountTypeId && c.parentId === parentId
  );
  const numericCodes = siblings
    .map((c) => parseInt(c.accountCode, 10))
    .filter((n) => !Number.isNaN(n));

  if (numericCodes.length > 0) {
    return String(Math.max(...numericCodes) + 100);
  }

  const parent = coas.find((c) => c.id === parentId);
  const parentCode = parent ? parseInt(parent.accountCode, 10) : NaN;
  if (!Number.isNaN(parentCode)) {
    return String(parentCode + 100);
  }

  return String(TYPE_LEAF_BASE[accountTypeId] ?? 90000);
}

export function isLeafAccount(coa: Coa): boolean {
  return coa.parentId != null;
}

export function isDuplicateAccountHeadName(
  coas: Coa[],
  accountTypeId: number,
  accountName: string,
  excludeCoaId?: number
): boolean {
  const normalized = accountName.trim().toLowerCase();
  if (!normalized) return false;

  return coas.some(
    (coa) =>
      coa.accountTypeId === accountTypeId &&
      coa.accountName.trim().toLowerCase() === normalized &&
      coa.id !== excludeCoaId
  );
}

export function duplicateAccountHeadMessage(accountTypeName?: string): string {
  const scope = accountTypeName ? ` under ${accountTypeName}` : ' for this account type';
  return `An account head with this name already exists${scope}. Use a different name or choose another account type.`;
}

export function filterCoaSections(sections: CoaListSection[], query: string): CoaListSection[] {
  const term = query.trim().toLowerCase();
  if (!term) return sections;

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.code.toLowerCase().includes(term) ||
          item.accountHeadName.toLowerCase().includes(term)
      )
    }))
    .filter((section) => section.items.length > 0);
}

export function accountTypeBadgeClass(code: string): string {
  switch (code) {
    case 'ASSET':
      return 'coa-badge coa-badge--asset';
    case 'LIABILITY':
      return 'coa-badge coa-badge--liability';
    case 'EQUITY':
      return 'coa-badge coa-badge--equity';
    case 'INCOME':
      return 'coa-badge coa-badge--income';
    case 'EXPENSE':
      return 'coa-badge coa-badge--expense';
    default:
      return 'coa-badge';
  }
}
