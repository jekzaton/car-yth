export type UserStatus = 'active' | 'inactive';

export type UserLevel = 'user' | 'member' | 'admin';

export type UserCarItem = {
  id: number;
  cid: string;
  userCode?: string | null;

  prefix: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;

  status: UserStatus;
  statusLevel: UserLevel;

  depId: number;
  departmentName: string | null;

  psId: number;
  positionName: string | null;

  systemId: number;
  systemName: string | null;

  createdAt?: string;
  updatedAt?: string;
};
