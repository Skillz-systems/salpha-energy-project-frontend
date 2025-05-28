import React from "react";
import CreateNewTicket from "./CreateNewTicket";
import TicketDetails from "./TicketDetails";
import { Ticket } from "./types";
import { TicketData } from "./types";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "create" | "view";
  ticketData?: Ticket; 
  onSubmit: (data: TicketData) => void;
  onUpdateStatus?: (status: string) => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ 
  isOpen, 
  onClose, 
  mode = "create", 
  ticketData, 
  onSubmit, 
  onUpdateStatus 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {mode === "create" ? (
            <CreateNewTicket onSubmit={onSubmit} onClose={onClose} />
          ) : (
            <TicketDetails 
              ticket={ticketData} 
              onClose={onClose} 
              onUpdateStatus={onUpdateStatus} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
