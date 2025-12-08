import React,{ useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

// Extend Window interface
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

const Payments : React.FC = () => {

  const navigate = useNavigate();

  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [razorpayKey, setRazorpayKey] = useState<string>('');
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        name: '',
        email: '',
        contact: ''
  });

  const [accessToken, setAccessToken] = useState<string>("");

  const API_URL = `${import.meta.env.VITE_MEETINGS_API}/payments`;

   const updateTransaction = async() => {

    try{
      await axios.post(
        `${API_URL}/add-transcation`,
        {
          transaction_id: paymentStatus?.paymentId,
          amount: amount,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("trasnaction added successfully :)");



    }catch(error){
      if(axios.isAxiosError(error)){
        alert(`AXIOS ERROR: ${error.message}`);
      }else{
        alert(`UNKNOWN ERROR: ${error}`);
      };
    };
  };

  useEffect(() => {
    fetchRazorpayKey();
    const value = sessionStorage.getItem("B2P-STUDENT-ACCESS-TOKEN");
    const token = value ? JSON.parse(value) : null;
    const date = Date.now();
    if (!token || date > token.expiry) {
      navigate("/");

    } else {
      console.log(token);
      setAccessToken(token.token);
    }
  }, []);
  
  useEffect(() => {
    if(paymentStatus === null){
      return;
    }

    updateTransaction();
  },[paymentStatus])

  const fetchRazorpayKey = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/get-razorpay-key`);
      const data: { key: string } = await response.json();
      setRazorpayKey(data.key);
      console.log(data.key)
    } catch (error) {
      console.error('Error fetching Razorpay key:', error);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createOrder = async (): Promise<RazorpayOrder> => {
    try {
      const response = await fetch(`${API_URL}/make-payment `, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            customer_name: customerInfo.name,
            customer_email: customerInfo.email
          }
        })
      });

      const data: { success: boolean; order: RazorpayOrder; message?: string } = 
        await response.json();
      
      if (data.success) {
        return data.order;
      } else {
        throw new Error(data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  };

  const verifyPayment = async (
    paymentData: PaymentData
  ): Promise<PaymentVerificationResult> => {
    try {
      const response = await fetch(`${API_URL}/verify-payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      const data: PaymentVerificationResult = await response.json();
      return data;
    } catch (error) {
      console.error('Verify payment error:', error);
      throw error;
    }
  };

 

  const handlePayment = async (): Promise<void> => {
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
        name: 'B2P TEACHERS',
        description: '100 Days Payment Plan',
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

  const handleCustomerInfoChange = (
    field: keyof CustomerInfo,
    value: string
  ): void => {
    setCustomerInfo({ ...customerInfo, [field]: value });
  };
    
    return(
        <>
            <div className="min-h-screen background-image py-12 px-4">
            <div className="max-w-md mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
                    Razorpay Payment
                </h1>
                <p className="text-center text-gray-600 mb-8">
                    Secure payment gateway integration
                </p>

                <div className="space-y-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="John Doe"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="john@example.com"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number
                    </label>
                    <input
                        type="tel"
                        value={customerInfo.contact}
                        onChange={(e) => handleCustomerInfoChange('contact', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="9999999999"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (₹)
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Enter amount"
                        min="1"
                    />
                    </div>

                    <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {loading ? (
                        <span>Processing...</span>
                    ) : (
                        <span>Pay ₹{amount || '0'}</span>
                    )}
                    </button>
                </div>

                {paymentStatus && (
                    <div className={`mt-6 p-4 rounded-lg ${
                    paymentStatus.success 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                    <p className={`font-semibold ${
                        paymentStatus.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                        {paymentStatus.message}
                    </p>
                    {paymentStatus.success && paymentStatus.paymentId && (
                        <p className="text-sm text-green-700 mt-1">
                        Payment ID: {paymentStatus.paymentId}
                        </p>
                    )}
                    </div>
                )}
                </div>

                <div className="mt-6 text-center text-sm text-gray-600">
                <p>Powered by Razorpay • Secure Payment Gateway</p>
                </div>
            </div>
            </div>
        </>
    );
};



export default Payments;