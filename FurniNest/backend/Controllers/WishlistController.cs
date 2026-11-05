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
public class WishlistController : ControllerBase
{
    private readonly FurniNestDbContext _context;

    public WishlistController(FurniNestDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(idClaim, out var id) ? id : 0;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WishlistItemDto>>> GetWishlist()
    {
        var userId = GetCurrentUserId();
        var items = await _context.WishlistItems
            .Include(w => w.Product)
            .ThenInclude(p => p!.Category)
            .Where(w => w.UserId == userId)
            .OrderByDescending(w => w.AddedAt)
            .Select(w => new WishlistItemDto(
                w.Id,
                w.ProductId,
                w.Product != null ? w.Product.Name : "",
                w.Product != null ? w.Product.Slug : "",
                w.Product != null ? w.Product.Price : 0,
                w.Product != null ? w.Product.OriginalPrice : null,
                w.Product != null ? w.Product.PrimaryImageUrl : "",
                w.Product != null ? w.Product.Material : "",
                w.Product != null ? w.Product.Dimensions : "",
                w.Product != null ? w.Product.StockQuantity : 0,
                w.Product != null && w.Product.Category != null ? w.Product.Category.Name : "",
                w.AddedAt
            ))
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost("{productId:int}")]
    public async Task<ActionResult> AddToWishlist(int productId)
    {
        var userId = GetCurrentUserId();
        var product = await _context.Products.FindAsync(productId);
        if (product == null || !product.IsActive)
        {
            return NotFound(new { message = "Product not found." });
        }

        var existing = await _context.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);

        if (existing != null)
        {
            return Ok(new { message = "Item already in your wishlist." });
        }

        var wishItem = new WishlistItem
        {
            UserId = userId,
            ProductId = productId,
            AddedAt = DateTime.UtcNow
        };

        await _context.WishlistItems.AddAsync(wishItem);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Saved to your wishlist!" });
    }

    [HttpDelete("{productId:int}")]
    public async Task<ActionResult> RemoveFromWishlist(int productId)
    {
        var userId = GetCurrentUserId();
        var item = await _context.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);

        if (item != null)
        {
            _context.WishlistItems.Remove(item);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Removed from wishlist." });
    }
}

