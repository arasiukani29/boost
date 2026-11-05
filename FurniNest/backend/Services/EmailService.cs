using SendGrid;
using SendGrid.Helpers.Mail;

namespace FurniNest.Api.Services;

public interface IEmailService
{
    Task SendOtpEmail(string toEmail, string recipientName, string otpCode, string purpose);
}

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;
    private readonly IConfiguration _config;

    public EmailService(ILogger<EmailService> logger, IConfiguration config)
    {
        _logger = logger;
        _config = config;
    }

    public async Task SendOtpEmail(string toEmail, string recipientName, string otpCode, string purpose)
    {
        var subject = purpose == "Registration"
            ? "🛋️ FurniNest — Verify Your Email Address"
            : "🔐 FurniNest — Your Sign-In Verification Code";

        var purposeLabel = purpose == "Registration"
            ? "complete your registration"
            : "sign in to your account";

        var plainText = $"Hello {recipientName},\n\nYour FurniNest verification code is: {otpCode}\n\nThis code is valid for 5 minutes. Never share this code with anyone.\n\nFurniNest Team";

        var htmlBody = $@"
<!DOCTYPE html>
<html>
<head><meta charset=""UTF-8""></head>
<body style=""margin:0;padding:0;font-family:'Segoe UI',system-ui,sans-serif;background:#f8fafc;"">
  <div style=""max-width:480px;margin:2rem auto;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);"">
    <div style=""background:#0f172a;padding:1.5rem 2rem;text-align:center;"">
      <h1 style=""margin:0;color:#ffffff;font-size:1.5rem;"">🛋️ Furni<span style=""color:#b45309;"">Nest</span></h1>
      <p style=""margin:0.5rem 0 0;color:#94a3b8;font-size:0.85rem;"">Handcrafted Solid Wood Furniture</p>
    </div>
    <div style=""padding:2rem;"">
      <p style=""color:#334155;font-size:1rem;margin:0 0 1rem;"">
        Hello <strong>{recipientName}</strong>,
      </p>
      <p style=""color:#475569;font-size:0.92rem;line-height:1.6;margin:0 0 1.5rem;"">
        Use the verification code below to {purposeLabel}. This code is valid for <strong>5 minutes</strong>.
      </p>
      <div style=""background:#fffbeb;border:2px dashed #b45309;border-radius:10px;padding:1.25rem;text-align:center;margin:0 0 1.5rem;"">
        <span style=""font-size:2.5rem;font-weight:800;letter-spacing:0.5rem;color:#0f172a;font-family:monospace;"">{otpCode}</span>
      </div>
      <p style=""color:#94a3b8;font-size:0.8rem;line-height:1.5;margin:0;"">
        🔒 If you did not request this code, please ignore this email. Never share your OTP with anyone.<br/>
        This code expires at {DateTime.UtcNow.AddMinutes(5):HH:mm} UTC.
      </p>
    </div>
    <div style=""background:#f1f5f9;padding:1rem 2rem;text-align:center;border-top:1px solid #e2e8f0;"">
      <p style=""margin:0;color:#94a3b8;font-size:0.75rem;"">
        © {DateTime.UtcNow.Year} FurniNest Studio Inc. — Handcrafted with ❤️ in India
      </p>
    </div>
  </div>
</body>
</html>";

        // Always log to console for dev visibility
        _logger.LogWarning(
            "═══════════════════════════════════════════\n" +
            "  📧 EMAIL OTP [{Purpose}]\n" +
            "  To: {Email}\n" +
            "  Code: {OtpCode}\n" +
            "═══════════════════════════════════════════",
            purpose, toEmail, otpCode);

        // ─── 1. SendGrid Mail Delivery ───
        var sendGridApiKey = _config["SendGrid:ApiKey"] ?? Environment.GetEnvironmentVariable("SENDGRID_API_KEY");
        if (!string.IsNullOrWhiteSpace(sendGridApiKey))
        {
            try
            {
                var fromEmail = _config["SendGrid:FromEmail"] ?? "noreply@furninest.com";
                var fromName = _config["SendGrid:FromName"] ?? "FurniNest";

                var client = new SendGridClient(sendGridApiKey);
                var from = new EmailAddress(fromEmail, fromName);
                var to = new EmailAddress(toEmail, recipientName);
                var msg = MailHelper.CreateSingleEmail(from, to, subject, plainText, htmlBody);

                var response = await client.SendEmailAsync(msg);

                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("✅ SendGrid: Successfully dispatched OTP email to {Email} (Status: {StatusCode})", toEmail, response.StatusCode);
                    return; // Email sent successfully via SendGrid!
                }
                else
                {
                    var responseBody = await response.Body.ReadAsStringAsync();
                    _logger.LogWarning("⚠️ SendGrid returned error status {StatusCode}: {ResponseBody}", response.StatusCode, responseBody);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ SendGrid delivery failed for {Email}", toEmail);
            }
        }

        // ─── 2. Optional Fallback to SMTP (if SendGrid not configured) ───
        var smtpHost = _config["Smtp:Host"];
        if (!string.IsNullOrWhiteSpace(smtpHost))
        {
            try
            {
                var smtpPort = int.Parse(_config["Smtp:Port"] ?? "587");
                var smtpUser = _config["Smtp:Username"] ?? "";
                var smtpPass = _config["Smtp:Password"] ?? "";
                var fromEmail = _config["Smtp:FromEmail"] ?? "noreply@furninest.com";

                using var client = new System.Net.Mail.SmtpClient(smtpHost, smtpPort)
                {
                    Credentials = new System.Net.NetworkCredential(smtpUser, smtpPass),
                    EnableSsl = true
                };

                var message = new System.Net.Mail.MailMessage
                {
                    From = new System.Net.Mail.MailAddress(fromEmail, "FurniNest"),
                    Subject = subject,
                    Body = htmlBody,
                    IsBodyHtml = true
                };
                message.To.Add(toEmail);

                await client.SendMailAsync(message);
                _logger.LogInformation("✅ SMTP: Dispatched OTP email to {Email}", toEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ SMTP delivery failed for {Email}", toEmail);
            }
        }
    }
}
