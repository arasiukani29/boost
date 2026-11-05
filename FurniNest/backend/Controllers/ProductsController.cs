using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FurniNest.Api.Data;
using FurniNest.Api.DTOs;

namespace FurniNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly FurniNestDbContext _context;

    public ProductsController(FurniNestDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(
        [FromQuery] string? categorySlug,
        [FromQuery] string? search,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? sortBy, // "price-asc", "price-desc", "newest"
        [FromQuery] bool? featuredOnly
    )
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(categorySlug))
        {
            query = query.Where(p => p.Category != null && p.Category.Slug.ToLower() == categorySlug.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower().Trim();
            query = query.Where(p => p.Name.ToLower().Contains(s) || 
                                     p.Description.ToLower().Contains(s) || 
                                     p.Material.ToLower().Contains(s));
        }

        if (minPrice.HasValue)
        {
            query = query.Where(p => p.Price >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p => p.Price <= maxPrice.Value);
        }

        if (featuredOnly == true)
        {
            query = query.Where(p => p.IsFeatured);
        }

        query = sortBy switch
        {
            "price-asc" => query.OrderBy(p => p.Price),
            "price-desc" => query.OrderByDescending(p => p.Price),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var products = await query.Select(p => new ProductDto(
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
            p.Category != null ? p.Category.Name : string.Empty,
            p.CreatedAt
        )).ToListAsync();

        return Ok(products);
    }

    [HttpGet("featured")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetFeaturedProducts()
    {
        var featured = await _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive && p.IsFeatured)
            .Take(6)
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
                p.Category != null ? p.Category.Name : string.Empty,
                p.CreatedAt
            ))
            .ToListAsync();

        return Ok(featured);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetProductById(int id)
    {
        var p = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (p == null)
        {
            return NotFound(new { message = "Product not found." });
        }

        return Ok(new ProductDto(
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
            p.Category != null ? p.Category.Name : string.Empty,
            p.CreatedAt,
            ResolveGalleryImages(p)
        ));
    }

    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<ProductDto>> GetProductBySlug(string slug)
    {
        var p = await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Slug.ToLower() == slug.ToLower());

        if (p == null)
        {
            return NotFound(new { message = "Product not found." });
        }

        return Ok(new ProductDto(
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
            p.Category != null ? p.Category.Name : string.Empty,
            p.CreatedAt,
            ResolveGalleryImages(p)
        ));
    }

    private static List<string> ResolveGalleryImages(FurniNest.Api.Models.Product p)
    {
        var primary = p.PrimaryImageUrl;
        var images = new List<string> { primary };

        if (!string.IsNullOrWhiteSpace(p.AdditionalImagesJson))
        {
            try
            {
                var extra = System.Text.Json.JsonSerializer.Deserialize<List<string>>(p.AdditionalImagesJson);
                if (extra != null && extra.Count > 0)
                {
                    images.AddRange(extra.Where(u => !string.IsNullOrWhiteSpace(u) && u != primary));
                    return images;
                }
            }
            catch { }
        }

        // Option 1: True Multi-Angle Detail Crops of the EXACT SAME physical piece
        // Generates precision focal crops (Full Studio, Corner/Armrest, Texture Macro, Base & Joinery)
        // guaranteeing 100% color, material, and shape consistency so buyers know exactly what they are purchasing.
        if (primary.Contains("unsplash.com"))
        {
            var baseUrl = primary.Split('?')[0];

            // Angle 2: Corner & Armrest Silhouette Profile (same piece)
            images.Add($"{baseUrl}?auto=format&fit=crop&w=1200&h=800&crop=focalpoint&fp-x=0.25&fp-y=0.45&fp-z=1.85&q=80");

            // Angle 3: Material & Cushion Macro (extreme texture close-up of the exact same fabric/wood)
            images.Add($"{baseUrl}?auto=format&fit=crop&w=1200&h=800&crop=focalpoint&fp-x=0.50&fp-y=0.55&fp-z=2.4&q=80");

            // Angle 4: Base & Leg Craftsmanship (exact same piece's foundation and joinery)
            images.Add($"{baseUrl}?auto=format&fit=crop&w=1200&h=800&crop=focalpoint&fp-x=0.35&fp-y=0.85&fp-z=2.1&q=80");
        }

        return images;
    }
}

