export type Entry = {
  id: string;
  type: "pending" | "received" | "promised" | "sent";
  amount: number;
  person: string;
  date: string;
  paymentMode: string;
  notes: string;
  clientEmail?: string;
  userId: string;
};
