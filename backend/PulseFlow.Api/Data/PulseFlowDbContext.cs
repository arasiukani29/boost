using Microsoft.EntityFrameworkCore;
using PulseFlow.Api.Models;

namespace PulseFlow.Api.Data;

public class PulseFlowDbContext : DbContext
{
    public PulseFlowDbContext(DbContextOptions<PulseFlowDbContext> options) : base(options)
    {
    }

    public DbSet<Job> Jobs => Set<Job>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Job>(entity =>
        {
            entity.HasKey(j => j.Id);
            entity.Property(j => j.Name).IsRequired().HasMaxLength(256);
            entity.Property(j => j.Status)
                  .HasConversion<string>()
                  .IsRequired();
            entity.Property(j => j.Progress).IsRequired();
            entity.Property(j => j.CreatedAt).IsRequired();
            entity.Property(j => j.StartedAt);
            entity.Property(j => j.CompletedAt);
            entity.Property(j => j.ErrorMessage).HasMaxLength(1000);

            entity.HasIndex(j => j.Status);
            entity.HasIndex(j => j.CreatedAt);
        });
    }
}
