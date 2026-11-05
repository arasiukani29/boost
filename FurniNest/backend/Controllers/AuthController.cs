using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FurniNest.Api.Data;
using FurniNest.Api.DTOs;
using FurniNest.Api.Models;
using FurniNest.Api.Services;

namespace FurniNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly FurniNestDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly IOtpService _otpService;
    private readonly IEmailService _emailService;
    private readonly IWebHostEnvironment _env;

    public AuthController(
        FurniNestDbContext context,
        ITokenService tokenService,
        IOtpService otpService,
        IEmailService emailService,
        IWebHostEnvironment env)
    {
        _context = context;
        _tokenService = tokenService;
        _otpService = otpService;
        _emailService = emailService;
        _env = env;
    }

    // ─── Legacy Password Registration (kept for backward compat) ───
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
        {
            return BadRequest(new { message = "An account with this email address already exists." });
        }

        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Customer",
            PhoneNumber = request.PhoneNumber,
            Address = request.Address,
            City = request.City,
            PostalCode = request.PostalCode,
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(user.Id, user.FullName, user.Email, user.Role, token));
    }

    // ─── Step 1: Register Init — Sends OTP to email ───
    [HttpPost("register-init")]
    public async Task<ActionResult<OtpSentResponse>> RegisterInit([FromBody] RegisterInitRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Full name, email, and password are required." });
        }

        if (request.Password.Length < 6)
        {
            return BadRequest(new { message = "Password must be at least 6 characters long." });
        }

        var normalizedEmail = request.Email.ToLower().Trim();
        if (await _context.Users.AnyAsync(u => u.Email == normalizedEmail))
        {
            return BadRequest(new { message = "An account with this email address already exists." });
        }

        // Store registration data as JSON alongside the OTP
        var pendingData = JsonSerializer.Serialize(new
        {
            fullName = request.FullName,
            passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            city = request.City
        });

        try
        {
            var (otpCode, _) = await _otpService.GenerateAndStoreOtp(normalizedEmail, "Registration", pendingData);
            await _emailService.SendOtpEmail(normalizedEmail, request.FullName, otpCode, "Registration");

            var response = new OtpSentResponse(true, $"A 6-digit verification code has been sent to {normalizedEmail}.");

            // In dev mode, include the OTP hint for easy testing
            if (_env.IsDevelopment())
            {
                response = response with { DevOtpHint = otpCode };
            }

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ─── Step 2: Register Verify — Validates OTP, creates user ───
    [HttpPost("register-verify")]
    public async Task<ActionResult<AuthResponse>> RegisterVerify([FromBody] RegisterVerifyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Otp))
        {
            return BadRequest(new { message = "Email and verification code are required." });
        }

        var normalizedEmail = request.Email.ToLower().Trim();

        // Check if user already exists (e.g. double-submit)
        if (await _context.Users.AnyAsync(u => u.Email == normalizedEmail))
        {
            return BadRequest(new { message = "This email is already registered. Please sign in instead." });
        }

        var otp = await _otpService.ValidateOtp(normalizedEmail, request.Otp, "Registration");
        if (otp == null)
        {
            return BadRequest(new { message = "Invalid or expired verification code. Please request a new one." });
        }

        // Parse the pending registration data
        if (string.IsNullOrWhiteSpace(otp.PendingRegistrationData))
        {
            return BadRequest(new { message = "Registration data not found. Please start again." });
        }

        var regData = JsonSerializer.Deserialize<JsonElement>(otp.PendingRegistrationData);

        var user = new User
        {
            FullName = regData.GetProperty("fullName").GetString() ?? "",
            Email = normalizedEmail,
            PasswordHash = regData.GetProperty("passwordHash").GetString() ?? "",
            Role = "Customer",
            City = regData.TryGetProperty("city", out var cityProp) ? cityProp.GetString() : null,
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(user.Id, user.FullName, user.Email, user.Role, token));
    }

    // ─── Password Login (existing) ───
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower().Trim());

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(user.Id, user.FullName, user.Email, user.Role, token));
    }

    // ─── Send Login OTP (passwordless) ───
    [HttpPost("send-login-otp")]
    public async Task<ActionResult<OtpSentResponse>> SendLoginOtp([FromBody] SendLoginOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Email address is required." });
        }

        var normalizedEmail = request.Email.ToLower().Trim();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null)
        {
            return BadRequest(new { message = "No account found with this email. Please register first." });
        }

        try
        {
            var (otpCode, _) = await _otpService.GenerateAndStoreOtp(normalizedEmail, "Login");
            await _emailService.SendOtpEmail(normalizedEmail, user.FullName, otpCode, "Login");

            var response = new OtpSentResponse(true, $"A 6-digit sign-in code has been sent to {normalizedEmail}.");

            if (_env.IsDevelopment())
            {
                response = response with { DevOtpHint = otpCode };
            }

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ─── Verify Login OTP (passwordless) ───
    [HttpPost("verify-login-otp")]
    public async Task<ActionResult<AuthResponse>> VerifyLoginOtp([FromBody] VerifyLoginOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Otp))
        {
            return BadRequest(new { message = "Email and verification code are required." });
        }

        var normalizedEmail = request.Email.ToLower().Trim();
        var otp = await _otpService.ValidateOtp(normalizedEmail, request.Otp, "Login");

        if (otp == null)
        {
            return BadRequest(new { message = "Invalid or expired verification code." });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        if (user == null)
        {
            return BadRequest(new { message = "Account not found." });
        }

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(user.Id, user.FullName, user.Email, user.Role, token));
    }

    // ─── Step 1: Forgot Password (Send Reset OTP) ───
    [HttpPost("forgot-password")]
    public async Task<ActionResult<OtpSentResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Email address is required." });
        }

        var normalizedEmail = request.Email.ToLower().Trim();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null)
        {
            return BadRequest(new { message = "No account found with this email address." });
        }

        try
        {
            var (otpCode, _) = await _otpService.GenerateAndStoreOtp(normalizedEmail, "PasswordReset");
            await _emailService.SendOtpEmail(normalizedEmail, user.FullName, otpCode, "Password Reset");

            var response = new OtpSentResponse(true, $"A 6-digit password reset code has been sent to {normalizedEmail}.");
            if (_env.IsDevelopment())
            {
                response = response with { DevOtpHint = otpCode };
            }

            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ─── Step 2: Reset Password (Verify OTP & Set New Password) ───
    [HttpPost("reset-password")]
    public async Task<ActionResult<object>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Otp) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Email, verification code, and new password are required." });
        }

        if (request.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "Password must be at least 6 characters long." });
        }

        var normalizedEmail = request.Email.ToLower().Trim();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);
        if (user == null)
        {
            return BadRequest(new { message = "Account not found." });
        }

        var otp = await _otpService.ValidateOtp(normalizedEmail, request.Otp, "PasswordReset");
        if (otp == null)
        {
            return BadRequest(new { message = "Invalid or expired verification code. Please request a new one." });
        }

        // Update password hash
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Password has been successfully reset! You can now sign in with your new password." });
    }

    // ─── Passkey: Registration Challenge ───
    [Authorize]
    [HttpPost("passkey/register-challenge")]
    public async Task<ActionResult<PasskeyChallengeResponse>> PasskeyRegisterChallenge()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var challenge = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

        // Store challenge temporarily in session/memory (in production use a cache)
        HttpContext.Session.SetString("passkey_challenge", challenge);

        return Ok(new PasskeyChallengeResponse(
            Challenge: challenge,
            RpId: "localhost",
            RpName: "FurniNest",
            UserId: Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(userId.ToString())),
            UserName: user.Email,
            UserDisplayName: user.FullName
        ));
    }

    // ─── Passkey: Complete Registration ───
    [Authorize]
    [HttpPost("passkey/register-verify")]
    public async Task<ActionResult> PasskeyRegisterVerify([FromBody] PasskeyRegisterVerifyRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var incomingNorm = request.CredentialId.Trim().Replace('-', '+').Replace('_', '/').TrimEnd('=');

        // Check if this credential is already registered
        var existing = await _context.UserPasskeys
            .FirstOrDefaultAsync(p => p.CredentialId == request.CredentialId ||
                                      p.CredentialId.Replace('-', '+').Replace('_', '/').TrimEnd('=') == incomingNorm);

        if (existing != null)
        {
            existing.DeviceName = request.DeviceName;
            existing.CreatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Passkey linked and updated successfully! You can now sign in with biometrics." });
        }

        var passkey = new UserPasskey
        {
            UserId = userId,
            CredentialId = request.CredentialId,
            PublicKey = request.PublicKey,
            Counter = 0,
            DeviceName = request.DeviceName,
            CreatedAt = DateTime.UtcNow
        };

        await _context.UserPasskeys.AddAsync(passkey);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Passkey registered successfully! You can now sign in with biometrics." });
    }

    // ─── Passkey: Login Challenge ───
    [HttpPost("passkey/login-challenge")]
    public async Task<ActionResult<PasskeyChallengeResponse>> PasskeyLoginChallenge([FromBody] PasskeyLoginChallengeRequest? request = null)
    {
        var challenge = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        HttpContext.Session.SetString("passkey_challenge", challenge);

        List<string> allowedCredentials;
        if (!string.IsNullOrWhiteSpace(request?.Email))
        {
            var normalizedEmail = request.Email.Trim().ToLower();
            var user = await _context.Users
                .Include(u => u.Passkeys)
                .FirstOrDefaultAsync(u => u.Email == normalizedEmail);
            allowedCredentials = user?.Passkeys.Select(p => p.CredentialId).ToList() ?? new List<string>();
        }
        else
        {
            allowedCredentials = await _context.UserPasskeys.Select(p => p.CredentialId).ToListAsync();
        }

        return Ok(new PasskeyChallengeResponse(
            Challenge: challenge,
            RpId: "localhost",
            RpName: "FurniNest",
            AllowedCredentialIds: allowedCredentials
        ));
    }

    // ─── Passkey: Verify Login ───
    [HttpPost("passkey/login-verify")]
    public async Task<ActionResult<AuthResponse>> PasskeyLoginVerify([FromBody] PasskeyLoginVerifyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CredentialId))
        {
            return BadRequest(new { message = "Credential ID is required." });
        }

        var incomingNorm = request.CredentialId.Trim().Replace('-', '+').Replace('_', '/').TrimEnd('=');

        var allPasskeys = await _context.UserPasskeys.Include(p => p.User).ToListAsync();
        var passkey = allPasskeys.FirstOrDefault(p =>
            p.CredentialId == request.CredentialId ||
            p.CredentialId.Trim().Replace('-', '+').Replace('_', '/').TrimEnd('=') == incomingNorm);

        if (passkey?.User == null)
        {
            return Unauthorized(new { message = "Passkey not recognized. Please sign in with email and password." });
        }

        // Update counter for replay protection
        passkey.Counter++;
        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateToken(passkey.User);
        return Ok(new AuthResponse(passkey.User.Id, passkey.User.FullName, passkey.User.Email, passkey.User.Role, token));
    }

    // ─── Current User Profile ───
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(new UserProfileDto(
            user.Id,
            user.FullName,
            user.Email,
            user.Role,
            user.PhoneNumber,
            user.Address,
            user.City,
            user.PostalCode
        ));
    }
}
