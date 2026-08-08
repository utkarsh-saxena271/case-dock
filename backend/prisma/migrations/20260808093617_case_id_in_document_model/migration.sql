-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "caseId" TEXT,
ALTER COLUMN "hearingId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
