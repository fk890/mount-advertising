"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from 'next/link'
import Image from 'next/image'
import withAuth from '@/shop-utils/withAuth';

// Inline icon components to avoid lucide-react JSX issues
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-600 mr-2">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const GiftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-600 mr-2">
    <rect x="3" y="8" width="18" height="4" rx="1"/>
    <path d="M12 8v13"/>
    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
  </svg>
);

const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-600 mr-2">
    <path d="M16.5 9.4 7.55 4.24"/>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.29 7 12 12 20.71 7"/>
    <line x1="12" x2="12" y1="22" y2="12"/>
  </svg>
);


type CartItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  collection?: string;
  customization?: {
    text?: string;
    font?: string;
    color?: string;
    boardType?: string;
    dimensions?: string;
    hasCustomDesign?: boolean;
    notes?: string;
    addOns?: string[];
  };
};

// Declare Razorpay type
declare global {
  interface Window {
    Razorpay: any;
    paypal: any;
  }
}

function CheckoutPage() {  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [giftPackaging, setGiftPackaging] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null);
  const [promoError, setPromoError] = useState('');
  
  // Shipping form state
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  
  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
    
    // Load user info if logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCustomerEmail(user.email || '');
        setShippingInfo(prev => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        }));
      } catch (e) {
        console.error('Error loading user data:', e);
      }
    }
    
    // Load promo code data
    const storedPromo = localStorage.getItem('appliedPromo');
    if (storedPromo) {
      try {
        setAppliedPromo(JSON.parse(storedPromo));
      } catch (e) {
        console.error('Error loading promo data:', e);
      }
    }
  }, []);

  // Load Razorpay SDK
  useEffect(() => {
    if (cart.length > 0 && !razorpayLoaded) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => {
        setErrors({ 
          general: "Payment system could not be loaded. Please refresh the page." 
        });
      };
      document.body.appendChild(script);
    }
  }, [cart, razorpayLoaded]);
  
  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 15.00; // Standard shipping
  const giftPackagingFee = giftPackaging ? 5.00 : 0;
  const promoDiscount = appliedPromo ? subtotal * appliedPromo.discount : 0;
  const total = subtotal + shippingFee + giftPackagingFee - promoDiscount;
  
  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    
    if (!customerEmail || !/\S+@\S+\.\S+/.test(customerEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!shippingInfo.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }
    if (!shippingInfo.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }
    if (!shippingInfo.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    }
    if (!shippingInfo.address.trim()) {
      newErrors.address = "Address is required.";
    }
    if (!shippingInfo.city.trim()) {
      newErrors.city = "City is required.";
    }
    if (!shippingInfo.state.trim()) {
      newErrors.state = "State is required.";
    }
    if (!shippingInfo.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [customerEmail, shippingInfo]);
  
  const handlePromoCode = useCallback(() => {
    setPromoError('')
    
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code')
      return
    }
    
    const code = promoCode.trim().toUpperCase()
    
    if (code === 'MOUNT10') {
      const promoData = { code: 'MOUNT10', discount: 0.10 }
      setAppliedPromo(promoData)
      localStorage.setItem('appliedPromo', JSON.stringify(promoData))
      setPromoError('')
      setPromoCode('')
    } else {
      setPromoError('Invalid promo code')
      setAppliedPromo(null)
      localStorage.removeItem('appliedPromo')
    }
  }, [promoCode]);

  const handleRemovePromo = useCallback(() => {
    setAppliedPromo(null)
    setPromoCode('')
    setPromoError('')
    localStorage.removeItem('appliedPromo')
  }, []);

  // Razorpay Payment Handler
  const handleRazorpayPayment = useCallback(async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      // Create Razorpay order
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          notes: {
            items: cart.length,
            customer: customerEmail,
          },
        }),
      });
      
      const orderData = await orderRes.json();
      
      if (!orderData.success) {
        throw new Error(orderData.error || 'Failed to create order');
      }
      
      const { orderId, orderNumber } = orderData.data;
      
      // Razorpay checkout options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'Mount Advertising',
        description: `Order for ${cart.length} item${cart.length > 1 ? 's' : ''}`,
        order_id: orderId,
        prefill: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: customerEmail,
          contact: shippingInfo.phone,
        },
        theme: {
          color: '#1a1a1a',
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          setLoading(true);
          
          try {
            // Prepare order items with customization data
            const orderItems = cart.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              collection: item.collection,
              sku: `SKU-${item.id}`,
              category: 'signage',
              image: item.image,
              customization: item.customization,
            }));
            
            // Verify payment and create order
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customerInfo: {
                  email: customerEmail,
                  firstName: shippingInfo.firstName,
                  lastName: shippingInfo.lastName,
                  address: shippingInfo.address,
                  city: shippingInfo.city,
                  state: shippingInfo.state,
                  zipCode: shippingInfo.zipCode,
                  phone: shippingInfo.phone,
                },
                orderItems,
                giftPackaging,
                giftNote: giftNote.trim() || undefined,
                shippingPrice: shippingFee,
                giftPackagingFee,
                promoCode: appliedPromo?.code,
                promoDiscount: promoDiscount,
                totalPrice: total,
                paymentMethod: 'razorpay',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderNumber,
              }),
            });
            
            const result = await verifyRes.json();
            
            if (result.success) {
              setSuccess(`✅ Payment successful! Your order #${result.data.orderNumber} has been placed. You will receive a confirmation email shortly. Thank you for shopping with Mount Advertising!`);
              setErrors({});
              localStorage.removeItem('cart');
              localStorage.removeItem('appliedPromo');
              
              // Dispatch cart update event
              window.dispatchEvent(new Event('cartUpdated'));
              
              // Redirect after 5 seconds
              setTimeout(() => {
                window.location.href = '/shop/success?order=' + result.data.orderNumber;
              }, 5000);
            } else {
              setErrors({ general: result.message || 'Payment verification failed. Please contact support.' });
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            setErrors({ general: 'Payment verification failed. Please contact support.' });
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setErrors({ general: 'Payment was cancelled. You can try again when ready.' });
          },
        },
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
      
    } catch (error) {
      console.error('Razorpay error:', error);
      setErrors({ general: 'Failed to initiate payment. Please try again.' });
      setLoading(false);
    }
  }, [validateForm, total, cart, customerEmail, shippingInfo, giftPackaging, giftNote, shippingFee, giftPackagingFee, appliedPromo, promoDiscount]);

  // Auto-scroll to errors or success
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.querySelector(`[name="${firstErrorKey}"]`);
      if (el && 'scrollIntoView' in el) {
        (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        (el as HTMLElement).focus();
      }
    }
  }, [errors, success]);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: '#f5f3ea' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Your cart is empty</h1>
            <p className="text-gray-600 mb-8 font-serif">Add some items to your cart before checking out</p>
            <Link 
              href="/shop" 
              className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-serif"            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen" style={{ background: '#f5f3ea' }}>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-900 font-serif">Processing your order...</p>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 font-serif">Secure Checkout</h1>
          <p className="text-xl text-gray-600 font-serif">Complete your advertising product purchase</p>
        </div>

        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center" role="alert">
            {errors.general}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 text-center" role="alert">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Customer & Shipping Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <LockIcon />
                <h2 className="text-lg font-medium text-gray-900 font-serif">Contact Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-serif">Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={`w-full border ${errors.email ? 'border-red-400' : 'border-gray-300'} rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-gray-900 text-black`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1 font-serif">{errors.email}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-serif">First Name *</label>
                    <input
                      name="firstName"
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      className={`w-full border ${errors.firstName ? 'border-red-400' : 'border-gray-300'} rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-gray-900 text-black`}
                      placeholder="John"
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1 font-serif">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-serif">Last Name *</label>
                    <input
                      name="lastName"
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      className={`w-full border ${errors.lastName ? 'border-red-400' : 'border-gray-300'} rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-gray-900 text-black`}
                      placeholder="Doe"
                    />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1 font-serif">{errors.lastName}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-serif">Phone Number *</label>
                  <input
                    name="phone"
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full border ${errors.phone ? 'border-red-400' : 'border-gray-300'} rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-gray-900 text-black`}
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1 font-serif">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <PackageIcon />
                <h2 className="text-lg font-medium text-gray-900 font-serif">Shipping Address</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-serif">Street Address *</label>
                  <input
                    name="address"
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                    className={`w-full border ${errors.address ? 'border-red-400' : 'border-gray-300'} rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-gray-900 text-black`}
                    placeholder="123 Main Street, Apt 4B"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1 font-serif">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-serif">City *</label>
                    <input
                      name="city"
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                      className={`w-full border ${errors.city ? 'border-red-400' : 'border-gray-300'} rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-gray-900 text-black`}
                      placeholder="Mumbai"
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1 font-serif">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 font-serif">State *</label>
                    <input
                      name="state"
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                      className={`w-full border ${errors.state ? 'border-red-400' : 'border-gray-300'} rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-gray-900 text-black`}
                      placeholder="Maharashtra"
                    />
                    {errors.state && <p className="text-red-500 text-xs mt-1 font-serif">{errors.state}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-serif">PIN Code *</label>
                  <input
                    name="zipCode"
                    type="text"
                    value={shippingInfo.zipCode}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                    className={`w-full border ${errors.zipCode ? 'border-red-400' : 'border-gray-300'} rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-gray-900 text-black`}
                    placeholder="400001"
                  />
                  {errors.zipCode && <p className="text-red-500 text-xs mt-1 font-serif">{errors.zipCode}</p>}
                </div>
              </div>
            </div>

            {/* Gift Options */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <GiftIcon />
                <h2 className="text-lg font-medium text-gray-900 font-serif">Gift Options</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="giftPackaging"
                    checked={giftPackaging}
                    onChange={(e) => setGiftPackaging(e.target.checked)}
                    className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                  <label htmlFor="giftPackaging" className="ml-2 text-sm text-gray-700 font-serif">
                    Add luxury gift packaging (+₹5.00)
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-serif">Gift Note (Optional)</label>
                  <textarea
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-gray-900 text-black"
                    rows={3}
                    placeholder="Add a personal message..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-8">
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <PackageIcon />
                <h2 className="text-lg font-medium text-gray-900 font-serif">Your Order</h2>
              </div>
                <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div key={`checkout-${idx}-${item.id}-${item.size || 'nosize'}-${item.color || 'nocolor'}`} className="flex items-center space-x-4 py-3 border-b border-gray-200 last:border-b-0">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 font-serif">{item.name}</h3>
                      <div className="text-sm text-gray-500 font-serif">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.size && item.color && <span> • </span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                      <div className="text-sm text-gray-500 font-serif">Qty: {item.quantity}</div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 font-serif">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Total */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 font-serif">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 font-serif">
                    <span>Shipping</span>
                    <span>₹{shippingFee.toFixed(2)}</span>
                  </div>                  {giftPackaging && (
                    <div className="flex justify-between text-sm text-gray-600 font-serif">
                      <span>Gift Packaging</span>
                      <span>₹{giftPackagingFee.toFixed(2)}</span>
                    </div>
                  )}
                  {appliedPromo && (
                    <div className="flex justify-between text-sm font-serif">
                      <div className="flex items-center">
                        <span className="text-green-600">Promo ({appliedPromo.code})</span>
                        <button
                          onClick={handleRemovePromo}
                          className="ml-2 text-xs text-gray-400 hover:text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                      <span className="text-green-600">-₹{promoDiscount.toFixed(2)}</span>
                    </div>
                  )}                  <div className="flex justify-between text-lg font-medium text-gray-900 pt-2 border-t border-gray-200 font-serif">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
              {/* Promo Code Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 font-serif">Promo Code</h3>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm font-serif focus:outline-none focus:ring-2 focus:ring-gray-900 text-black"
                  onKeyPress={(e) => e.key === 'Enter' && handlePromoCode()}
                />
                <button
                  onClick={handlePromoCode}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-serif rounded-md hover:bg-gray-800 transition-colors sm:whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p className="text-red-500 text-xs mt-2 font-serif">{promoError}</p>
              )}
              {appliedPromo && (
                <p className="text-green-600 text-xs mt-2 font-serif">
                  ✓ Promo code {appliedPromo.code} applied ({Math.round(appliedPromo.discount * 100)}% off)
                </p>
              )}
            </div>
            
            {/* Payment Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 font-serif">Secure Payment</h3>
              
              {/* Razorpay Payment Button */}
              <button
                onClick={handleRazorpayPayment}
                disabled={loading || !razorpayLoaded}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Pay ₹{total.toFixed(2)} with Razorpay
                  </>
                )}
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure
                </span>
                <span>•</span>
                <span>UPI</span>
                <span>•</span>
                <span>Cards</span>
                <span>•</span>
                <span>Net Banking</span>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-xs text-gray-500 font-serif">
                  🔒 Powered by Razorpay - India&apos;s trusted payment gateway<br/>
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>
          </div>        </div>
      </div>
    </div>
  );
}

export default withAuth(CheckoutPage);
