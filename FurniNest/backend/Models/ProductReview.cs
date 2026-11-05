namespace FurniNest.Api.Models;

public class ProductReview
{
    public int Id { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }

    public int Rating { get; set; } = 5; // 1 to 5 stars
    public string Title { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public string ReviewerName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsVerifiedPurchase { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

