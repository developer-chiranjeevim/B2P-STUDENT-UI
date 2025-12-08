// Type definitions
interface PaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface PaymentVerificationResult {
  success: boolean;
  message: string;
  orderId?: string;
  paymentId?: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  contact: string;
}

interface PaymentStatus {
  success: boolean;
  message: string;
  orderId?: string;
  paymentId?: string;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

// Extend Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

// Verify Payment Function
const verifyPayment = async (
  paymentData: PaymentData
): Promise<PaymentVerificationResult> => {
  try {
    const response = await fetch(
      `http://localhost:8080/apis/payments/verify-payments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      }
    );

    const data: PaymentVerificationResult = await response.json();
    return data;
  } catch (error) {
    console.error('Verify payment error:', error);
    throw error;
  }
};

// Handle Payment Function
const handlePayment = async (
  amount: string,
  customerInfo: CustomerInfo,
  razorpayKey: string,
  createOrder: () => Promise<RazorpayOrder>,
  loadRazorpayScript: () => Promise<boolean>,
  setLoading: (loading: boolean) => void,
  setPaymentStatus: (status: PaymentStatus | null) => void
): Promise<void> => {
  if (!amount || parseFloat(amount) <= 0) {
    alert('Please enter a valid amount');
    return;
  }

  if (!customerInfo.name || !customerInfo.email || !customerInfo.contact) {
    alert('Please fill in all customer details');
    return;
  }

  setLoading(true);
  setPaymentStatus(null);

  try {
    // Load Razorpay script
    const scriptLoaded: boolean = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Create order
    const order: RazorpayOrder = await createOrder();

    // Initialize Razorpay payment
    const options: RazorpayOptions = {
      key: razorpayKey,
      amount: order.amount,
      currency: order.currency,
      name: 'Your Company Name',
      description: 'Payment for products/services',
      order_id: order.id,
      handler: async function (response: RazorpayResponse): Promise<void> {
        // Verify payment on backend
        const verificationResult: PaymentVerificationResult =
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

        if (verificationResult.success) {
          setPaymentStatus({
            success: true,
            message: 'Payment successful!',
            orderId: verificationResult.orderId,
            paymentId: verificationResult.paymentId,
          });
        } else {
          setPaymentStatus({
            success: false,
            message: 'Payment verification failed',
          });
        }
        setLoading(false);
      },
      prefill: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.contact,
      },
      theme: {
        color: '#3b82f6',
      },
      modal: {
        ondismiss: function (): void {
          setLoading(false);
          setPaymentStatus({
            success: false,
            message: 'Payment cancelled by user',
          });
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    setLoading(false);
    setPaymentStatus({
      success: false,
      message: error instanceof Error ? error.message : 'Payment failed',
    });
  }
};

export { verifyPayment, handlePayment };
export type {
  PaymentData,
  PaymentVerificationResult,
  CustomerInfo,
  PaymentStatus,
  RazorpayOrder,
  RazorpayResponse,
  RazorpayOptions,
};