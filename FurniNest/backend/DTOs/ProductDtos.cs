namespace FurniNest.Api.DTOs;

public record CategoryDto(
    int Id,
    string Name,
    string Slug,
    string Description,
    string ImageUrl,
    int ProductCount
);

public record ProductDto(
    int Id,
    string Name,
    string Slug,
    string Description,
    decimal Price,
    decimal? OriginalPrice,
    int StockQuantity,
    string Dimensions,
    string Material,
    string Color,
    string PrimaryImageUrl,
    bool IsFeatured,
    bool IsActive,
    int CategoryId,
    string CategoryName,
    DateTime CreatedAt,
    List<string>? GalleryImages = null
);

public record CreateProductDto(
    string Name,
    string Description,
    decimal Price,
    decimal? OriginalPrice,
    int StockQuantity,
    string Dimensions,
    string Material,
    string Color,
    string PrimaryImageUrl,
    bool IsFeatured,
    int CategoryId
);

public record UpdateProductDto(
    string Name,
    string Description,
    decimal Price,
    decimal? OriginalPrice,
    int StockQuantity,
    string Dimensions,
    string Material,
    string Color,
    string PrimaryImageUrl,
    bool IsFeatured,
    bool IsActive,
    int CategoryId
);

