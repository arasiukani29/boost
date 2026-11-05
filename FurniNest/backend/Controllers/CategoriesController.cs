using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FurniNest.Api.Data;
using FurniNest.Api.DTOs;

namespace FurniNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly FurniNestDbContext _context;

    public CategoriesController(FurniNestDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
    {
        var categories = await _context.Categories
            .Include(c => c.Products)
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Slug,
                c.Description,
                c.ImageUrl,
                c.Products.Count(p => p.IsActive)
            ))
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<CategoryDto>> GetCategoryBySlug(string slug)
    {
        var category = await _context.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Slug.ToLower() == slug.ToLower());

        if (category == null)
        {
            return NotFound(new { message = "Category not found." });
        }

        return Ok(new CategoryDto(
            category.Id,
            category.Name,
            category.Slug,
            category.Description,
            category.ImageUrl,
            category.Products.Count(p => p.IsActive)
        ));
    }
}

