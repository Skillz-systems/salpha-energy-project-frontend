import React, { useState } from "react";
import { FileInput, Input } from "../InputComponent/Input";
import { useApiCall } from "@/utils/useApiCall";
import { z } from "zod";
import ApiErrorMessage from "../ApiErrorMessage";
import { Modal } from "../ModalComponent/Modal";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import { SelectInput } from "../InputComponent/Input";

const formSchema = z.object({
  name: z.string().min(1, "Warehouse Name is required"),
  type: z.string().optional(),
  inventoryClasses: z.string().min(1, "Inventory Classes are required"),
  image: z
    .instanceof(File)
    .refine(
      (file) =>
        ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"].includes(
          file.type
        ),
      {
        message: "Only PNG, JPEG, JPG, or SVG files are allowed.",
      }
    ),
});

type FormData = {
  name: string;
  type: string;
  inventoryClasses: string;
  image: File | null;
};

interface CreateNewWarehouseProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateNewWarehouse: React.FC<CreateNewWarehouseProps> = ({ isOpen, setIsOpen }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "",
    inventoryClasses: "",
    image: null,
  });

  const { apiCall } = useApiCall();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>("");

  // Available inventory classes
  const inventoryClassOptions = [
    { label: "Regular", value: "REGULAR" },
    { label: "Returned", value: "RETURNED" },
    { label: "Refurbished", value: "REFURBISHED" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    
    if (name === "image" && files && files.length > 0) {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    setFormErrors((prev) => prev.filter((err) => err.path[0] !== name));
    setApiError("");
  };

  const handleInventoryClassesChange = (selectedClasses: string[]) => {
    const classesString = selectedClasses.join(",");
    setFormData((prev) => ({ ...prev, inventoryClasses: classesString }));
    setFormErrors((prev) => prev.filter((err) => err.path[0] !== "inventoryClasses"));
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormErrors([]);
    setApiError("");

    const result = formSchema.safeParse(formData);
    if (!result.success) {
      setFormErrors(result.error.issues);
      setLoading(false);
      return;
    }

    try {
      // Create FormData for multipart/form-data
      const submissionData = new FormData();
      submissionData.append("name", formData.name);
      if (formData.type) {
        submissionData.append("type", formData.type);
      }
      submissionData.append("inventoryClasses", formData.inventoryClasses);
      if (formData.image) {
        submissionData.append("image", formData.image);
      }

      const response = await apiCall({
        method: "post",
        endpoint: "/v1/warehouses",
        data: submissionData,
        headers: { "Content-Type": "multipart/form-data" },
        successMessage: "Warehouse created successfully!",
      });

      if (response.status === 200 || response.status === 201) {
        setFormData({ name: "", type: "", inventoryClasses: "", image: null });
        setIsOpen(false);
      } else {
        setApiError(response.data.message || "An error occurred");
      }
    } catch (error: any) {
      setApiError(error?.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled = formData.name.trim() !== "" && 
                      formData.inventoryClasses.trim() !== "" && 
                      formData.image !== null;

  const getFieldError = (field: keyof FormData) => {
    return formErrors.find((err) => err.path[0] === field)?.message;
  };

  // Convert selected inventory classes to array for multi-select
  const selectedClasses = formData.inventoryClasses ? formData.inventoryClasses.split(",") : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      layout="right"
      bodyStyle="pb-[100px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col items-center bg-white w-full max-w-xl mx-auto pt-6 pb-8 px-4 gap-4" noValidate>
        <h2 className="text-2xl font-bold text-center mb-4">New Warehouse</h2>
        <div className="w-full flex flex-col gap-4">
          <Input
            type="text"
            name="name"
            label="* Warehouse Name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter warehouse name"
            required={true}
            errorMessage={getFieldError("name")}
          />
          
          <Input
            type="text"
            name="type"
            label="Warehouse Type"
            value={formData.type}
            onChange={handleInputChange}
            placeholder="Enter warehouse type (optional)"
            required={false}
            errorMessage={getFieldError("type")}
          />

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              * Inventory Class
            </label>
            <div className="flex flex-col gap-2">
              {inventoryClassOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={selectedClasses.includes(option.value)}
                    onChange={(e) => {
                      const { value, checked } = e.target;
                      let newClasses = [...selectedClasses];
                      
                      if (checked) {
                        newClasses.push(value);
                      } else {
                        newClasses = newClasses.filter(cls => cls !== value);
                      }
                      
                      handleInventoryClassesChange(newClasses);
                    }}
                    className="w-4 h-4 rounded border-gray-300 accent-yellow-500  focus:ring-2"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
            {getFieldError("inventoryClasses") && (
              <p className="text-red-500 text-xs mt-1">{getFieldError("inventoryClasses")}</p>
            )}
          </div>

          <FileInput
            name="image"
            label="* Warehouse Image"
            onChange={handleInputChange}
            required={true}
            accept=".jpg,.jpeg,.png,.svg"
            placeholder="Upload warehouse image"
            errorMessage={getFieldError("image")}
          />
        </div>
        <ApiErrorMessage apiError={apiError} />
        <ProceedButton
          type="submit"
          disabled={!isFormFilled || loading}
          loading={loading}
          variant={isFormFilled ? "gradient" : "gray"} 
        />
      </form>
    </Modal>
  );
};

export default CreateNewWarehouse;