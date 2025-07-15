import React, { useState } from "react";
import { X, Download, Calendar, Filter, FileText } from "lucide-react";
import useTokens from "@/hooks/useTokens";

interface ExportSalesModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ExportSalesModal: React.FC<ExportSalesModalProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    status: "all",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { token } = useTokens();

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "COMPLETED", label: "Completed" },
    { value: "IN_INSTALLMENT", label: "In Installment" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "UNPAID", label: "Unpaid" },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (startDate > endDate) {
        newErrors.endDate = "End date must be after start date";
      }

      if (endDate > new Date()) {
        newErrors.endDate = "End date cannot be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const downloadFile = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (!validateForm()) return;

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Build query parameters
      const params = new URLSearchParams();

      if (formData.startDate) {
        params.append("startDate", new Date(formData.startDate).toISOString());
      }

      if (formData.endDate) {
        // Set end date to end of day
        const endDate = new Date(formData.endDate);
        endDate.setHours(23, 59, 59, 999);
        params.append("endDate", endDate.toISOString());
      }

      if (formData.status !== "all") {
        params.append("status", formData.status);
      }

      // Build the URL
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const url = `${baseUrl}/api/v1/csv-upload/export-sales?${params.toString()}`;

       const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/csv",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Export failed: ${response.status} ${response.statusText}`
        );
      }

      // Check if response is actually CSV
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("text/csv")) {
        const responseText = await response.text();
        console.error("Unexpected response type:", contentType);
        console.error("Response body:", responseText);
        throw new Error("Server returned unexpected response format");
      }

      const csvContent = await response.text();
      console.log("CSV content length:", csvContent.length);
      console.log("CSV content preview:", csvContent.substring(0, 200));

      clearInterval(progressInterval);
      setExportProgress(100);

      // Generate filename with date range
      const dateRange =
        formData.startDate && formData.endDate
          ? `${formData.startDate}_to_${formData.endDate}`
          : new Date().toISOString().split("T")[0];

      const filename = `sales_export_${dateRange}.csv`;

      setTimeout(() => {
        if (csvContent && csvContent.trim()) {
          downloadFile(csvContent, filename);
        } else {
          throw new Error("Received empty CSV content");
        }

        setIsExporting(false);
        setExportProgress(0);
        setIsOpen(false);

        // Reset form
        setFormData({
          startDate: "",
          endDate: "",
          status: "all",
        });
      }, 500);
    } catch (error: any) {
      console.error("Export error:", error);
      setIsExporting(false);
      setExportProgress(0);

      // Show error message to user
      alert(`Export failed: ${error.message || "Unknown error"}`);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      setIsOpen(false);
      setFormData({
        startDate: "",
        endDate: "",
        status: "all",
      });
      setErrors({});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Export Sales Data
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Date Range */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4" />
              <span>Date Range (Optional)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  disabled={isExporting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  disabled={isExporting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4" />
              <span>Status Filter</span>
            </div>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              disabled={isExporting}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Progress Bar */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Exporting...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportSalesModal;
