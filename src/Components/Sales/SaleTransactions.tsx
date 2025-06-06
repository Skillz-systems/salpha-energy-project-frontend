import { CardComponent } from "../CardComponents/CardComponent";
import { SaleTransactionsType } from "./SalesDetailsModal";
import { toast } from "react-toastify";
import { useCallback, useEffect, useState } from "react";
import { usePaystack } from "@/utils/usePaystack";
import { useApiCall } from "@/utils/useApiCall";

type PaymentInfo = {
  id: string;
  transactionRef: string;
  amount: number;
  paymentStatus: "PENDING" | "COMPLETED";
  paymentDate: string;
  saleId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

const public_key =
  import.meta.env.PAYSTACK_PUBLIC_KEY ||
  "pk_test_764eb722cb244dc71a3dc8aba7875f6a7d1e9fd9";

const SaleTransactions = ({
  data,
}: {
  data: {
    entries: SaleTransactionsType[];
    paymentInfo: PaymentInfo[];
    customer: {
      name: string;
      phone_number: any;
      email: any;
    };
  };
}) => {
  const { apiCall } = useApiCall();
  const { isReady, error: paystackError, loading: paymentLoading, initializePayment } = usePaystack();
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Verify payment with backend
  const verifyPayment = async (reference: string) => {
    try {
      console.log('Verifying payment with reference:', reference);
      
      const response = await apiCall({
        endpoint: `/v1/payment/verify/callback?txref=${reference}`,
        method: "get",
        showToast: false,
      });

      console.log('Payment verification response:', response);

      // Check for successful verification
      if (response?.data?.status === "success" || response?.status === "success") {
        toast.success("Payment verified successfully!");
        // Optionally refresh the page or update the transaction status
        window.location.reload();
        return true;
      } else {
        console.error("Payment verification failed - unexpected response:", response);
        throw new Error("Payment verification failed - invalid response");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      
      // More detailed error handling
      if (error?.response?.status === 404) {
        toast.error("Payment verification endpoint not found. Please contact support.");
      } else if (error?.response?.status === 500) {
        toast.error("Server error during payment verification. Please contact support.");
      } else if (error?.response?.data?.message) {
        toast.error(`Payment verification failed: ${error.response.data.message}`);
      } else {
        toast.error("Payment verification failed. Please contact support.");
      }
      
      return false;
    }
  };

  const handlePayment = useCallback((paymentId: string) => {
    const selectedPaymentData = data?.paymentInfo?.find(
      (p) => p.id === paymentId
    );

    if (!selectedPaymentData) {
      setPaymentError("Payment information not found.");
      return;
    }

    if (!data.customer.email) {
      setPaymentError("Customer email is required for payment.");
      return;
    }

    if (!selectedPaymentData.amount || selectedPaymentData.amount <= 0) {
      setPaymentError("Invalid payment amount.");
      return;
    }

    setPaymentError(null);

    const success = initializePayment({
      key: public_key,
      email: data.customer.email,
      amount: selectedPaymentData.amount,
      currency: "NGN",
      ref: selectedPaymentData.transactionRef,
      metadata: {
        saleId: selectedPaymentData.saleId,
        customerName: data.customer.name,
        phoneNumber: data.customer.phone_number,
      },
      channels: ["card", "bank", "ussd", "qr", "mobile_money"],
      onClose: () => {
        toast.info("Payment was cancelled");
      },
      callback: async (response) => {
        if (response.status === "success") {
          // Verify payment with backend
          const isVerified = await verifyPayment(response.reference);
          if (!isVerified) {
            setPaymentError("Payment completed but verification failed. Please contact support with reference: " + response.reference);
          }
        } else {
          toast.error("Payment failed. Please try again.");
          setPaymentError("Payment was not successful. Please try again.");
        }
      }
    });

    if (!success) {
      setPaymentError("Failed to initialize payment. Please try again.");
    }
  }, [data, initializePayment, verifyPayment]);

  const dropDownList = {
    items: ["Make Payment"],
    onClickLink: (index: number, cardData: any) => {
      switch (index) {
        case 0:
          handlePayment(cardData?.productId);
          break;
        default:
          break;
      }
    },
    defaultStyle: true,
    showCustomButton: true,
  };

  // Display error if any
  const displayError = paymentError || paystackError;

  return (
    <div className="flex flex-col gap-4">
      {displayError && (
        <div className="p-3 border border-red-500 rounded-md bg-red-50">
          <p className="text-red-600 text-sm">{displayError}</p>
        </div>
      )}
      
      <div className="flex flex-wrap items-center gap-4">
        {data?.entries?.map((item, index) => (
          <CardComponent
            key={index}
            variant="salesTransactions"
            transactionId={item?.transactionId}
            productId={item?.transactionId}
            transactionStatus={item?.paymentStatus}
            datetime={item?.datetime}
            productType={item?.productCategory}
            productTag={item?.paymentMode}
            transactionAmount={item?.amount}
            dropDownList={dropDownList}
            showDropdown={item?.paymentStatus === "COMPLETED" ? false : true}
          />
        ))}
      </div>
    </div>
  );
};

export default SaleTransactions;
