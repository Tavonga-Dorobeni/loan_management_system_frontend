"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfilePanel } from "./ProfilePanel";
import { LoanHistoryPanel } from "./LoanHistoryPanel";
import { ActivityTrailPanel } from "./ActivityTrailPanel";
import { KycDocumentGrid } from "./kyc/KycDocumentGrid";
import type { Borrower } from "@/lib/api/borrowers";

export function BorrowerTabs({ borrower }: { borrower: Borrower }) {
  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="kyc">KYC</TabsTrigger>
        <TabsTrigger value="loans">Loan history</TabsTrigger>
        <TabsTrigger value="activity">Activity trail</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfilePanel borrower={borrower} />
      </TabsContent>

      <TabsContent value="kyc">
        <KycDocumentGrid borrowerId={borrower.id} />
      </TabsContent>

      <TabsContent value="loans">
        <LoanHistoryPanel borrowerId={borrower.id} />
      </TabsContent>

      <TabsContent value="activity">
        <ActivityTrailPanel borrowerId={borrower.id} />
      </TabsContent>
    </Tabs>
  );
}
