import type { Metadata } from "next";
import { PrintDocument } from "@/components/pdf/print-document";

// Internal page loaded only by the server PDF renderer.
export const metadata: Metadata = {
  title: "Resumely print",
  robots: { index: false, follow: false },
};

export default function PrintPage() {
  return <PrintDocument />;
}
