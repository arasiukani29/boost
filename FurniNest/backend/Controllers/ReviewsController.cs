using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FurniNest.Api.Data;
using FurniNest.Api.DTOs;
using FurniNest.Api.Models;

namespace FurniNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly FurniNestDbContext _context;

    public ReviewsController(FurniNestDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(idClaim, out var id) ? id : 0;
    }

    [HttpGet("product/{productId:int}")]
    public async Task<ActionResult<ProductReviewsSummaryDto>> GetProductReviews(int productId)
    {
        var reviews = await _context.ProductReviews
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ProductReviewDto(
                r.Id,
                r.ProductId,
                r.ReviewerName,
                r.Rating,
                r.Title,
                r.Comment,
                r.IsVerifiedPurchase,
                r.CreatedAt,
                r.ImageUrl
            ))
            .ToListAsync();

        var total = reviews.Count;
        var avg = total > 0 ? Math.Round(reviews.Average(r => r.Rating), 1) : 5.0;

        return Ok(new ProductReviewsSummaryDto(productId, avg, total, reviews));
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ProductReviewDto>> CreateReview([FromBody] CreateReviewRequest request)
    {
        var userId = GetCurrentUserId();
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        var product = await _context.Products.FindAsync(request.ProductId);
        if (product == null) return NotFound(new { message = "Product not found." });

        if (request.Rating < 1 || request.Rating > 5)
        {
            return BadRequest(new { message = "Rating must be between 1 and 5 stars." });
        }

        var review = new ProductReview
        {
            ProductId = request.ProductId,
            UserId = userId,
            ReviewerName = user.FullName,
            Rating = request.Rating,
            Title = request.Title,
            Comment = request.Comment,
            ImageUrl = request.ImageUrl,
            IsVerifiedPurchase = true,
            CreatedAt = DateTime.UtcNow
        };

        await _context.ProductReviews.AddAsync(review);
        await _context.SaveChangesAsync();

        return Ok(new ProductReviewDto(
            review.Id,
            review.ProductId,
            review.ReviewerName,
            review.Rating,
            review.Title,
            review.Comment,
            review.IsVerifiedPurchase,
            review.CreatedAt,
            review.ImageUrl
        ));
    }
}

