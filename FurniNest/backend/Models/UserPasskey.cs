namespace FurniNest.Api.Models;

public class UserPasskey
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }

    public string CredentialId { get; set; } = string.Empty; // base64
    public string PublicKey { get; set; } = string.Empty;     // base64
    public long Counter { get; set; }
    public string DeviceName { get; set; } = "Unknown Device";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

