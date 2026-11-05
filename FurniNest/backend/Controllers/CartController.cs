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
public class CartController : ControllerBase
{
    private readonly FurniNestDbContext _context;

    public CartController(FurniNestDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(idClaim, out var id) ? id : 0;
    }

    [HttpGet]
    public async Task<ActionResult<CartSummaryDto>> GetCart()
    {
        var userId = GetCurrentUserId();
        var items = await _context.CartItems
            .Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .Select(c => new CartItemDto(
                c.Id,
                c.ProductId,
                c.Product != null ? c.Product.Name : "Item",
                c.Product != null ? c.Product.Slug : "",
                c.Product != null ? c.Product.Price : 0,
                c.Product != null ? c.Product.PrimaryImageUrl : "",
                c.Quantity,
                c.Product != null ? c.Product.StockQuantity : 0,
                (c.Product != null ? c.Product.Price : 0) * c.Quantity
            ))
            .ToListAsync();

        var subtotal = items.Sum(i => i.LineTotal);
        var totalItems = items.Sum(i => i.Quantity);
        var shipping = subtotal > 0 ? (subtotal >= 25000 ? 0m : 1499.00m) : 0m;
        var tax = Math.Round(subtotal * 0.05m, 2);
        var total = subtotal + shipping + tax;

        return Ok(new CartSummaryDto(items, totalItems, subtotal, shipping, tax, total));
    }

    [HttpPost("items")]
    public async Task<ActionResult<CartSummaryDto>> AddToCart([FromBody] AddToCartDto dto)
    {
        var userId = GetCurrentUserId();
        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null || !product.IsActive)
        {
            return NotFound(new { message = "Product not found or unavailable." });
        }

        var existingItem = await _context.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == dto.ProductId);

        if (existingItem != null)
        {
            var requestedTotal = existingItem.Quantity + dto.Quantity;
            if (requestedTotal > product.StockQuantity)
            {
                return BadRequest(new { message = $"Cannot add more. Only {product.StockQuantity} in stock." });
            }
            existingItem.Quantity = requestedTotal;
        }
        else
        {
            if (dto.Quantity > product.StockQuantity)
            {
                return BadRequest(new { message = $"Cannot add item. Only {product.StockQuantity} available in stock." });
            }

            var newItem = new CartItem
            {
                UserId = userId,
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                AddedAt = DateTime.UtcNow
            };
            await _context.CartItems.AddAsync(newItem);
        }

        await _context.SaveChangesAsync();
        return await GetCart();
    }

    [HttpPut("items/{id:int}")]
    public async Task<ActionResult<CartSummaryDto>> UpdateCartItem(int id, [FromBody] UpdateCartItemDto dto)
    {
        var userId = GetCurrentUserId();
        var item = await _context.CartItems
            .Include(c => c.Product)
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (item == null)
        {
            return NotFound(new { message = "Cart item not found." });
        }

        if (dto.Quantity <= 0)
        {
            _context.CartItems.Remove(item);
        }
        else
        {
            if (item.Product != null && dto.Quantity > item.Product.StockQuantity)
            {
                return BadRequest(new { message = $"Requested quantity exceeds available stock ({item.Product.StockQuantity})." });
            }
            item.Quantity = dto.Quantity;
        }

        await _context.SaveChangesAsync();
        return await GetCart();
    }

    [HttpDelete("items/{id:int}")]
    public async Task<ActionResult<CartSummaryDto>> RemoveCartItem(int id)
    {
        var userId = GetCurrentUserId();
        var item = await _context.CartItems.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (item != null)
        {
            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
        }

        return await GetCart();
    }

    [HttpDelete("clear")]
    public async Task<ActionResult> ClearCart()
    {
        var userId = GetCurrentUserId();
        var items = await _context.CartItems.Where(c => c.UserId == userId).ToListAsync();
        _context.CartItems.RemoveRange(items);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Cart cleared." });
    }
}

