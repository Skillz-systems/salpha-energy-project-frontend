import React from "react";

const WarehouseDetailModal: React.FC = () => {
  // Example warehouse detail data
  const warehouseDetail = {
    name: "Main Warehouse",
    location: "City A",
    capacity: 1000,
    type: "Distribution",
    status: "Active",
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <h2 className="text-xl font-bold mb-4">Warehouse Details</h2>
        <ul className="space-y-2">
          <li><strong>Name:</strong> {warehouseDetail.name}</li>
          <li><strong>Location:</strong> {warehouseDetail.location}</li>
          <li><strong>Capacity:</strong> {warehouseDetail.capacity}</li>
          <li><strong>Type:</strong> {warehouseDetail.type}</li>
          <li><strong>Status:</strong> {warehouseDetail.status}</li>
        </ul>
        <button className="mt-4 px-4 py-2 bg-primary text-white rounded-full">Close</button>
      </div>
    </div>
  );
};

export default WarehouseDetailModal; 