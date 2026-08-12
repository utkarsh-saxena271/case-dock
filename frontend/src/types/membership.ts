import type { Role, MembershipStatus, Permission } from './permissions'

export interface MembershipUser {
  id: string
  firstName: string
  lastName: string
  userName: string
  email: string
}

export interface Membership {
  id: string
  role: Role
  status: MembershipStatus
  permissions: Permission[]
  user: MembershipUser
}