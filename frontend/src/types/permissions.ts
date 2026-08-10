export type Permission =
  | 'READ_CASE'
  | 'CREATE_CASE'
  | 'UPDATE_CASE'
  | 'DELETE_CASE'
  | 'INVITE_MEMBERS'
  | 'REMOVE_MEMBERS'
  | 'EDIT_GROUP'

export type Role = 'OWNER' | 'ADMIN' | 'MEMBER'
export type MembershipStatus = 'PENDING' | 'ACTIVE'