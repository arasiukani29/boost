using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FurniNest.Api.Data;
using FurniNest.Api.DTOs;
using FurniNest.Api.Models;

namespace FurniNest.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly FurniNestDbContext _context;

    public OrdersController(FurniNestDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(idClaim, out var id) ? id : 0;
    }

    [HttpPost("checkout")]
    public async Task<ActionResult<OrderDto>> Checkout([FromBody] CheckoutDto dto)
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        var cartItems = await _context.CartItems
            .Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .ToListAsync();

        if (!cartItems.Any())
        {
            return BadRequest(new { message = "Your cart is empty." });
        }

        // Validate stock for each item
        foreach (var item in cartItems)
        {
            if (item.Product == null || !item.Product.IsActive)
            {
                return BadRequest(new { message = $"Item '{item.Product?.Name ?? "Item"}' is no longer available." });
            }
            if (item.Quantity > item.Product.StockQuantity)
            {
                return BadRequest(new { message = $"Not enough stock for '{item.Product.Name}'. Only {item.Product.StockQuantity} available." });
            }
        }

        var subtotal = cartItems.Sum(i => i.Product!.Price * i.Quantity);
        decimal discountAmount = 0;
        string? appliedCoupon = null;

        if (!string.IsNullOrWhiteSpace(dto.CouponCode))
        {
            var code = dto.CouponCode.Trim().ToUpperInvariant();
            var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code.ToUpper() == code && c.IsActive);
            if (coupon != null && (!coupon.ExpiresAt.HasValue || coupon.ExpiresAt > DateTime.UtcNow) && subtotal >= coupon.MinOrderAmount)
            {
                discountAmount = (subtotal * coupon.DiscountPercent) / 100m;
                if (coupon.MaxDiscountAmount.HasValue && discountAmount > coupon.MaxDiscountAmount.Value)
                {
                    discountAmount = coupon.MaxDiscountAmount.Value;
                }
                discountAmount = Math.Round(discountAmount, 2);
                appliedCoupon = coupon.Code;
            }
        }

        var effectiveSubtotal = subtotal - discountAmount;
        var shippingFee = effectiveSubtotal >= 25000 ? 0m : 1499.00m;
        var tax = Math.Round(effectiveSubtotal * 0.05m, 2);
        var totalAmount = effectiveSubtotal + shippingFee + tax;

        // Generate unique Order Number
        var orderNumber = $"FN-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}";

        var order = new Order
        {
            OrderNumber = orderNumber,
            UserId = userId,
            Status = "Placed",
            Subtotal = subtotal,
            DiscountAmount = discountAmount,
            CouponCode = appliedCoupon,
            ShippingFee = shippingFee,
            Tax = tax,
            TotalAmount = totalAmount,
            RecipientName = string.IsNullOrWhiteSpace(dto.RecipientName) ? user.FullName : dto.RecipientName,
            ShippingAddress = dto.ShippingAddress,
            City = dto.City,
            State = dto.State,
            PostalCode = dto.PostalCode,
            Phone = dto.Phone,
            Notes = dto.Notes,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Orders.AddAsync(order);
        await _context.SaveChangesAsync();

        // Add Order Items & Decrement Stock
        foreach (var item in cartItems)
        {
            var orderItem = new OrderItem
            {
                OrderId = order.Id,
                ProductId = item.ProductId,
                ProductName = item.Product!.Name,
                ProductImageUrl = item.Product.PrimaryImageUrl,
                UnitPrice = item.Product.Price,
                Quantity = item.Quantity
            };
            await _context.OrderItems.AddAsync(orderItem);

            // Deduct stock
            item.Product.StockQuantity -= item.Quantity;
        }

        // Record Payment (Credit Card vs Cash on Delivery)
        var isCod = string.Equals(dto.PaymentMethod, "CashOnDelivery", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(dto.PaymentMethod, "COD", StringComparison.OrdinalIgnoreCase);

        var lastFour = isCod 
            ? "COD"
            : (dto.CardNumber?.Length >= 4 ? dto.CardNumber.Substring(dto.CardNumber.Length - 4) : "4242");

        var payment = new Payment
        {
            OrderId = order.Id,
            Amount = totalAmount,
            PaymentMethod = isCod ? "CashOnDelivery" : (string.IsNullOrWhiteSpace(dto.PaymentMethod) ? "CreditCard" : dto.PaymentMethod),
            TransactionId = isCod ? $"COD-{Guid.NewGuid().ToString("N")[..10].ToUpper()}" : $"TXN-{Guid.NewGuid().ToString("N")[..12].ToUpper()}",
            Status = isCod ? "PendingDelivery" : "Completed",
            CardLastFour = lastFour,
            PaidAt = DateTime.UtcNow
        };
        await _context.Payments.AddAsync(payment);

        // Clear user's cart
        _context.CartItems.RemoveRange(cartItems);

        await _context.SaveChangesAsync();

        return Ok(await MapToDto(order.Id));
    }

    [HttpGet("my-orders")]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetMyOrders()
    {
        var userId = GetCurrentUserId();
        var orders = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.Payment)
            .Include(o => o.Items)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var dtos = orders.Select(o => new OrderDto(
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

        return Ok(dtos);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOrderById(int id)
    {
        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        var order = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.Payment)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
        {
            return NotFound(new { message = "Order not found." });
        }

        // If not admin, verify ownership
        if (userRole != "Admin" && order.UserId != userId)
        {
            return Forbid();
        }

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

    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<OrderDto>> CancelOrder(int id, [FromBody] CancelOrderRequest? request = null)
    {
        var userId = GetCurrentUserId();
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        var order = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.Payment)
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
        {
            return NotFound(new { message = "Order not found." });
        }

        // Verify ownership (unless Admin)
        if (userRole != "Admin" && order.UserId != userId)
        {
            return Forbid();
        }

        if (order.Status == "Cancelled")
        {
            return BadRequest(new { message = "This order has already been cancelled." });
        }

        if (order.Status == "Shipped" || order.Status == "Delivered")
        {
            return BadRequest(new { message = $"Cannot cancel order once it has been {order.Status.ToLower()}. Please contact white-glove customer support." });
        }

        order.Status = "Cancelled";
        if (!string.IsNullOrWhiteSpace(request?.Reason))
        {
            order.Notes = string.IsNullOrWhiteSpace(order.Notes)
                ? $"Cancellation Reason: {request.Reason}"
                : $"{order.Notes} | Cancellation Reason: {request.Reason}";
        }

        // 1. Restore product inventory stock
        foreach (var item in order.Items)
        {
            if (item.Product != null)
            {
                item.Product.StockQuantity += item.Quantity;
            }
        }

        // 2. Mark payment as Refunded (or Voided if Cash on Delivery)
        if (order.Payment != null)
        {
            order.Payment.Status = order.Payment.PaymentMethod == "CashOnDelivery" ? "Voided" : "Refunded";
        }

        await _context.SaveChangesAsync();

        return Ok(await MapToDto(order.Id));
    }

    private async Task<OrderDto> MapToDto(int orderId)
    {
        var order = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.Payment)
            .Include(o => o.Items)
            .FirstAsync(o => o.Id == orderId);

        return new OrderDto(
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
        );
    }
}

