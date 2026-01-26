# Razorpay Integration Guide - Mount Advertising

## ✅ What's Been Done

I've implemented the complete checkout flow with Razorpay integration. Here's what's been set up:

### 1. API Routes Created
- `/api/razorpay/create-order` - Creates Razorpay order on server
- `/api/razorpay/verify-payment` - Verifies payment signature and saves order

### 2. Checkout Page Updated
- Full shipping form (name, email, phone, address)
- Razorpay payment button with ₹ currency
- Form validation before payment
- Custom order data (designs, customizations) now saved to database

### 3. Admin Panel Enhanced
- Shows custom order details (text, font, color, dimensions, etc.)
- Displays uploaded customer designs with preview
- Shows Razorpay payment ID
- Visual alert for custom orders requiring attention

### 4. Database Schema Updated
Added to `order_items` table:
- `customization` (JSONB) - stores all customization details
- `custom_design_url` (text) - URL of uploaded design in Supabase Storage

Added to `orders` table:
- `razorpay_order_id` - Razorpay order ID
- `razorpay_payment_id` - Payment ID
- `razorpay_signature` - Verification signature
- `promo_code` and `promo_discount`

---

## 🔧 Razorpay Setup Steps

### Step 1: Create Razorpay Account
1. Go to https://dashboard.razorpay.com/signup
2. Sign up with your business email
3. Complete KYC verification (PAN, GST, bank details)

### Step 2: Get API Keys
1. After login, go to **Settings** → **API Keys**
2. Click **Generate Key** (or use test keys for testing)
3. Copy:
   - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - **Key Secret** (keep this secure!)

### Step 3: Add to Environment Variables
Add these to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

**Note:** The `NEXT_PUBLIC_` prefix makes it available in the browser (needed for checkout).

### Step 4: Run Database Migration
Execute this SQL in your Supabase SQL Editor to add the new columns:

```sql
-- Add Razorpay fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS razorpay_order_id text,
ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
ADD COLUMN IF NOT EXISTS razorpay_signature text,
ADD COLUMN IF NOT EXISTS promo_code text,
ADD COLUMN IF NOT EXISTS promo_discount numeric;

-- Add customization fields to order_items table
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS customization jsonb,
ADD COLUMN IF NOT EXISTS custom_design_url text;
```

### Step 5: Create Storage Bucket for Custom Designs
In Supabase Dashboard:
1. Go to **Storage** → **New bucket**
2. Name: `product-images`
3. Make it **public**
4. Add this to bucket policies (Storage → Policies):

```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated uploads (optional, or use service role)
CREATE POLICY "Service role uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');
```

---

## 📱 Testing the Integration

### Test Mode
Use test cards to verify the flow:
- **Card:** 4111 1111 1111 1111
- **Expiry:** Any future date
- **CVV:** Any 3 digits
- **UPI:** success@razorpay

### Test Checklist
1. Add item to cart
2. Go to checkout
3. Fill all shipping details
4. Click "Pay with Razorpay"
5. Complete test payment
6. Check:
   - ✅ Order saved in Supabase `orders` table
   - ✅ Items saved in `order_items` with customization
   - ✅ Customer receives email
   - ✅ Admin receives email notification
   - ✅ Order shows in admin panel

---

## 🔔 Notification Flow

### When Order is Placed:
1. **Customer gets:**
   - Email with order confirmation
   - Order number
   - Payment details
   - Item list with customization details

2. **Admin gets:**
   - Email with "NEW ORDER" alert
   - If custom order: Warning banner in email
   - Link to view uploaded designs
   - Customer contact info

3. **In Admin Panel:**
   - Order appears in Orders list
   - Custom orders have yellow warning badge
   - Click "View" to see all details
   - Custom designs shown with image preview

---

## 🎨 Custom Order Flow (LED Boards, Neon Signs)

1. Customer selects product options
2. Uploads their design (optional)
3. Adds to cart with all customization data
4. At checkout:
   - Design image uploaded to Supabase Storage
   - `customization` JSON saved to order_items
   - `custom_design_url` stored for admin access
5. Admin sees:
   - All custom specifications
   - Downloadable/viewable design
   - Special "Custom Order" alert

---

## 💰 Going Live

When ready for production:

1. Complete Razorpay KYC verification
2. Switch to live keys:
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   ```
3. Test with real ₹1 payment
4. Set up webhook for payment status updates (optional but recommended)

---

## 📞 Support

- Razorpay Dashboard: https://dashboard.razorpay.com
- Razorpay Docs: https://razorpay.com/docs/
- Test credentials: https://razorpay.com/docs/payments/test-integration/

---

## Files Modified

1. `src/app/shop/checkout/page.tsx` - Updated checkout with Razorpay
2. `src/app/api/razorpay/create-order/route.ts` - NEW: Creates Razorpay order
3. `src/app/api/razorpay/verify-payment/route.ts` - NEW: Verifies & processes payment
4. `src/app/api/admin/orders/route.ts` - Added customization fields
5. `src/shop-components/AdminOrdersManagement.tsx` - Shows custom orders
6. `supabase/schema.sql` - Added new columns
