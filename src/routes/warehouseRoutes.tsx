import React from "react";
import { Routes, Route } from "react-router-dom";
import WareHouses from "../Pages/WareHouses";
import CreateNewWarehouse from "../Components/WareHouses/CreateNewWarehouse";
import WarehouseDetails from "../Components/WareHouses/WarehouseDetails";
import WarehouseHistory from "../Components/WareHouses/WarehouseHistory";

const WarehouseRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<WareHouses />} />
      <Route path="/create" element={<CreateNewWarehouse />} />
      <Route path="/:id" element={<WarehouseDetails />} />
      <Route path="/:id/inventory-log" element={<WarehouseHistory />} />
    </Routes>
  );
};

export default WarehouseRoutes; 