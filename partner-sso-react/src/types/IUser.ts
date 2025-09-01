export interface IUser {
  id?       : string;
  firstName : string;
  lastName  : string;
  email     : string;
  designationId: number;
  color     : string;
  isActive  : boolean;
  isInvited : boolean;
  hasChangedPassword: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
