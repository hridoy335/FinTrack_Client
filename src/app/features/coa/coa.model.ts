export interface AccountType {
  id: number;
  code: string;
  name: string;
  normalBalance: string;
}

export interface Coa {
  id: number;
  userInfoId: number;
  parentId?: number | null;
  accountTypeId: number;
  accountType?: AccountType;
  accountCode: string;
  accountName: string;
  isSystemDefault: boolean;
  isActive: boolean;
  createdDate: string;
  updatedDate?: string | null;
}

export interface CoaListItem {
  id: number;
  code: string;
  accountHeadName: string;
  parentId?: number | null;
  isSystemDefault: boolean;
  isActive: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface CoaListSection {
  accountTypeId: number;
  accountTypeCode: string;
  accountTypeName: string;
  items: CoaListItem[];
}

export interface CoaListResponse {
  sections: CoaListSection[];
}

export interface CreateCoaRequest {
  parentId?: number | null;
  accountTypeId: number;
  accountName: string;
}

export interface UpdateCoaRequest {
  parentId?: number | null;
  accountName: string;
  isActive: boolean;
}

export interface CoaGroup {
  accountType: AccountType;
  accounts: Coa[];
}
