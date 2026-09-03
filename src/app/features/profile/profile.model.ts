export interface UserProfile {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  currencyCode: string;
  isActive: boolean;
  createdDate: string;
  updatedDate?: string | null;
}

export interface UpdateProfileRequest {
  userName: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  currencyCode: string;
  isActive: boolean;
}

