import React from "react";
import { useNavigate } from "react-router-dom";

interface ReturnToWarehouseButtonProps {
  className?: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  children?: React.ReactNode;
}

const ReturnToWarehouseButton: React.FC<ReturnToWarehouseButtonProps> = ({
  className = "",
  onClick,
  children = "Return to Warehouses"
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/warehouses');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-full
        bg-[#4A4A3A]
        hover:bg-[#5A5A4A]
        text-white
        font-medium
        py-2
        px-3
        rounded-full
        transition-colors
        duration-200
        flex
        items-center
        justify-center
        gap-2
        text-sm
        whitespace-nowrap
        ${className}
      `}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="rotate-180"
      >
        <path
          d="M9 18L15 12L9 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </button>
  );
};

export default ReturnToWarehouseButton; 