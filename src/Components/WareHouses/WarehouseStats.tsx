import React from "react";

const WarehouseStats: React.FC = () => {
  // Example statistics data
  const stats = {
    totalWarehouses: 10,
    activeWarehouses: 8,
    inactiveWarehouses: 2,
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Warehouse Statistics</h2>
      <ul className="space-y-2">
        <li>Total Warehouses: {stats.totalWarehouses}</li>
        <li>Active Warehouses: {stats.activeWarehouses}</li>
        <li>Inactive Warehouses: {stats.inactiveWarehouses}</li>
      </ul>
    </div>
  );
};

export default WarehouseStats; 