namespace FurniNest.Api.Models;

public class Order
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty; // e.g. "FN-2026-8910"
    
    public int UserId { get; set; }
    public User? User { get; set; }

    public string Status { get; set; } = "Placed"; // "Placed", "InCrafting", "QualityCheck", "Shipped", "Delivered", "Cancelled"
    
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? CouponCode { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal Tax { get; set; }
    public decimal TotalAmount { get; set; }

    // Shipping Details
    public string RecipientName { get; set; } = string.Empty;
    public string ShippingAddress { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? TrackingNumber { get; set; }
    public string? CarrierName { get; set; }
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public Payment? Payment { get; set; }
}

