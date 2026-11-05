namespace FurniNest.Api.DTOs;

public record CreateReviewRequest(
    int ProductId,
    int Rating,
    string Title,
    string Comment,
    string? ImageUrl = null
);

public record ProductReviewDto(
    int Id,
    int ProductId,
    string ReviewerName,
    int Rating,
    string Title,
    string Comment,
    bool IsVerifiedPurchase,
    DateTime CreatedAt,
    string? ImageUrl = null
);

public record ProductReviewsSummaryDto(
    int ProductId,
    double AverageRating,
    int TotalReviews,
    List<ProductReviewDto> Reviews
);

