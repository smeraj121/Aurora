import type { User } from "../shared/types/common";

export interface ProfileData extends User {
  phone: string;
  birthday?: string;
  gender?: 'Male' | 'Female' | 'Other' | null;
}
export interface UpdateProfileRequest {
  fullName: string;
  email?: string;
  birthday?: string;
  gender?: string;
}