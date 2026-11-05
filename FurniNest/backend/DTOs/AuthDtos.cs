namespace FurniNest.Api.DTOs;

public record RegisterRequest(
    string FullName,
    string Email,
    string Password,
    string? PhoneNumber,
    string? Address,
    string? City,
    string? PostalCode
);

public record LoginRequest(
    string Email,
    string Password
);

public record AuthResponse(
    int Id,
    string FullName,
    string Email,
    string Role,
    string Token
);

public record UserProfileDto(
    int Id,
    string FullName,
    string Email,
    string Role,
    string? PhoneNumber,
    string? Address,
    string? City,
    string? PostalCode
);

// OTP Registration (2-step)
public record RegisterInitRequest(
    string FullName,
    string Email,
    string Password,
    string? City
);

public record RegisterVerifyRequest(
    string Email,
    string Otp
);

// OTP Login (passwordless)
public record SendLoginOtpRequest(
    string Email
);

public record VerifyLoginOtpRequest(
    string Email,
    string Otp
);

// Forgot & Reset Password
public record ForgotPasswordRequest(
    string Email
);

public record ResetPasswordRequest(
    string Email,
    string Otp,
    string NewPassword
);

public record OtpSentResponse(
    bool Success,
    string Message,
    string? DevOtpHint = null // Only populated in Development mode
);

// Passkey DTOs
public record PasskeyLoginChallengeRequest(
    string? Email = null
);

public record PasskeyChallengeResponse(
    string Challenge,
    string RpId,
    string RpName,
    string? UserId = null,
    string? UserName = null,
    string? UserDisplayName = null,
    List<string>? AllowedCredentialIds = null
);

public record PasskeyRegisterVerifyRequest(
    string CredentialId,
    string PublicKey,
    string DeviceName
);

public record PasskeyLoginVerifyRequest(
    string CredentialId,
    string? AuthenticatorData = null,
    string? Signature = null,
    string? ClientDataJson = null
);

