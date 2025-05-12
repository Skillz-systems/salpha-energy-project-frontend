import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { Tag } from "../Products/ProductDetails";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import customericon from "../../assets/customers/customericon.svg";
import axios from "axios";

export type DetailsType = {
  ticketId: string;
  subject: string;
  category: string;
  priority: string;
  description: string;
  from: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  action: string;
};


const TicketDetails = ({
  refreshTable,
  displayInput,
  ...data
}: DetailsType & {
  refreshTable: KeyedMutator<any>;
  displayInput?: boolean;
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    ticketId: data?.ticketId,
    date: data?.createdAt,
    subject: data?.subject,
    priority: data?.priority,
    type: data?.type,
    from: data?.from,
    status: data?.status,
    action: data?.action,
    category: data?.category,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`/api/tickets/${data?.ticketId}`, formData);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={customericon} alt="Settings Icon" /> TICKET DETAILS
        </p>
        <div className="flex items-center justify-between">
          <Tag name="First Name" />
          {displayInput ? (
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Enter Subject"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.subject}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Last Name" />
          {displayInput ? (
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Enter Category"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.category}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Priority" />
          {displayInput ? (
            <input
              type="email"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              placeholder="Enter Priority"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">{data.priority}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Type" />
          {displayInput ? (
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="Enter Type"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.type}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="From" />
          {displayInput ? (
            <select
              name="from"
              value={formData.from}
              onChange={handleChange}
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            >
              <option value="HOME">Home</option>
              <option value="WORK">Work</option>
            </select>
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.from || "N/A"}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Status" />
          {displayInput ? (
            <input
              type="text"
              name="status"
              value={formData.status}
              onChange={handleChange}
              placeholder="Enter Status"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.status || "N/A"}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Action" />
          {displayInput ? (
            <input
              type="text"
              name="action"
              value={formData.action}
              onChange={handleChange}
              placeholder="Enter Action"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.action || "N/A"}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Tag name="Date" />
          {displayInput ? (
            <input
              type="text"
              name="date"
              value={formData.date}
              onChange={handleChange}
              placeholder="Enter Date"
              className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
            />
          ) : (
            <p className="text-xs font-bold text-textDarkGrey">
              {data.createdAt || "N/A"}
            </p>
          )}
        </div>
      </div>
      {displayInput && (
        <div className="flex items-center justify-center w-full pt-5 pb-5">
          <ProceedButton
            type="submit"
            loading={loading}
            variant={"gray"}
            disabled={false}
          />
        </div>
      )}
    </form>
  );
};

export default TicketDetails;
