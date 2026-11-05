using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using FurniNest.Api.Data;
using FurniNest.Api.Models;

namespace FurniNest.Api.Services;

public interface IOtpService
{
    Task<(string OtpCode, EmailOtp Entity)> GenerateAndStoreOtp(string email, string purpose, string? pendingData = null);
    Task<EmailOtp?> ValidateOtp(string email, string otpCode, string purpose);
}

public class OtpService : IOtpService
{
    private readonly FurniNestDbContext _context;
    private readonly ILogger<OtpService> _logger;

    public OtpService(FurniNestDbContext context, ILogger<OtpService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<(string OtpCode, EmailOtp Entity)> GenerateAndStoreOtp(string email, string purpose, string? pendingData = null)
    {
        // Rate limit: max 5 OTPs per email per 10 minutes
        var recentCount = await _context.EmailOtps
            .CountAsync(o => o.Email == email && o.CreatedAt > DateTime.UtcNow.AddMinutes(-10));

        if (recentCount >= 5)
        {
            throw new InvalidOperationException("Too many OTP requests. Please wait a few minutes before trying again.");
        }

        // Invalidate any previous unused OTPs for this email & purpose
        var oldOtps = await _context.EmailOtps
            .Where(o => o.Email == email && o.Purpose == purpose && !o.IsUsed)
            .ToListAsync();
        foreach (var old in oldOtps)
        {
            old.IsUsed = true;
        }

        // Generate cryptographically secure 6-digit code
        var code = GenerateSecureCode();

        var otp = new EmailOtp
        {
            Email = email.ToLower().Trim(),
            OtpCode = code,
            Purpose = purpose,
            PendingRegistrationData = pendingData,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(5),
            IsUsed = false,
            Attempts = 0
        };

        await _context.EmailOtps.AddAsync(otp);
        await _context.SaveChangesAsync();

        _logger.LogInformation("OTP generated for {Email} [{Purpose}]: {Code}", email, purpose, code);

        return (code, otp);
    }

    public async Task<EmailOtp?> ValidateOtp(string email, string otpCode, string purpose)
    {
        var normalizedEmail = email.ToLower().Trim();

        var otp = await _context.EmailOtps
            .Where(o => o.Email == normalizedEmail && o.Purpose == purpose && !o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp == null)
        {
            return null;
        }

        // Max attempts check
        otp.Attempts++;
        if (otp.Attempts > 3)
        {
            otp.IsUsed = true;
            await _context.SaveChangesAsync();
            return null;
        }

        // Expiry check
        if (DateTime.UtcNow > otp.ExpiresAt)
        {
            otp.IsUsed = true;
            await _context.SaveChangesAsync();
            return null;
        }

        // Code match
        if (otp.OtpCode != otpCode.Trim())
        {
            await _context.SaveChangesAsync();
            return null;
        }

        // Valid! Mark as used
        otp.IsUsed = true;
        await _context.SaveChangesAsync();

        return otp;
    }

    private static string GenerateSecureCode()
    {
        var bytes = RandomNumberGenerator.GetBytes(4);
        var num = BitConverter.ToUInt32(bytes, 0) % 900000 + 100000;
        return num.ToString();
    }
}

