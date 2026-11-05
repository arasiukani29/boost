namespace FurniNest.Api.DTOs;

public record WishlistItemDto(
    int Id,
    int ProductId,
    string ProductName,
    string ProductSlug,
    decimal Price,
    decimal? OriginalPrice,
    string PrimaryImageUrl,
    string Material,
    string Dimensions,
    int StockQuantity,
    string CategoryName,
    DateTime AddedAt
);

