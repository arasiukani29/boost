namespace FurniNest.Api.Models;

public class EmailOtp
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
    public string Purpose { get; set; } = "Registration"; // "Registration" or "Login"

    // For registration: stores JSON { fullName, passwordHash, city }
    public string? PendingRegistrationData { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public bool IsUsed { get; set; }
    public int Attempts { get; set; }
}

