-- CreateTable
CREATE TABLE "EventData" (
    "wallet" TEXT NOT NULL PRIMARY KEY,
    "lastClaimDate" TEXT NOT NULL,
    "claimedPremiumBoxes" JSONB,
    "claimedPaidBoxes" JSONB,
    "hasPaidForDay" BOOLEAN NOT NULL DEFAULT false
);
