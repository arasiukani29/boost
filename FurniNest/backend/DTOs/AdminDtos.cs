namespace FurniNest.Api.DTOs;

public record AdminDashboardStatsDto(
    decimal TotalRevenue,
    int TotalOrders,
    int ActiveProducts,
    int TotalCustomers,
    int PendingOrders,
    int ShippedOrders,
    int LowStockAlertCount,
    List<ProductDto> LowStockProducts,
    List<OrderDto> RecentOrders
);

public record CustomerSummaryDto(
    int Id,
    string FullName,
    string Email,
    string? PhoneNumber,
    string? City,
    string? Address,
    string? PostalCode,
    bool IsEmailVerified,
    string Role,
    DateTime CreatedAt,
    int TotalOrders,
    decimal TotalSpent,
    DateTime? LastOrderDate
);
