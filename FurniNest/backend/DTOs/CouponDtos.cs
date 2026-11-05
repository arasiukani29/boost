namespace FurniNest.Api.DTOs;

public record ValidateCouponRequest(
    string Code,
    decimal OrderSubtotal
);

public record CouponDto(
    int Id,
    string Code,
    string Description,
    decimal DiscountPercent,
    decimal? MaxDiscountAmount,
    decimal MinOrderAmount,
    bool IsActive
);

public record CouponValidationResultDto(
    bool IsValid,
    string Code,
    string Message,
    decimal DiscountAmount,
    decimal NewSubtotal
);

