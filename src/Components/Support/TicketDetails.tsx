import React, { useState, ChangeEvent } from "react";
import { Ticket } from "./types";

interface TicketDetailsProps {
  ticket?: Ticket;
  onClose: () => void;
  onUpdateStatus?: (status: string) => void;
}

const TicketDetails: React.FC<TicketDetailsProps> = ({ ticket, onClose, onUpdateStatus }) => {
  const [newComment, setNewComment] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Handle submit comment
  const handleSubmitComment = () => {
    if (newComment.trim()) {
      // Call backend API to add comment
      console.log("Adding comment:", newComment);
      setNewComment("");
    }
  };

  // Get status badge styling
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

  // Status options for dropdown
  const statusOptions = ["Open", "In Progress", "Resolved", "Closed"];

  return ticket ? (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-strokeGreyThree bg-[#F6F8FA]">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-textDarkGrey">Ticket #{ticket.id}</h2>
          <span className={`inline-block text-xs px-2 py-1 rounded-full border ${getStatusBadgeClass(ticket.status)}`}>
            {ticket.status}
          </span>
        </div>
        <button 
          className="text-textGrey hover:text-textDarkGrey text-xl"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      
      {/* Ticket details */}
      <div className="p-4 border-b border-strokeGreyThree">
        <h3 className="text-md font-semibold text-textDarkGrey mb-2">{ticket.subject}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-textGrey">Category:</p>
            <p className="text-textDarkGrey capitalize">{ticket.category}</p>
          </div>
          <div>
            <p className="text-textGrey">Priority:</p>
            <p className="text-textDarkGrey capitalize">{ticket.priority}</p>
          </div>
          <div>
            <p className="text-textGrey">Created:</p>
            <p className="text-textDarkGrey">{formatDate(ticket.createdAt)}</p>
          </div>
          <div>
            <p className="text-textGrey">Last Updated:</p>
            <p className="text-textDarkGrey">{formatDate(ticket.updatedAt || ticket.createdAt)}</p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-textGrey mb-1">Description:</p>
          <p className="text-textDarkGrey p-3 bg-[#F9FAFB] rounded-md">{ticket.description}</p>
        </div>
        
        {/* Status update dropdown */}
        <div className="relative inline-block">
          <button
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-strokeGreyThree rounded-md hover:bg-[#F6F8FA]"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            type="button"
          >
            Update Status
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {showStatusDropdown && (
            <div className="absolute left-0 mt-1 w-36 bg-white border border-strokeGreyThree rounded-md shadow-md z-10">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-[#F6F8FA] border-b last:border-b-0 border-strokeGreyThree"
                  onClick={() => {
                    if (onUpdateStatus) onUpdateStatus(status);
                    setShowStatusDropdown(false);
                  }}
                  type="button"
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Comments/Communication section */}
      <div className="p-4 border-b border-strokeGreyThree">
        <h3 className="text-md font-semibold text-textDarkGrey mb-3">Communication</h3>
        
        {ticket.comments && ticket.comments.length > 0 ? (
          <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
            {ticket.comments.map((comment) => (
              <div key={comment.id} className="p-3 border border-strokeGreyThree rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-textDarkGrey">{comment.user}</span>
                  <span className="text-xs text-textGrey">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-textDarkGrey">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-textGrey mb-4">No comments yet.</p>
        )}
        
        {/* Add comment form */}
        <div className="flex flex-col gap-2">
          <textarea
            value={newComment}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
            className="w-full p-2 text-sm border border-strokeGreyThree rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            rows={3}
            placeholder="Add a comment..."
          />
          <button
            onClick={handleSubmitComment}
            disabled={!newComment.trim()}
            className="self-end px-4 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center py-8">
      <p className="text-textGrey">Ticket not found or still loading...</p>
    </div>
  );
};

export default TicketDetails;
