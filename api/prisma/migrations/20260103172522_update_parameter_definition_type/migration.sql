/*
  Warnings:

  - Changed the type of `type` on the `ContentParameterDefinition` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ParameterType" AS ENUM ('TEXT', 'NUMBER', 'SELECT', 'CHECKBOX', 'DATE', 'TEXTAREA');

-- AlterTable
ALTER TABLE "ContentParameterDefinition" DROP COLUMN "type",
ADD COLUMN     "type" "ParameterType" NOT NULL;
