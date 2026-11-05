using Microsoft.EntityFrameworkCore;
using FurniNest.Api.Models;

namespace FurniNest.Api.Data;

public class FurniNestDbContext : DbContext
{
    public FurniNestDbContext(DbContextOptions<FurniNestDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
    public DbSet<EmailOtp> EmailOtps => Set<EmailOtp>();
    public DbSet<UserPasskey> UserPasskeys => Set<UserPasskey>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Product
        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Product>()
            .Property(p => p.OriginalPrice)
            .HasPrecision(18, 2);

        // CartItem
        modelBuilder.Entity<CartItem>()
            .HasIndex(ci => new { ci.UserId, ci.ProductId })
            .IsUnique();

        // Order
        modelBuilder.Entity<Order>()
            .HasIndex(o => o.OrderNumber)
            .IsUnique();

        modelBuilder.Entity<Order>()
            .Property(o => o.Subtotal)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Order>()
            .Property(o => o.DiscountAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Coupon>()
            .HasIndex(c => c.Code)
            .IsUnique();

        modelBuilder.Entity<Coupon>()
            .Property(c => c.DiscountPercent)
            .HasPrecision(5, 2);

        modelBuilder.Entity<Coupon>()
            .Property(c => c.MaxDiscountAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Coupon>()
            .Property(c => c.MinOrderAmount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<WishlistItem>()
            .HasIndex(w => new { w.UserId, w.ProductId })
            .IsUnique();

        modelBuilder.Entity<Order>()
            .Property(o => o.ShippingFee)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Order>()
            .Property(o => o.Tax)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Order>()
            .Property(o => o.TotalAmount)
            .HasPrecision(18, 2);

        // OrderItem
        modelBuilder.Entity<OrderItem>()
            .Property(oi => oi.UnitPrice)
            .HasPrecision(18, 2);

        // Payment
        modelBuilder.Entity<Payment>()
            .Property(p => p.Amount)
            .HasPrecision(18, 2);

        // EmailOtp
        modelBuilder.Entity<EmailOtp>()
            .HasIndex(o => new { o.Email, o.Purpose });

        // UserPasskey
        modelBuilder.Entity<UserPasskey>()
            .HasIndex(p => p.CredentialId)
            .IsUnique();
    }
}

