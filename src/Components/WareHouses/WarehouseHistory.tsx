import React from "react";

const WarehouseHistory: React.FC = () => {
  // Example history data
  const history = [
    { date: "2023-01-01", event: "Warehouse opened" },
    { date: "2023-02-15", event: "Capacity increased" },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Warehouse History</h2>
      <ul className="space-y-2">
        {history.map((entry, index) => (
          <li key={index}>
            <strong>{entry.date}:</strong> {entry.event}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WarehouseHistory; 