export interface User {
  id: number;
  fullName: string;
  email: string;
  role: 'Customer' | 'Admin';
  phoneNumber?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface AuthResponse {
  id: number;
  fullName: string;
  email: string;
  role: 'Customer' | 'Admin';
  token: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  dimensions: string;
  material: string;
  color: string;
  primaryImageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  galleryImages?: string[];
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  price: number;
  primaryImageUrl: string;
  quantity: number;
  availableStock: number;
  lineTotal: number;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  estimatedShipping: number;
  estimatedTax: number;
  total: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  status: 'Placed' | 'InCrafting' | 'QualityCheck' | 'Shipped' | 'Delivered' | 'Cancelled';
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  recipientName: string;
  shippingAddress: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  trackingNumber?: string;
  carrierName?: string;
  notes?: string;
  createdAt: string;
  paymentStatus: string;
  paymentMethod?: string;
  items: OrderItem[];
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  activeProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  shippedOrders: number;
  lowStockAlertCount: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
}

export interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  price: number;
  originalPrice?: number;
  primaryImageUrl: string;
  material: string;
  dimensions: string;
  stockQuantity: number;
  categoryName: string;
  addedAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discountPercent: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  isActive: boolean;
}

export interface CouponValidationResult {
  isValid: boolean;
  code: string;
  message: string;
  discountAmount: number;
  newSubtotal: number;
}

export interface ProductReview {
  id: number;
  productId: number;
  reviewerName: string;
  rating: number;
  title: string;
  comment: string;
  imageUrl?: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ProductReviewsSummary {
  productId: number;
  averageRating: number;
  totalReviews: number;
  reviews: ProductReview[];
}

export interface OtpSentResponse {
  success: boolean;
  message: string;
  devOtpHint?: string;
}

export interface PasskeyChallengeResponse {
  challenge: string;
  rpId?: string;
  rpName?: string;
  userId?: string;
  userName?: string;
  userDisplayName?: string;
  allowedCredentialIds?: string[];
}

export interface CustomerSummary {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  isEmailVerified: boolean;
  role: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}
