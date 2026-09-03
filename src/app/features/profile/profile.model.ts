export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName?: string | null;
  currencyCode: string;
  isActive: boolean;
  createdDate: string;
  updatedDate?: string | null;
}

export interface UpdateProfileRequest {
  email: string;
  firstName: string;
  lastName?: string | null;
  currencyCode?: string;
  password?: string | null;
  isActive: boolean;
}
