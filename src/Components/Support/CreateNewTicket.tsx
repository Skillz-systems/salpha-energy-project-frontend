import { useApiCall } from "@/utils/useApiCall";
import React, { useState } from "react";
import { KeyedMutator } from "swr";
import { Modal } from "../ModalComponent/Modal";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { Input } from "../InputComponent/Input";
import { z } from "zod";
import ApiErrorMessage from "../ApiErrorMessage";

interface CreatNewTicketProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  allTicketRefresh: KeyedMutator<any>;
}

const ticketSchema = z.object({
  type: z.string().min(1, "Type is required"),
  priority: z.string().min(1, "Priority is required"),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
});

type TicketFormData = z.infer<typeof ticketSchema>;

const defaultFormData = {
  type: "",
  priority: "",
  subject: "",
  description: "",
};

const CreateNewTicket = ({
  isOpen,
  setIsOpen,
  allTicketRefresh,
}: CreatNewTicketProps) => {
  const { apiCall } = useApiCall();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TicketFormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>(
    ""
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    resetFormErrors(name);
  };

  const handleSelectChange = (name: string, values: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: values,
    }));
    resetFormErrors(name);
  };

  const resetFormErrors = (name: string) => {
    // Clear the error for this field when the user starts typing
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = ticketSchema.parse(formData);
      await apiCall({
        endpoint: "/v1/tickets/create",
        method: "post",
        data: validatedData,
        successMessage: "Ticket created successfully!",
      });

      await allTicketRefresh();
      setIsOpen(false);
      setFormData(defaultFormData);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message ||
          "Ticket Creation Failed: Internal Server Error";
        setApiError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled = ticketSchema.safeParse(formData).success;

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      layout="right"
      bodyStyle="pb-[100px]"
    >
      <form
        className="flex flex-col items-center bg-white"
        onSubmit={handleSubmit}
        noValidate
      >
        <div
          className={`flex items-center justify-center px-4 w-full min-h-[64px] border-b-[0.6px] border-strokeGreyThree ${isFormFilled
              ? "bg-paleCreamGradientLeft"
              : "bg-paleGrayGradientLeft"
            }`}
        >
          <h2
            style={{ textShadow: "1px 1px grey" }}
            className="text-xl text-textBlack font-semibold font-secondary"
          >
            New Ticket
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center w-full px-4 gap-6 py-8">
          <div className="w-full relative">
            <span className="absolute left-4 top-3 text-red-500">*</span>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-full text-gray-600 focus:outline-none focus:border-textBlack"
              required
            >
              <option value="">Select Type</option>
              <option value="question">Question</option>
              <option value="problem">Problem</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
            {getFieldError("type") && (
              <p className="text-errorTwo text-xs mt-1 pl-4">{getFieldError("type")}</p>
            )}
          </div>
          
          <div className="w-full relative">
            <span className="absolute left-4 top-3 text-red-500">*</span>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-full text-gray-600 focus:outline-none focus:border-textBlack"
              required
            >
              <option value="">Select Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {getFieldError("priority") && (
              <p className="text-errorTwo text-xs mt-1 pl-4">{getFieldError("priority")}</p>
            )}
          </div>
          
          <div className="w-full relative">
            <span className="absolute left-4 top-3 text-red-500">*</span>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Subject"
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-full text-gray-600 focus:outline-none focus:border-textBlack"
              required
            />
            {getFieldError("subject") && (
              <p className="text-errorTwo text-xs mt-1 pl-4">{getFieldError("subject")}</p>
            )}
          </div>
          
          <div className="w-full relative">
            <span className="absolute left-4 top-3 text-red-500">*</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Type complaint here"
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-3xl text-gray-600 focus:outline-none focus:border-textBlack min-h-[200px] resize-none"
              required
            />
            {getFieldError("description") && (
              <p className="text-errorTwo text-xs mt-1 pl-4">{getFieldError("description")}</p>
            )}
          </div>
          
          <ApiErrorMessage apiError={apiError} />

          <ProceedButton
            type="submit"
            loading={loading}
            variant={isFormFilled ? "gradient" : "gray"}
            disabled={!isFormFilled}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CreateNewTicket;
