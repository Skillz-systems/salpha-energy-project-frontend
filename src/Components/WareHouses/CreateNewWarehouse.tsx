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
  inventoryClassId: z.string().min(1, "Inventory Class is required"),
  warehousePicture: z.string().min(1, "Warehouse Picture is required"),
});

type FormData = z.infer<typeof formSchema>;

interface CreateNewWarehouseProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateNewWarehouse: React.FC<CreateNewWarehouseProps> = ({ isOpen, setIsOpen }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    inventoryClassId: "",
    warehousePicture: "",
  });

  const { apiCall } = useApiCall();
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => prev.filter((err) => err.path[0] !== name));
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
      const response = await apiCall({
        method: "post",
        endpoint: "/warehouse",
        data: formData,
      });

      if (response.status === 200) {
        setFormData({ name: "", inventoryClassId: "", warehousePicture: "" });
        setIsOpen(false);
      } else {
        setApiError(response.data.message || "An error occurred");
      }
    } catch (error) {
      setApiError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isFormFilled = Object.values(formData).every((val) => {
    if (typeof val === 'string') return val.trim() !== "";
    return !!val;
  });

  const getFieldError = (field: keyof FormData) => {
    return formErrors.find((err) => err.path[0] === field)?.message;
  };

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
            placeholder=" Warehouse Name"
            required={true}
            errorMessage={getFieldError("name")}
           
          />
          <SelectInput
            label="* Inventory Class"
            value={formData.inventoryClassId}
            onChange={(value: string) =>
              setFormData((prev) => ({ ...prev, inventoryClassId: value }))
            }
            options={[
              { label: "Regular", value: "regular" },
              { label: "Returned", value: "returned" },
              { label: "Refurbished", value: "refurbished" },
            ]}
            required={true}
            errorMessage={getFieldError("inventoryClassId")}
            placeholder="Inventory Class"
          />
          <FileInput
            name="warehousePicture"
            label="Warehouse Picture"
            onChange={handleInputChange}
            required={true}
            accept=".jpg,.jpeg,.png,.svg"
            placeholder="Warehouse Picture"
            errorMessage={getFieldError("warehousePicture")}
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