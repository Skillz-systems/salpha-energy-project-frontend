import React, { useState, useEffect, useCallback } from "react";
import ProceedButton from "../ProceedButtonComponent/ProceedButtonComponent";
import settingsicon from "../../assets/settings.svg";
import producticon from "../../assets/product-grey.svg";
import { SaleStore } from "@/stores/SaleStore";
import { Tag } from "../Products/ProductDetails";
import { NameTag } from "../CardComponents/CardComponent";
import { ProductDetailRow } from "./ProductSaleDisplay";
import { IoReturnUpBack } from "react-icons/io5";
import { formatNumberWithCommas } from "@/utils/helpers";
import creditcardicon from "../../assets/creditcardgrey.svg";
import { toast } from "react-toastify";
import { useApiCall } from "@/utils/useApiCall";
import { usePaystack } from "@/utils/usePaystack";
import PaymentModeSelector from "./PaymentModeSelector";

// Enhanced Paystack type definitions
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: PaystackConfig) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaystackConfig {
  key: string;
  email: string;
  amount: number;
  currency: string;
  ref: string;
  metadata?: Record<string, any>;
  channels?: string[];
  onClose: () => void;
  callback: (response: PaystackResponse) => void;
}

interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  trxref: string;
  redirecturl?: string;
}

interface PaymentVerificationResponse {
  status?: string;
  message?: string;
  jobId?: string;
  paymentStatus?: "PENDING" | "COMPLETED";
  amount?: number;
}

