namespace FurniNest.Api.Models;

public class Coupon
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty; // e.g. "WELCOME10", "FURNI20"
    public string Description { get; set; } = string.Empty;
    public decimal DiscountPercent { get; set; }     // e.g. 10.0m for 10%
    public decimal? MaxDiscountAmount { get; set; }  // e.g. 5000.0m
    public decimal MinOrderAmount { get; set; }      // e.g. 20000.0m
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

