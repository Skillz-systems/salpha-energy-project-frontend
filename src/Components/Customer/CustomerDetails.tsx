import React, { useState, useEffect } from "react";
import { KeyedMutator } from "swr";
import { Tag } from "../Products/ProductDetails";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import customericon from "../../assets/customers/customericon.svg";
import { useApiCall } from "@/utils/useApiCall";
import ApiErrorMessage from "../ApiErrorMessage";

export type DetailsType = {
  customerId?: string;
  id?: string;
  firstname?: string;
  lastname?: string;
  fullname?: string;
  customerCategory?: string;
  email?: string | null;
  phoneNumber?: string;
  phone?: string;
  alternatePhone?: string;
  gender?: string;
  addressType?: string;
  installationAddress?: string;
  lga?: string;
  state?: string;
  location?: string;
  longitude?: string;
  latitude?: string;
  idType?: string;
  idNumber?: string;
  type?: string;
  passportPhotoUrl?: string;
  idImageUrl?: string;
  contractFormImageUrl?: string;
};

interface CustomerDetailsProps extends DetailsType {
  refreshTable: KeyedMutator<any>;
  displayInput?: boolean;
  onEditSuccess?: () => void;
}

const CustomerDetails = ({
  refreshTable,
  displayInput,
  onEditSuccess,
  ...data
}: CustomerDetailsProps) => {

  const { apiCall } = useApiCall();
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | Record<string, string[]>>(
    ""
  );
  const [formData, setFormData] = useState({
    customerId: data.customerId || data.id,
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email || "",
    customerCategory: data.customerCategory || "",
    phoneNumber: data.phoneNumber || data.phone || "",
    alternatePhone: data.alternatePhone || "",
    gender: data.gender || "",
    addressType: data.addressType || "",
    installationAddress: data.installationAddress || "",
    lga: data.lga || "",
    state: data.state || "",
    location: data.location || "",
    longitude: data.longitude || "",
    latitude: data.latitude || "",
    idType: data.idType || "",
    idNumber: data.idNumber || "",
    type: data.type || "",
  });

  // Reset image state when customer changes
  useEffect(() => {
    setApiError(""); // Clear any previous errors

    // Update formData with new customer data
    setFormData({
      customerId: data.customerId || data.id,
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email || "",
      phoneNumber: data.phoneNumber || data.phone || "",
      customerCategory: data.customerCategory || "",
      alternatePhone: data.alternatePhone || "",
      gender: data.gender || "",
      addressType: data.addressType || "",
      installationAddress: data.installationAddress || "",
      lga: data.lga || "",
      state: data.state || "",
      location: data.location || "",
      longitude: data.longitude || "",
      latitude: data.latitude || "",
      idType: data.idType || "",
      idNumber: data.idNumber || "",
      type: data.type || "",
    });
  }, [
    // data.customerId || data.id,
    data.firstname,
    data.lastname,
    data.email,
    data.phoneNumber,
    data.phone,
    data.alternatePhone,
    data.gender,
    data.addressType,
    data.installationAddress,
    data.lga,
    data.state,
    data.location,
    data.longitude,
    data.latitude,
    data.idType,
    data.idNumber,
    data.type,
    data.customerCategory,
    data.customerId,
    data.id,
    data.contractFormImageUrl,
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    console.log({ name, value });
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setApiError(""); // Clear any previous errors when user makes changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setApiError("");

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formDataToSend.append(key, value);
        }
      });


      await apiCall({
        endpoint: `/v1/customers/${formData.customerId}`,
        method: "patch",
        data: formDataToSend,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        successMessage: "Customer updated successfully!",
      });

      if (refreshTable) {
        await refreshTable();
      }

      if (onEditSuccess) {
        onEditSuccess();
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to update customer";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4">
      {/* User ID Row */}
      <div className="flex items-center justify-between h-[44px] p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-full">
        <Tag name="User ID" />
        <p className="text-textDarkGrey text-xs font-bold">
          {data.customerId || data.id}
        </p>
      </div>

      {/* Personal Details Section */}
      <div className="flex flex-col p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
        <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
          <img src={customericon} alt="Customer Icon" /> PERSONAL DETAILS
        </p>
        {(
          [
            { label: "First Name", name: "firstname", value: data.firstname },
            { label: "Last Name", name: "lastname", value: data.lastname },
            { label: "Email", name: "email", value: data.email },
            {
              label: "Customer Category",
              name: "customerCategory",
              value: data.customerCategory,
            },
            {
              label: "Phone Number",
              name: "phoneNumber",
              value: data.phoneNumber || data.phone,
            },
            {
              label: "Alternative Phone Number",
              name: "alternatePhone",
              value: data.alternatePhone,
            },
            { label: "Gender", name: "gender", value: data.gender },
            {
              label: "Address Type",
              name: "addressType",
              value: data.addressType,
            },
            { label: "State", name: "state", value: data.state },
            { label: "LGA", name: "lga", value: data.lga },
            { label: "Address", name: "location", value: data.location },
            { label: "Latitude", name: "latitude", value: data.latitude },
            { label: "Longitude", name: "longitude", value: data.longitude },
          ] as { label: string; name: keyof typeof formData; value: any }[]
        ).map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <Tag name={item.label} />
            {displayInput ? (
              <input
                type="text"
                name={item.name}
                value={formData[item.name]}
                onChange={handleChange}
                className="text-xs text-textDarkGrey px-2 py-1 w-full max-w-[160px] border-[0.6px] border-strokeGreyThree rounded-full"
              />
            ) : (
              <p className="text-xs font-bold text-textDarkGrey">
                {item.value || "N/A"}
              </p>
            )}
          </div>
        ))}
      </div>

      {apiError && <ApiErrorMessage apiError={apiError} />}
      {displayInput && (
        <div className="flex items-center justify-center w-full pt-5 pb-5">
          <ProceedButton
            type="submit"
            loading={loading}
            variant={loading ? "gray" : "gradient"}
            disabled={loading}
            onClick={handleSubmit}
          />
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