const SalesSummary = ({
  setSummaryState,
  resetSaleModalState,
  loading,
  getIsFormFilled,
  apiErrorMessage,
  payload,
}: {
  setSummaryState: React.Dispatch<React.SetStateAction<boolean>>;
  resetSaleModalState: () => void;
  loading: boolean;
  getIsFormFilled: () => boolean;
  apiErrorMessage: React.ReactNode;
  payload: any;
}) => {
  const { apiCall } = useApiCall();
  const { isReady, error: paystackError, loading: paymentLoading, initializePayment } = usePaystack();
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentInfo = SaleStore.paymentDetails;

  // Handle cash payment
  const handleCashPayment = async () => {
    setIsSubmitting(true);
    try {
      // Create a fresh payload with current payment method
      const freshPayload = {
        ...payload,
        paymentMethod: SaleStore.paymentMethod, // Use current payment method from store
      };
      
      console.log('Creating sale with fresh payload:', freshPayload);
      
      const saleResponse = await apiCall({
        endpoint: "/v1/sales/create",
        method: "post",
        data: freshPayload,
        successMessage: "Sale created successfully!",
      });

      console.log('Sale creation response:', saleResponse);

      if (saleResponse.data) {
        // Get the sale ID from the response
        const saleId = saleResponse.data.sale?.id;
        const totalAmount = saleResponse.data.paymentData?.amount;
        
        console.log('Extracted saleId:', saleId);
        console.log('Extracted total amount from API:', totalAmount);
        console.log('Full response data:', saleResponse.data);
        
        if (!saleId) {
          console.error('No sale ID found in response:', saleResponse);
          throw new Error("No sale ID received from sale creation");
        }

        if (!totalAmount) {
          console.error('No amount found in response:', saleResponse);
          throw new Error("No amount received from sale creation");
        }

        // Get the actual payment amount from the PaymentModeSelector (or use total if not set)
        const paymentAmount = SaleStore.paymentDetails?.amount || totalAmount;
        
        console.log('Payment amount:', paymentAmount);
        console.log('Total amount:', totalAmount);

        // Check if this is an installment payment - use paymentMode instead of installmentDuration
        const isInstallment = SaleStore.products.some(item => {
          const params = SaleStore.getParametersByProductId(item?.productId);
          return params?.paymentMode === "INSTALLMENT";
        });

        // Check if payment amount is less than total amount
        const isPartialPayment = paymentAmount < totalAmount;

        console.log('Is installment payment:', isInstallment);
        console.log('Is partial payment:', isPartialPayment);

        // Determine payment status
        const paymentStatus = (isInstallment || isPartialPayment) ? "INCOMPLETE" : "COMPLETED";
        
        console.log('Payment status will be set to:', paymentStatus);

        // Then record the cash payment
        console.log('Recording cash payment with saleId:', saleId, 'and amount:', paymentAmount);
        const paymentResponse = await apiCall({
          endpoint: "/v1/sales/record-cash-payment",
          method: "post",
          data: {
            saleId: String(saleId),
            paymentMethod: "CASH",
            amount: paymentAmount,
            status: paymentStatus
          },
          successMessage: (isInstallment || isPartialPayment) ? "Initial payment recorded successfully!" : "Cash payment completed successfully!",
        });

        console.log('Cash payment response:', paymentResponse);

        if (paymentResponse.data) {
          toast.success((isInstallment || isPartialPayment) ? "Initial payment recorded successfully!" : "Cash payment completed successfully!");
          resetSaleModalState();
        }
      }
    } catch (error: any) {
      console.error("Error processing cash payment:", error);
      console.error("Error details:", {
        response: error.response?.data,
        status: error.response?.status,
        message: error.response?.data?.message
      });
      const errorMessage = error.response?.data?.message || 
                          (Array.isArray(error.response?.data?.message) ? 
                            error.response?.data?.message[0] : 
                            "Failed to process cash payment. Please try again.");
      setPaymentError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify payment with backend
  const verifyPayment = async (reference: string) => {
    try {
      console.log('Verifying payment with reference:', reference);

      const response = await apiCall({
        endpoint: `/v1/payment/verify/callback?txref=${reference}`,
        method: "get",
        showToast: false,
      }) as { data: PaymentVerificationResponse };

      console.log('Payment verification response:', response);

      if (response?.data?.status === "success" || 
          response?.data?.status === "processing") {
        if (response?.data?.paymentStatus === "COMPLETED") {
          // Check if this is an installment payment - use paymentMode instead of installmentDuration
          const isInstallment = SaleStore.products.some(item => {
            const params = SaleStore.getParametersByProductId(item?.productId);
            return params?.paymentMode === "INSTALLMENT";
          });

          // Get the total amount that should be paid (from store's calculation)
          const totalAmount = SaleStore.paymentDetails?.amount || 0;
          // Get the actual payment amount from Paystack response
          const paymentAmount = response.data.amount || totalAmount;
          const isPartialPayment = paymentAmount < totalAmount;

          console.log('Online payment - Total amount:', totalAmount);
          console.log('Online payment - Payment amount:', paymentAmount);
          console.log('Online payment - Is installment:', isInstallment);
          console.log('Online payment - Is partial:', isPartialPayment);

          // Record the online payment completion
          try {
            const paymentResponse = await apiCall({
              endpoint: "/v1/sales/record-cash-payment",
              method: "post",
              data: {
                saleId: paymentInfo.metadata?.saleId,
                paymentMethod: "ONLINE",
                amount: paymentAmount,
                status: (isInstallment || isPartialPayment) ? "INCOMPLETE" : "COMPLETED"
              },
              successMessage: (isInstallment || isPartialPayment) ? "Initial payment recorded successfully!" : "Payment recorded successfully!"
            });
            console.log('Payment record response:', paymentResponse);
          } catch (recordError) {
            console.error("Failed to record payment:", recordError);
            toast.error("Payment completed but failed to record. Please contact support.");
          }
          
          toast.success((isInstallment || isPartialPayment) ? "Initial payment completed successfully!" : "Payment completed successfully!");
        } else {
          toast.success(response?.data?.message || "Payment verification initiated successfully!");
        }
        
        resetSaleModalState();
        return true;
      } else {
        console.error("Payment verification failed - unexpected response:", response);
        throw new Error("Payment verification failed - invalid response");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);

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

  // Handle payment initialization
  const handlePayment = useCallback(() => {
    if (SaleStore.paymentMethod === "CASH") {
      handleCashPayment();
      return;
    }

    setPaymentError(null);

    const success = initializePayment({
      key: paymentInfo.publicKey,
      email: paymentInfo.email,
      amount: paymentInfo.amount,
      currency: paymentInfo.currency || "NGN",
      ref: paymentInfo.reference,
      metadata: {
        ...paymentInfo.metadata,
        custom_fields: [
          {
            display_name: "Sale ID",
            variable_name: "sale_id",
            value: paymentInfo.metadata?.saleId || "",
          },
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: paymentInfo.metadata?.customerName || "",
          }
        ]
      },
      channels: paymentInfo.channels,
      onClose: () => {
        toast.info("Payment was cancelled");
      },
      callback: async (response) => {
        if (response.status === "success") {
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
  }, [paymentInfo, initializePayment, verifyPayment]);

  // Clear errors when payment info changes
  useEffect(() => {
    if (paymentInfo) {
      setPaymentError(null);
    }
  }, [paymentInfo]);

  // Combine errors from hook and local state
  const displayError = paymentError || paystackError;

  return (
    <>
      {!SaleStore.paymentDetails.reference ? (
        <>
          <div className="flex w-full">
            <p
              className="flex gap-1 items-center text-xs font-bold text-textDarkGrey cursor-pointer hover:underline"
              onClick={() => setSummaryState(false)}
            >
              <IoReturnUpBack />
              Back to form
            </p>
          </div>
          <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
              <img src={settingsicon} alt="Settings Icon" /> GENERAL DETAILS
            </p>
            <ProductDetailRow
              label="Sale Category"
              value={SaleStore.category}
            />
            <div className="flex items-center justify-between">
              <Tag name="Customer" />
              <div className="text-xs font-bold text-textDarkGrey">
                <NameTag name={SaleStore.customer?.customerName} />
              </div>
            </div>
          </div>
          {SaleStore.products.map((item, index) => {
            const params = SaleStore.getParametersByProductId(item?.productId);
            const paramList = [
              "Payment Mode",
              "Number of Installments",
              "Initial Deposit",
              "Discount",
            ];
            const recipient = SaleStore.getRecipientByProductId(
              item?.productId
            );
            const miscellaneousCosts = SaleStore.getMiscellaneousByProductId(
              item?.productId
            ).costs;
            const miscCostsExist = Object.keys(miscellaneousCosts).length >= 1;

            return (
              <div
                key={index}
                className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]"
              >
                <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
                  <img src={producticon} alt="Product Icon" /> PRODUCT{" "}
                  {index + 1}
                </p>

                <ProductDetailRow
                  label="Product Category"
                  value={item.productTag}
                />
                <ProductDetailRow
                  label="Product Name"
                  value={item.productName}
                />
                <ProductDetailRow
                  label="Product Units"
                  value={item.productUnits}
                />
                <ProductDetailRow
                  label="Product Price"
                  value={item.productPrice}
                />

                <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
                  {Object.entries(params || {}).map(([key, value], index) =>
                    !value ? null : (
                      <ProductDetailRow
                        key={key}
                        label={paramList[index]}
                        value={
                          paramList[index] === "Discount" 
                            ? `${value}%`
                            : paramList[index] === "Initial Deposit"
                              ? `${value}%`
                              : value >= 1 
                                ? formatNumberWithCommas(value) 
                                : value
                        }
                        showNaira={false}
                      />
                    )
                  )}
                </div>

                {!miscCostsExist ? null : (
                  <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
                    {Array.from(miscellaneousCosts.entries()).map(
                      ([name, cost]) => (
                        <ProductDetailRow
                          key={index}
                          label={name}
                          value={formatNumberWithCommas(cost)}
                          showNaira={true}
                        />
                      )
                    )}
                  </div>
                )}

                <div className="flex flex-col w-full gap-2 bg-[#F9F9F9] p-3 border-[0.6px] border-strokeGreyThree rounded-[20px]">
                  <ProductDetailRow
                    label="Recipient Name"
                    value={`${recipient?.firstname} ${recipient?.lastname}`}
                  />
                  <ProductDetailRow
                    label="Recipient Address"
                    value={recipient?.address as string}
                  />
                </div>
              </div>
            );
          })}
          <PaymentModeSelector
            value={SaleStore.paymentMethod as "ONLINE" | "CASH"}
            onChange={(value) => {
              SaleStore.setPaymentMethod(value as "ONLINE" | "CASH");
            }}
            saleId={SaleStore.paymentDetails?.metadata?.saleId}
            amount={SaleStore.paymentDetails?.amount}
            onAmountChange={(newAmount) => {
              // Update the payment amount in the store
              if (SaleStore.paymentDetails) {
                SaleStore.paymentDetails.amount = newAmount;
              }
            }}
          />

          {apiErrorMessage}

          <ProceedButton
            type="submit"
            loading={isSubmitting || loading}
            variant={getIsFormFilled() ? "gradient" : "gray"}
            disabled={!getIsFormFilled()}
            onClick={handlePayment}
          />
        </>
      ) : (
        <>
          <div className="flex flex-col w-full p-2.5 gap-2 bg-white border-[0.6px] border-strokeGreyThree rounded-[20px]">
            <p className="flex gap-1 w-max text-textLightGrey text-xs font-medium pb-2">
              <img src={creditcardicon} alt="Settings Icon" /> PAYMENT DETAILS
            </p>
            <div className="flex items-center justify-between">
              <Tag name="Customer Email" />
              <div className="text-xs font-bold text-textDarkGrey">
                <NameTag name={paymentInfo?.email || "N/A"} />
              </div>
            </div>
            <ProductDetailRow
              label="Payment Amount"
              value={formatNumberWithCommas(paymentInfo?.amount || 0)}
            />
            <ProductDetailRow
              label="Payment Currency"
              value={paymentInfo?.currency || ""}
            />
            <ProductDetailRow
              label="Payment Reference"
              value={paymentInfo?.reference || ""}
            />
          </div>
          <ProceedButton
            type="button"
            onClick={handlePayment}
            loading={paymentLoading}
            variant="gradient"
            disabled={paymentLoading || !isReady}
          />
        </>
      )}
    </>
  );
};

export default SalesSummary;
