import React from "react";

interface Ticket {
  id: string | number;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface TicketTableProps {
  tickets?: Ticket[];
  onViewTicket: (id: string | number) => void;
}

const TicketTable: React.FC<TicketTableProps> = ({ tickets = [], onViewTicket }) => {
  // Status badge styling based on ticket status
  const getStatusBadgeClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-[#FEF5DA] text-[#A58730] border-[#A58730]";
      case "in progress":
        return "bg-[#E6F2FF] text-[#0066CC] border-[#0066CC]";
      case "resolved":
        return "bg-[#E6F9EF] text-[#00A36C] border-[#00A36C]";
      case "closed":
        return "bg-[#F0F0F0] text-[#666666] border-[#666666]";
      default:
        return "bg-[#F6F8FA] text-textDarkGrey border-strokeGreyThree";
    }
  };

  // Priority indicator styling
  const getPriorityClass = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-[#FFEBE6] text-[#CC3300]";
      case "medium":
        return "bg-[#FEF5DA] text-[#A58730]";
      case "low":
        return "bg-[#E6F9EF] text-[#00A36C]";
      default:
        return "bg-[#F6F8FA] text-textDarkGrey";
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="overflow-x-auto">
      {tickets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-textGrey">No support tickets found.</p>
          <p className="text-sm text-textGrey mt-2">Create a new ticket to get help from our support team.</p>
        </div>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-[#F6F8FA] text-textDarkGrey text-xs font-medium">
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Subject</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Priority</th>
              <th className="py-3 px-4 text-left">Created</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-strokeGreyThree">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-[#F9FAFB]">
                <td className="py-3 px-4 text-sm text-textDarkGrey">#{ticket.id}</td>
                <td className="py-3 px-4 text-sm text-textDarkGrey">{ticket.subject}</td>
                <td className="py-3 px-4 text-sm text-textDarkGrey capitalize">{ticket.category}</td>
                <td className="py-3 px-4">
                  <span className={`inline-block text-xs px-2 py-1 rounded-full border ${getStatusBadgeClass(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block text-xs px-2 py-1 rounded-full ${getPriorityClass(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="py-3 px-4 text-xs text-textGrey">{formatDate(ticket.createdAt)}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onViewTicket(ticket.id)}
                    className="text-primary text-sm hover:text-opacity-80"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TicketTable;
