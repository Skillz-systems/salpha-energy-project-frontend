import React, { useState, ChangeEvent, FormEvent } from "react";

interface TicketData {
  subject: string;
  category: string;
  priority: "low" | "medium" | "high";
  description: string;
}

interface CreateNewTicketProps {
  onSubmit: (data: TicketData) => void;
  onClose: () => void;
}

const CreateNewTicket: React.FC<CreateNewTicketProps> = ({ onSubmit, onClose }) => {
  const [ticketData, setTicketData] = useState<TicketData>({
    subject: "",
    category: "",
    priority: "medium",
    description: ""
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTicketData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(ticketData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-textDarkGrey">Create New Support Ticket</h2>
        <button 
          className="text-textGrey hover:text-textDarkGrey"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="subject" className="text-sm text-textDarkGrey">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={ticketData.subject}
            onChange={handleChange}
            className="p-2 border border-strokeGreyThree rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Brief description of the issue"
            required
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <label htmlFor="category" className="text-sm text-textDarkGrey">Category</label>
          <select
            id="category"
            name="category"
            value={ticketData.category}
            onChange={handleChange}
            className="p-2 border border-strokeGreyThree rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            required
          >
            <option value="">Select a category</option>
            <option value="technical">Technical Issue</option>
            <option value="billing">Billing</option>
            <option value="account">Account</option>
            <option value="product">Product</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-sm text-textDarkGrey">Priority</label>
          <div className="flex gap-4">
            {["low", "medium", "high"].map((priority) => (
              <label key={priority} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="priority"
                  value={priority}
                  checked={ticketData.priority === priority}
                  onChange={handleChange}
                  className="text-primary"
                />
                <span className="text-sm text-textDarkGrey capitalize">{priority}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm text-textDarkGrey">Description</label>
          <textarea
            id="description"
            name="description"
            value={ticketData.description}
            onChange={handleChange}
            rows={4}
            className="p-2 border border-strokeGreyThree rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Please provide details about your issue..."
            required
          />
        </div>
        
        <div className="flex gap-2 justify-end mt-2">
          <button 
            type="button"
            className="px-4 py-2 border border-strokeGreyThree rounded-md hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90"
          >
            Submit Ticket
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNewTicket;
