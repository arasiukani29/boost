namespace FurniNest.Api.DTOs;

public record AddToCartDto(
    int ProductId,
    int Quantity
);

public record UpdateCartItemDto(
    int Quantity
);

public record CartItemDto(
    int Id,
    int ProductId,
    string ProductName,
    string ProductSlug,
    decimal Price,
    string PrimaryImageUrl,
    int Quantity,
    int AvailableStock,
    decimal LineTotal
);

public record CartSummaryDto(
    List<CartItemDto> Items,
    int TotalItems,
    decimal Subtotal,
    decimal EstimatedShipping,
    decimal EstimatedTax,
    decimal Total
);

