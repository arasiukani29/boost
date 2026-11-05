using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FurniNest.Api.Data;
using FurniNest.Api.DTOs;
using FurniNest.Api.Models;

namespace FurniNest.Api.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly FurniNestDbContext _context;

    public AdminController(FurniNestDbContext context)
    {
        _context = context;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<AdminDashboardStatsDto>> GetDashboardStats()
    {
        var totalRevenue = await _context.Orders
            .Where(o => o.Status != "Cancelled")
            .SumAsync(o => o.TotalAmount);

        var totalOrders = await _context.Orders.CountAsync();
        var activeProducts = await _context.Products.CountAsync(p => p.IsActive);
        var totalCustomers = await _context.Users.CountAsync(u => u.Role == "Customer");

        var pendingOrders = await _context.Orders.CountAsync(o => o.Status == "Placed" || o.Status == "InCrafting" || o.Status == "QualityCheck");
        var shippedOrders = await _context.Orders.CountAsync(o => o.Status == "Shipped");

        var lowStockProducts = await _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive && p.StockQuantity <= 6)
            .Select(p => new ProductDto(
                p.Id,
                p.Name,
                p.Slug,
                p.Description,
                p.Price,
                p.OriginalPrice,
                p.StockQuantity,
                p.Dimensions,
                p.Material,
                p.Color,
                p.PrimaryImageUrl,
                p.IsFeatured,
                p.IsActive,
                p.CategoryId,
                p.Category != null ? p.Category.Name : "",
                p.CreatedAt
            ))
            .ToListAsync();

        var recentOrdersRaw = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.Payment)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .Take(8)
            .ToListAsync();

        var recentOrders = recentOrdersRaw.Select(o => new OrderDto(
            o.Id,
            o.OrderNumber,
            o.UserId,
            o.User?.FullName ?? "",
            o.User?.Email ?? "",
            o.Status,
            o.Subtotal,
            o.DiscountAmount,
            o.CouponCode,
            o.ShippingFee,
            o.Tax,
            o.TotalAmount,
            o.RecipientName,
            o.ShippingAddress,
            o.City,
            o.State,
            o.PostalCode,
            o.Phone,
            o.TrackingNumber,
            o.CarrierName,
            o.Notes,
            o.CreatedAt,
            o.Payment?.Status ?? "Unpaid",
            o.Payment?.PaymentMethod,
            o.Items.Select(i => new OrderItemDto(
                i.Id,
                i.ProductId,
                i.ProductName,
                i.ProductImageUrl,
                i.UnitPrice,
                i.Quantity,
                i.TotalPrice
            )).ToList()
        )).ToList();

        return Ok(new AdminDashboardStatsDto(
            totalRevenue,
            totalOrders,
            activeProducts,
            totalCustomers,
            pendingOrders,
            shippedOrders,
            lowStockProducts.Count,
            lowStockProducts,
            recentOrders
        ));
    }

    [HttpGet("orders")]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetAllOrders([FromQuery] string? status)
    {
        var query = _context.Orders
            .Include(o => o.User)
            .Include(o => o.Payment)
            .Include(o => o.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(o => o.Status.ToLower() == status.ToLower());
        }

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderDto(
                o.Id,
                o.OrderNumber,
                o.UserId,
                o.User != null ? o.User.FullName : "",
                o.User != null ? o.User.Email : "",
                o.Status,
                o.Subtotal,
                o.DiscountAmount,
                o.CouponCode,
                o.ShippingFee,
                o.Tax,
                o.TotalAmount,
                o.RecipientName,
                o.ShippingAddress,
                o.City,
                o.State,
                o.PostalCode,
                o.Phone,
                o.TrackingNumber,
                o.CarrierName,
                o.Notes,
                o.CreatedAt,
                o.Payment != null ? o.Payment.Status : "Unpaid",
                o.Payment != null ? o.Payment.PaymentMethod : null,
                o.Items.Select(i => new OrderItemDto(
                    i.Id,
                    i.ProductId,
                    i.ProductName,
                    i.ProductImageUrl,
                    i.UnitPrice,
                    i.Quantity,
                    i.TotalPrice
                )).ToList()
            ))
            .ToListAsync();

        return Ok(orders);
    }

    [HttpPut("orders/{id:int}/status")]
    public async Task<ActionResult<OrderDto>> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.Payment)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
        {
            return NotFound(new { message = "Order not found." });
        }

        if (dto.Status == "Cancelled" && order.Status != "Cancelled")
        {
            foreach (var item in order.Items)
            {
                var prod = await _context.Products.FindAsync(item.ProductId);
                if (prod != null)
                {
                    prod.StockQuantity += item.Quantity;
                }
            }
            if (order.Payment != null)
            {
                order.Payment.Status = order.Payment.PaymentMethod == "CashOnDelivery" ? "Voided" : "Refunded";
            }
        }

        order.Status = dto.Status;
        if (!string.IsNullOrWhiteSpace(dto.TrackingNumber))
        {
            order.TrackingNumber = dto.TrackingNumber;
        }
        if (!string.IsNullOrWhiteSpace(dto.CarrierName))
        {
            order.CarrierName = dto.CarrierName;
        }

        if (dto.Status == "Shipped" && order.ShippedAt == null)
        {
            order.ShippedAt = DateTime.UtcNow;
        }
        else if (dto.Status == "Delivered" && order.DeliveredAt == null)
        {
            order.DeliveredAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return Ok(new OrderDto(
            order.Id,
            order.OrderNumber,
            order.UserId,
            order.User?.FullName ?? "",
            order.User?.Email ?? "",
            order.Status,
            order.Subtotal,
            order.DiscountAmount,
            order.CouponCode,
            order.ShippingFee,
            order.Tax,
            order.TotalAmount,
            order.RecipientName,
            order.ShippingAddress,
            order.City,
            order.State,
            order.PostalCode,
            order.Phone,
            order.TrackingNumber,
            order.CarrierName,
            order.Notes,
            order.CreatedAt,
            order.Payment?.Status ?? "Unpaid",
            order.Payment?.PaymentMethod,
            order.Items.Select(i => new OrderItemDto(
                i.Id,
                i.ProductId,
                i.ProductName,
                i.ProductImageUrl,
                i.UnitPrice,
                i.Quantity,
                i.TotalPrice
            )).ToList()
        ));
    }

    [HttpPost("products")]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] CreateProductDto dto)
    {
        var slug = Regex.Replace(dto.Name.ToLower().Trim(), @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-").Trim('-');

        // Ensure unique slug
        if (await _context.Products.AnyAsync(p => p.Slug == slug))
        {
            slug = $"{slug}-{new Random().Next(100, 999)}";
        }

        var product = new Product
        {
            Name = dto.Name,
            Slug = slug,
            Description = dto.Description,
            Price = dto.Price,
            OriginalPrice = dto.OriginalPrice,
            StockQuantity = dto.StockQuantity,
            Dimensions = dto.Dimensions,
            Material = dto.Material,
            Color = dto.Color,
            PrimaryImageUrl = dto.PrimaryImageUrl,
            IsFeatured = dto.IsFeatured,
            IsActive = true,
            CategoryId = dto.CategoryId,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Products.AddAsync(product);
        await _context.SaveChangesAsync();

        var category = await _context.Categories.FindAsync(product.CategoryId);

        return CreatedAtAction("GetProductById", "Products", new { id = product.Id }, new ProductDto(
            product.Id,
            product.Name,
            product.Slug,
            product.Description,
            product.Price,
            product.OriginalPrice,
            product.StockQuantity,
            product.Dimensions,
            product.Material,
            product.Color,
            product.PrimaryImageUrl,
            product.IsFeatured,
            product.IsActive,
            product.CategoryId,
            category?.Name ?? "",
            product.CreatedAt
        ));
    }

    [HttpPut("products/{id:int}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(int id, [FromBody] UpdateProductDto dto)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound(new { message = "Product not found." });
        }

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.OriginalPrice = dto.OriginalPrice;
        product.StockQuantity = dto.StockQuantity;
        product.Dimensions = dto.Dimensions;
        product.Material = dto.Material;
        product.Color = dto.Color;
        product.PrimaryImageUrl = dto.PrimaryImageUrl;
        product.IsFeatured = dto.IsFeatured;
        product.IsActive = dto.IsActive;
        product.CategoryId = dto.CategoryId;

        await _context.SaveChangesAsync();

        var category = await _context.Categories.FindAsync(product.CategoryId);

        return Ok(new ProductDto(
            product.Id,
            product.Name,
            product.Slug,
            product.Description,
            product.Price,
            product.OriginalPrice,
            product.StockQuantity,
            product.Dimensions,
            product.Material,
            product.Color,
            product.PrimaryImageUrl,
            product.IsFeatured,
            product.IsActive,
            product.CategoryId,
            category?.Name ?? "",
            product.CreatedAt
        ));
    }

    [HttpGet("customers")]
    public async Task<ActionResult<IEnumerable<CustomerSummaryDto>>> GetCustomers()
    {
        var customers = await _context.Users
            .Where(u => u.Role == "Customer")
            .Include(u => u.Orders)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new CustomerSummaryDto(
                u.Id,
                u.FullName,
                u.Email,
                u.PhoneNumber,
                u.City,
                u.Address,
                u.PostalCode,
                u.IsEmailVerified,
                u.Role,
                u.CreatedAt,
                u.Orders.Count,
                u.Orders.Where(o => o.Status != "Cancelled").Sum(o => o.TotalAmount),
                u.Orders.OrderByDescending(o => o.CreatedAt).Select(o => (DateTime?)o.CreatedAt).FirstOrDefault()
            ))
            .ToListAsync();

        return Ok(customers);
    }

    [HttpGet("products")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAdminProducts([FromQuery] bool? archivedOnly = false)
    {
        var query = _context.Products.Include(p => p.Category).AsQueryable();

        if (archivedOnly == true)
        {
            query = query.Where(p => !p.IsActive);
        }

        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProductDto(
                p.Id,
                p.Name,
                p.Slug,
                p.Description,
                p.Price,
                p.OriginalPrice,
                p.StockQuantity,
                p.Dimensions,
                p.Material,
                p.Color,
                p.PrimaryImageUrl,
                p.IsFeatured,
                p.IsActive,
                p.CategoryId,
                p.Category != null ? p.Category.Name : "",
                p.CreatedAt
            ))
            .ToListAsync();

        return Ok(products);
    }

    [HttpDelete("products/{id:int}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = "Product not found." });
        }

        // Soft delete to protect historical order records
        product.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Product archived successfully." });
    }

    [HttpPut("products/{id:int}/restore")]
    public async Task<ActionResult> RestoreProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(new { message = "Product not found." });
        }

        product.IsActive = true;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Product restored to active catalog successfully." });
    }
}

