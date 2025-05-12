export interface TicketData {
  subject: string;
  category: string;
  priority: "low" | "medium" | "high";
  description: string;
}

export interface Ticket extends TicketData {
  id: string | number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  comments?: Comment[];
}

export interface Comment {
  id: string | number;
  user: string;
  content: string;
  createdAt: string;
} 