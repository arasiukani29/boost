namespace FurniNest.Api.Models;

public class Payment
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public Order? Order { get; set; }

    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "CreditCard"; // "CreditCard", "PayPal", "BankTransfer", "ApplePay"
    public string TransactionId { get; set; } = string.Empty;
    public string Status { get; set; } = "Completed"; // "Pending", "Completed", "Failed", "Refunded"
    public string? CardLastFour { get; set; }
    public DateTime PaidAt { get; set; } = DateTime.UtcNow;
}

