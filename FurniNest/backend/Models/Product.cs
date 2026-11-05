namespace FurniNest.Api.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int StockQuantity { get; set; }
    public string Dimensions { get; set; } = string.Empty; // e.g. "84W x 38D x 34H inches"
    public string Material { get; set; } = string.Empty;   // e.g. "Solid White Oak, Top-grain Leather"
    public string Color { get; set; } = string.Empty;      // e.g. "Cognac Brown"
    public string PrimaryImageUrl { get; set; } = string.Empty;
    public string? AdditionalImagesJson { get; set; }     // JSON array of image URLs
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
    public ICollection<ProductReview> Reviews { get; set; } = new List<ProductReview>();
}

