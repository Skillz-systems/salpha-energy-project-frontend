import React from "react";
import { useGetRequest } from "@/utils/useApiCall";
import { Modal } from "../ModalComponent/Modal";
import LoadingSpinner from "../Loaders/LoadingSpinner";

interface WarehouseDetailModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  warehouseID: string;
  refreshTable?: () => void;
}

const WarehouseDetailModal: React.FC<WarehouseDetailModalProps> = ({
  isOpen,
  setIsOpen,
  warehouseID,
  refreshTable
}) => {
  const { data: warehouseDetail, isLoading } = useGetRequest(
    `/v1/warehouses/${warehouseID}`,
    !!warehouseID && isOpen
  );

  const warehouse = warehouseDetail?.data;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      layout="default"
    >
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Warehouse Details</h2>
        
        {isLoading ? (
          <LoadingSpinner parentClass="py-8" />
        ) : warehouse ? (
          <ul className="space-y-2">
            <li><strong>Name:</strong> {warehouse.name}</li>
            <li><strong>Type:</strong> {warehouse.type || "N/A"}</li>
            <li><strong>Capacity:</strong> {warehouse.capacity || "N/A"}</li>
            <li><strong>Status:</strong> {warehouse.status || "Active"}</li>
            <li><strong>Inventory Classes:</strong> {
              Array.isArray(warehouse.inventoryClasses) 
                ? warehouse.inventoryClasses.join(", ") 
                : warehouse.inventoryClasses || "N/A"
            }</li>
            <li><strong>Total Value:</strong> ₦{warehouse.totalValue || warehouse.value || 0}</li>
          </ul>
        ) : (
          <p className="text-gray-500">No warehouse details found.</p>
        )}
        
        <button 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark"
          onClick={() => setIsOpen(false)}
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default WarehouseDetailModal; 