namespace FurniNest.Api.DTOs;

public record CheckoutDto(
    string RecipientName,
    string ShippingAddress,
    string City,
    string State,
    string PostalCode,
    string Phone,
    string PaymentMethod, // "CreditCard"
    string CardNumber,
    string CardExpiry,
    string CardCvc,
    string? Notes,
    string? CouponCode
);

public record OrderItemDto(
    int Id,
    int ProductId,
    string ProductName,
    string ProductImageUrl,
    decimal UnitPrice,
    int Quantity,
    decimal TotalPrice
);

public record OrderDto(
    int Id,
    string OrderNumber,
    int UserId,
    string CustomerName,
    string CustomerEmail,
    string Status,
    decimal Subtotal,
    decimal DiscountAmount,
    string? CouponCode,
    decimal ShippingFee,
    decimal Tax,
    decimal TotalAmount,
    string RecipientName,
    string ShippingAddress,
    string City,
    string State,
    string PostalCode,
    string Phone,
    string? TrackingNumber,
    string? CarrierName,
    string? Notes,
    DateTime CreatedAt,
    string PaymentStatus,
    string? PaymentMethod,
    List<OrderItemDto> Items
);

public record UpdateOrderStatusDto(
    string Status, // "Placed", "InCrafting", "QualityCheck", "Shipped", "Delivered", "Cancelled"
    string? TrackingNumber,
    string? CarrierName
);

public record CancelOrderRequest(
    string? Reason = null
);


