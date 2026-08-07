/*
  Warnings:

  - The values [DELETE_GROUP] on the enum `Permission` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Permission_new" AS ENUM ('INVITE_MEMBERS', 'REMOVE_MEMBERS', 'EDIT_GROUP', 'READ_CASE', 'CREATE_CASE', 'UPDATE_CASE', 'DELETE_CASE');
ALTER TABLE "Membership" ALTER COLUMN "permissions" TYPE "Permission_new"[] USING ("permissions"::text::"Permission_new"[]);
ALTER TYPE "Permission" RENAME TO "Permission_old";
ALTER TYPE "Permission_new" RENAME TO "Permission";
DROP TYPE "public"."Permission_old";
COMMIT;
