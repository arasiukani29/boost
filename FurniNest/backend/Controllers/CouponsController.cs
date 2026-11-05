using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FurniNest.Api.Data;
using FurniNest.Api.DTOs;

namespace FurniNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponsController : ControllerBase
{
    private readonly FurniNestDbContext _context;

    public CouponsController(FurniNestDbContext context)
    {
        _context = context;
    }

    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<CouponDto>>> GetActiveCoupons()
    {
        var coupons = await _context.Coupons
            .Where(c => c.IsActive && (c.ExpiresAt == null || c.ExpiresAt > DateTime.UtcNow))
            .Select(c => new CouponDto(
                c.Id,
                c.Code,
                c.Description,
                c.DiscountPercent,
                c.MaxDiscountAmount,
                c.MinOrderAmount,
                c.IsActive
            ))
            .ToListAsync();

        return Ok(coupons);
    }

    [HttpPost("validate")]
    public async Task<ActionResult<CouponValidationResultDto>> ValidateCoupon([FromBody] ValidateCouponRequest request)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code.ToUpper() == code);

        if (coupon == null || !coupon.IsActive)
        {
            return Ok(new CouponValidationResultDto(false, code, "Invalid or expired promo code.", 0, request.OrderSubtotal));
        }

        if (coupon.ExpiresAt.HasValue && coupon.ExpiresAt < DateTime.UtcNow)
        {
            return Ok(new CouponValidationResultDto(false, code, "This coupon has expired.", 0, request.OrderSubtotal));
        }

        if (request.OrderSubtotal < coupon.MinOrderAmount)
        {
            return Ok(new CouponValidationResultDto(
                false, 
                code, 
                $"Minimum cart value of ₹{coupon.MinOrderAmount:N0} required to apply this voucher.", 
                0, 
                request.OrderSubtotal
            ));
        }

        var discount = (request.OrderSubtotal * coupon.DiscountPercent) / 100m;
        if (coupon.MaxDiscountAmount.HasValue && discount > coupon.MaxDiscountAmount.Value)
        {
            discount = coupon.MaxDiscountAmount.Value;
        }

        discount = Math.Round(discount, 2);
        var newSubtotal = request.OrderSubtotal - discount;

        return Ok(new CouponValidationResultDto(
            true,
            code,
            $"Coupon applied! You saved ₹{discount:N0} ({coupon.DiscountPercent}% off).",
            discount,
            newSubtotal
        ));
    }
}

