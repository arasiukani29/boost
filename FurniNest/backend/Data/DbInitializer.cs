using FurniNest.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FurniNest.Api.Data;

public static class DbInitializer
{
    public static async Task SeedAsync(FurniNestDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        // Ensure schema upgrades for existing database
        try
        {
            await context.Database.ExecuteSqlRawAsync("ALTER TABLE ProductReviews ADD COLUMN ImageUrl TEXT NULL;");
        }
        catch
        {
            // Column already exists or already migrated
        }

        // Ensure normal / affordable price furniture pieces exist
        await SeedNormalPriceProductsAsync(context);

        // Ensure newly curated high-resolution category products exist
        await SeedCuratedCategoryProductsAsync(context);

        // Calibrate product prices and images to realistic, distinct values
        await CalibratePricesAndImagesAsync(context);

        if (await context.Categories.AnyAsync())
        {
            return; // DB has been seeded
        }

        // 1. Seed Users
        var adminPassword = BCrypt.Net.BCrypt.HashPassword("Admin@123");
        var customerPassword = BCrypt.Net.BCrypt.HashPassword("Customer@123");

        var adminUser = new User
        {
            FullName = "Store Administrator",
            Email = "admin@furninest.com",
            PasswordHash = adminPassword,
            Role = "Admin",
            PhoneNumber = "+1 (555) 019-2834",
            Address = "100 Design Studio Ave",
            City = "San Francisco",
            PostalCode = "94103",
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow
        };

        var customerUser = new User
        {
            FullName = "Sarah Jenkins",
            Email = "customer@furninest.com",
            PasswordHash = customerPassword,
            Role = "Customer",
            PhoneNumber = "+1 (555) 349-1102",
            Address = "742 Evergreen Terrace",
            City = "Seattle",
            PostalCode = "98101",
            IsEmailVerified = true,
            CreatedAt = DateTime.UtcNow
        };

        await context.Users.AddRangeAsync(adminUser, customerUser);
        await context.SaveChangesAsync();

        // 2. Seed Categories
        var livingRoom = new Category
        {
            Name = "Living Room",
            Slug = "living-room",
            Description = "Comfortable, handcrafted sofas, lounge chairs, and accent tables designed for relaxed gatherings.",
            ImageUrl = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"
        };

        var bedroom = new Category
        {
            Name = "Bedroom",
            Slug = "bedroom",
            Description = "Serene wooden bed frames, nightstands, and dressers built for restorative comfort.",
            ImageUrl = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
        };

        var diningRoom = new Category
        {
            Name = "Dining Room",
            Slug = "dining-room",
            Description = "Solid hardwood dining tables and ergonomic chairs made to host timeless dinner conversations.",
            ImageUrl = "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80"
        };

        var homeOffice = new Category
        {
            Name = "Home Office",
            Slug = "home-office",
            Description = "Minimalist walnut desks, executive seating, and modular shelving that inspire focused work.",
            ImageUrl = "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80"
        };

        await context.Categories.AddRangeAsync(livingRoom, bedroom, diningRoom, homeOffice);
        await context.SaveChangesAsync();

        // 3. Seed Products
        var products = new List<Product>
        {
            // Living Room
            new Product
            {
                Name = "Nordic Velvet Haven Sofa",
                Slug = "nordic-velvet-haven-sofa",
                Description = "Crafted with kiln-dried FSC-certified hardwood and wrapped in ultra-soft stain-resistant velvet. Deep cushions with high-resilience foam ensure enduring relaxation.",
                Price = 21999.00m,
                OriginalPrice = 26999.00m,
                StockQuantity = 8,
                Dimensions = "88\"W x 38\"D x 34\"H",
                Material = "Kiln-dried Birch Frame, Premium Italian Velvet",
                Color = "Olive Green",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = true,
                CategoryId = livingRoom.Id
            },
            new Product
            {
                Name = "Sora Mid-Century Lounge Chair",
                Slug = "sora-mid-century-lounge-chair",
                Description = "An iconic curved silhouette inspired by Danish design. Features top-grain cognac leather upholstery paired with sculpted solid oak armrests.",
                Price = 9499.00m,
                OriginalPrice = 12999.00m,
                StockQuantity = 15,
                Dimensions = "32\"W x 34\"D x 31\"H",
                Material = "Solid American Oak, Full-Grain Leather",
                Color = "Cognac Tan",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = true,
                CategoryId = livingRoom.Id
            },
            new Product
            {
                Name = "Kyoto Minimalist Coffee Table",
                Slug = "kyoto-minimalist-coffee-table",
                Description = "Low-profile organic table shaped from sustainably sourced walnut with subtle chamfered edges and a matte protective lacquer finish.",
                Price = 6999.00m,
                OriginalPrice = 8999.00m,
                StockQuantity = 12,
                Dimensions = "48\"W x 26\"D x 16\"H",
                Material = "Solid American Black Walnut",
                Color = "Natural Walnut",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = livingRoom.Id
            },

            // Bedroom
            new Product
            {
                Name = "Aura Floating Platform Bed",
                Slug = "aura-floating-platform-bed",
                Description = "A clean floating profile engineered with solid white oak and integrated softly curved headboard. Slatted base provides supreme mattress breathability.",
                Price = 24999.00m,
                OriginalPrice = 29999.00m,
                StockQuantity = 6,
                Dimensions = "84\"W x 86\"L x 40\"H (Queen)",
                Material = "Solid European White Oak",
                Color = "Natural Bleached Oak",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = true,
                CategoryId = bedroom.Id
            },
            new Product
            {
                Name = "Cove Two-Drawer Nightstand",
                Slug = "cove-two-drawer-nightstand",
                Description = "Minimalist nightstand boasting soft-close concealed undermount slides, brushed brass pull tabs, and cord routing aperture.",
                Price = 4499.00m,
                OriginalPrice = 5999.00m,
                StockQuantity = 20,
                Dimensions = "22\"W x 18\"D x 24\"H",
                Material = "White Oak, Brushed Brass Hardware",
                Color = "Muted Honey",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = bedroom.Id
            },
            new Product
            {
                Name = "Solstice 6-Drawer Dresser",
                Slug = "solstice-6-drawer-dresser",
                Description = "Spacious horizontal chest offering deep dovetail drawers, fluted solid wood front panels, and brass-tipped tapered legs.",
                Price = 14999.00m,
                OriginalPrice = 18999.00m,
                StockQuantity = 4,
                Dimensions = "62\"W x 20\"D x 34\"H",
                Material = "Solid Ash Wood, Satin Brass",
                Color = "Smoked Charcoal",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = bedroom.Id
            },

            // Dining Room
            new Product
            {
                Name = "Artisan Extendable Dining Table",
                Slug = "artisan-extendable-dining-table",
                Description = "Seats 6 normally and expands seamlessly with a butterfly leaf to accommodate up to 10 guests. Highlighted by natural wood grain patterns.",
                Price = 19499.00m,
                OriginalPrice = 24999.00m,
                StockQuantity = 5,
                Dimensions = "72\"-96\"W x 38\"D x 30\"H",
                Material = "Solid American Walnut",
                Color = "Warm Walnut",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = true,
                CategoryId = diningRoom.Id
            },
            new Product
            {
                Name = "Elowen Cane Back Dining Chair (Set of 2)",
                Slug = "elowen-cane-back-dining-chair-set-2",
                Description = "Pair of handcrafted French-modern chairs with natural handwoven rattan cane backrests and upholstered linen cushions.",
                Price = 7999.00m,
                OriginalPrice = 9999.00m,
                StockQuantity = 14,
                Dimensions = "20\"W x 22\"D x 33\"H",
                Material = "Solid Beechwood, Handwoven Cane, Linen",
                Color = "Natural & Cream",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = diningRoom.Id
            },

            // Home Office
            new Product
            {
                Name = "Veritas Executive Walnut Desk",
                Slug = "veritas-executive-walnut-desk",
                Description = "A masterclass in modern workspace ergonomics. Integrated power channel, hidden wire-management tray, and twin soft-glide drawers.",
                Price = 12499.00m,
                OriginalPrice = 15999.00m,
                StockQuantity = 7,
                Dimensions = "60\"W x 30\"D x 30\"H",
                Material = "Solid Walnut & Matte Black Steel",
                Color = "Walnut / Matte Black",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = true,
                CategoryId = homeOffice.Id
            },
            new Product
            {
                Name = "Astral Ergonomic Task Chair",
                Slug = "astral-ergonomic-task-chair",
                Description = "Padded high-density memory foam seat covered in breathable Italian mesh with pneumatic seat height adjustment and tilt tension lock.",
                Price = 7999.00m,
                OriginalPrice = 9999.00m,
                StockQuantity = 18,
                Dimensions = "26\"W x 26\"D x 39\"-44\"H",
                Material = "Aluminum Base, Italian Mesh, Vegan Leather",
                Color = "Graphite Black",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1580481077195-c328ad45be8e?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = homeOffice.Id
            }
        };

        await context.Products.AddRangeAsync(products);
        await context.SaveChangesAsync();

        // 4. Seed an initial sample order for the customer
        var sampleOrder = new Order
        {
            OrderNumber = "FN-2026-1042",
            UserId = customerUser.Id,
            Status = "InCrafting",
            Subtotal = 44999.00m,
            ShippingFee = 0.00m,
            Tax = 5399.88m,
            TotalAmount = 50398.88m,
            RecipientName = "Sarah Jenkins",
            ShippingAddress = "B-402, Shivalik Residency, S.G. Highway",
            City = "Ahmedabad",
            State = "Gujarat",
            PostalCode = "380054",
            Phone = "+91 98765 43210",
            TrackingNumber = "BD-882941029",
            CarrierName = "BlueDart Express",
            Notes = "Please call before arrival for gate entry.",
            CreatedAt = DateTime.UtcNow.AddDays(-2)
        };

        await context.Orders.AddAsync(sampleOrder);
        await context.SaveChangesAsync();

        var sampleOrderItem = new OrderItem
        {
            OrderId = sampleOrder.Id,
            ProductId = products[0].Id,
            ProductName = products[0].Name,
            ProductImageUrl = products[0].PrimaryImageUrl,
            UnitPrice = products[0].Price,
            Quantity = 1
        };

        var samplePayment = new Payment
        {
            OrderId = sampleOrder.Id,
            Amount = sampleOrder.TotalAmount,
            PaymentMethod = "CreditCard",
            TransactionId = "TXN-MOCK-994821",
            Status = "Completed",
            CardLastFour = "4242",
            PaidAt = DateTime.UtcNow.AddDays(-2)
        };

        await context.OrderItems.AddAsync(sampleOrderItem);
        await context.Payments.AddAsync(samplePayment);
        await context.SaveChangesAsync();

        // 5. Seed Coupons
        var coupons = new List<Coupon>
        {
            new Coupon
            {
                Code = "WELCOME10",
                Description = "10% off for first-time customers on orders above ₹2,500",
                DiscountPercent = 10.0m,
                MaxDiscountAmount = 3000.0m,
                MinOrderAmount = 2500.0m,
                IsActive = true,
                ExpiresAt = DateTime.UtcNow.AddMonths(12)
            },
            new Coupon
            {
                Code = "FURNI20",
                Description = "20% festive discount on heirloom collections above ₹7,000",
                DiscountPercent = 20.0m,
                MaxDiscountAmount = 5000.0m,
                MinOrderAmount = 7000.0m,
                IsActive = true,
                ExpiresAt = DateTime.UtcNow.AddMonths(12)
            },
            new Coupon
            {
                Code = "WOODCRAFT15",
                Description = "15% off artisanal hardwood pieces on orders above ₹4,000",
                DiscountPercent = 15.0m,
                MaxDiscountAmount = 4000.0m,
                MinOrderAmount = 4000.0m,
                IsActive = true,
                ExpiresAt = DateTime.UtcNow.AddMonths(12)
            },
            new Coupon
            {
                Code = "FESTIVE25",
                Description = "25% Festive Celebration discount on orders above ₹5,000",
                DiscountPercent = 25.0m,
                MaxDiscountAmount = 3500.0m,
                MinOrderAmount = 5000.0m,
                IsActive = true,
                ExpiresAt = DateTime.UtcNow.AddMonths(12)
            },
            new Coupon
            {
                Code = "DIWALI50",
                Description = "50% Mega Festive discount on orders above ₹10,000 (Max ₹5,000)",
                DiscountPercent = 50.0m,
                MaxDiscountAmount = 5000.0m,
                MinOrderAmount = 10000.0m,
                IsActive = true,
                ExpiresAt = DateTime.UtcNow.AddMonths(12)
            },
            new Coupon
            {
                Code = "NEST500",
                Description = "Flat ₹500 instant discount on orders above ₹2,000",
                DiscountPercent = 15.0m,
                MaxDiscountAmount = 500.0m,
                MinOrderAmount = 2000.0m,
                IsActive = true,
                ExpiresAt = DateTime.UtcNow.AddMonths(12)
            },
            new Coupon
            {
                Code = "LUXURY30",
                Description = "30% VIP discount on mastercrafted furniture suites above ₹12,000",
                DiscountPercent = 30.0m,
                MaxDiscountAmount = 6000.0m,
                MinOrderAmount = 12000.0m,
                IsActive = true,
                ExpiresAt = DateTime.UtcNow.AddMonths(12)
            },
            new Coupon
            {
                Code = "FREESHIP",
                Description = "Free White-Glove delivery & assembly credit (Saves up to ₹1,500)",
                DiscountPercent = 10.0m,
                MaxDiscountAmount = 1500.0m,
                MinOrderAmount = 3000.0m,
                IsActive = true,
                ExpiresAt = DateTime.UtcNow.AddMonths(12)
            }
        };
        await context.Coupons.AddRangeAsync(coupons);

        // 6. Seed Sample Customer Reviews
        var reviews = new List<ProductReview>
        {
            new ProductReview
            {
                ProductId = products[0].Id,
                UserId = customerUser.Id,
                ReviewerName = "Sarah Jenkins",
                Rating = 5,
                Title = "Exquisite craftsmanship and ultra comfortable",
                Comment = "The Nordic velvet sofa transformed our living room. Mortise joints feel rock solid, and the olive velvet fabric is remarkably soft yet resistant to dog paws.",
                ImageUrl = "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
                IsVerifiedPurchase = true,
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new ProductReview
            {
                ProductId = products[0].Id,
                UserId = adminUser.Id,
                ReviewerName = "Aarav Mehta",
                Rating = 5,
                Title = "Worth every single rupee",
                Comment = "White glove delivery arrived on time in Ahmedabad. The crew assembled everything in 20 minutes without leaving a speck of dust.",
                ImageUrl = "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80",
                IsVerifiedPurchase = true,
                CreatedAt = DateTime.UtcNow.AddDays(-12)
            },
            new ProductReview
            {
                ProductId = products[1].Id,
                UserId = customerUser.Id,
                ReviewerName = "Pooja Sharma",
                Rating = 5,
                Title = "Stunning Danish aesthetic",
                Comment = "The cognac leather smells divine and the curved wooden arms are pure sculpture. Easily our favorite reading chair.",
                ImageUrl = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
                IsVerifiedPurchase = true,
                CreatedAt = DateTime.UtcNow.AddDays(-8)
            }
        };
        await context.ProductReviews.AddRangeAsync(reviews);

        // 7. Seed Sample Wishlist Item
        var wishItem = new WishlistItem
        {
            UserId = customerUser.Id,
            ProductId = products[3].Id, // Aura Bed
            AddedAt = DateTime.UtcNow.AddDays(-1)
        };
        await context.WishlistItems.AddAsync(wishItem);

        await context.SaveChangesAsync();
    }

    public static async Task SeedNormalPriceProductsAsync(FurniNestDbContext context)
    {
        // Check if normal price products already seeded by specific unique slug
        if (await context.Products.AnyAsync(p => p.Slug == "komorebi-solid-oak-end-table"))
        {
            return;
        }

        var livingRoom = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "living-room");
        var bedroom = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "bedroom");
        var diningRoom = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "dining-room");
        var homeOffice = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "home-office");

        if (livingRoom == null || bedroom == null || diningRoom == null || homeOffice == null)
        {
            return;
        }

        var normalPriceProducts = new List<Product>
        {
            // Living Room Normal / Affordable Essentials
            new Product
            {
                Name = "Komorebi Solid Oak End Table",
                Slug = "komorebi-solid-oak-end-table",
                Description = "Compact minimalist side table crafted from sustainably sourced European oak. Perfect for holding coffee, books, and lamps beside your sofa.",
                Price = 2499.00m,
                OriginalPrice = 3299.00m,
                StockQuantity = 22,
                Dimensions = "18\"W x 18\"D x 20\"H",
                Material = "Solid European White Oak, Natural Wax Finish",
                Color = "Natural Oak",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = true,
                CategoryId = livingRoom.Id
            },
            new Product
            {
                Name = "Nordic Linen Floor Pouf & Ottoman",
                Slug = "nordic-linen-floor-pouf-ottoman",
                Description = "Versatile floor pouf providing extra seating and a relaxed footrest. Features a durable removable cotton linen slipcover with high-resilience foam core.",
                Price = 1899.00m,
                OriginalPrice = 2499.00m,
                StockQuantity = 25,
                Dimensions = "16\"W x 16\"D x 16\"H",
                Material = "Textured Cotton Linen, High-Density Foam, Ash Wood Feet",
                Color = "Sand Beige",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = livingRoom.Id
            },
            new Product
            {
                Name = "Zenith 2-Tier Glass Coffee Table",
                Slug = "zenith-2-tier-glass-coffee-table",
                Description = "Modern dual-tier coffee table featuring shatter-resistant tempered glass top and a lower storage shelf for magazines and art books.",
                Price = 6499.00m,
                OriginalPrice = 7999.00m,
                StockQuantity = 14,
                Dimensions = "36\"W x 20\"D x 18\"H",
                Material = "Tempered Glass, Matte Black Powder-Coated Steel",
                Color = "Smoked Glass / Matte Black",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = livingRoom.Id
            },

            // Bedroom Normal / Affordable Essentials
            new Product
            {
                Name = "Malabar Sheesham Bedside Stool",
                Slug = "malabar-sheesham-bedside-stool",
                Description = "Traditional Indian Sheesham wood accent stool, dual-functioning as a nightstand or compact vanity seat with rich natural timber grain.",
                Price = 2199.00m,
                OriginalPrice = 2999.00m,
                StockQuantity = 18,
                Dimensions = "14\"W x 14\"D x 18\"H",
                Material = "Solid Indian Sheesham (Rosewood)",
                Color = "Warm Honey Teak",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = true,
                CategoryId = bedroom.Id
            },
            new Product
            {
                Name = "Vesta 3-Tier Bamboo Shoe & Storage Rack",
                Slug = "vesta-3-tier-bamboo-shoe-storage-rack",
                Description = "Breathable 3-tier slatted rack holding up to 9 pairs of shoes or bedroom slippers. Lightweight, eco-friendly, and moisture-resistant.",
                Price = 1699.00m,
                OriginalPrice = 2299.00m,
                StockQuantity = 30,
                Dimensions = "28\"W x 11\"D x 19\"H",
                Material = "Steam-Bent Natural Bamboo",
                Color = "Natural Bamboo",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = bedroom.Id
            },
            new Product
            {
                Name = "Haven Floating Wall Bedside Shelf",
                Slug = "haven-floating-wall-bedside-shelf",
                Description = "Wall-mounted space-saving nightstand with smooth glide drawer and open phone charging cubby. Frees up floor space in compact rooms.",
                Price = 3299.00m,
                OriginalPrice = 4199.00m,
                StockQuantity = 16,
                Dimensions = "16\"W x 12\"D x 7\"H",
                Material = "Solid Oak Veneer with Soft-Close Runner",
                Color = "Light Nordic Oak",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = bedroom.Id
            },

            // Dining Room Normal / Affordable Essentials
            new Product
            {
                Name = "Bistro Solid Pine Dining Stools (Set of 2)",
                Slug = "bistro-solid-pine-dining-stools-set-2",
                Description = "Pair of sturdy, stackable round dining stools with carry-hole handles. Ideal for small dining spaces, balconies, and breakfast counters.",
                Price = 2499.00m,
                OriginalPrice = 3199.00m,
                StockQuantity = 20,
                Dimensions = "13\"W x 13\"D x 18\"H",
                Material = "Kiln-Dried Solid Pine Wood",
                Color = "Natural Blonde Wood",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = diningRoom.Id
            },
            new Product
            {
                Name = "Capri Round 2-Seater Cafe Table",
                Slug = "capri-round-2-seater-cafe-table",
                Description = "Compact round dining table perfect for cozy apartments, breakfast nooks, and studio dining with durable heat-resistant top.",
                Price = 5999.00m,
                OriginalPrice = 7499.00m,
                StockQuantity = 12,
                Dimensions = "32\"Dia x 30\"H",
                Material = "Solid Beechwood Legs, Matte White Heat-Resistant Top",
                Color = "Matte White & Beechwood",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = true,
                CategoryId = diningRoom.Id
            },

            // Home Office Normal / Affordable Essentials
            new Product
            {
                Name = "Linear Work-From-Home Study Desk",
                Slug = "linear-work-from-home-study-desk",
                Description = "Streamlined writing and laptop desk with reinforced triangle cross-struts and integrated headphone hook. Easy 15-minute tool-free assembly.",
                Price = 4499.00m,
                OriginalPrice = 5999.00m,
                StockQuantity = 28,
                Dimensions = "40\"W x 20\"D x 30\"H",
                Material = "Powder-Coated Steel Frame, Walnut Wood Top",
                Color = "Walnut / Carbon Black",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = true,
                CategoryId = homeOffice.Id
            },
            new Product
            {
                Name = "Aero Breathable Ergonomic Desk Chair",
                Slug = "aero-breathable-ergonomic-desk-chair",
                Description = "Ergonomic lumbar-supported swivel chair with pneumatic height lift, tilt rocking mechanism, and smooth 360-degree silent nylon castor wheels.",
                Price = 3799.00m,
                OriginalPrice = 4899.00m,
                StockQuantity = 24,
                Dimensions = "21\"W x 21\"D x 34\"-38\"H",
                Material = "High-Density Foam, Breathable Mesh, Nylon Swivel Base",
                Color = "Slate Grey",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1580481077195-c328ad45be8e?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = homeOffice.Id
            },
            new Product
            {
                Name = "Lattice 3-Tier Floating Wall Shelf",
                Slug = "lattice-3-tier-floating-wall-shelf",
                Description = "Space-efficient wall-hung book and succulent plant display shelf with heavy-duty hidden industrial wall anchors.",
                Price = 1499.00m,
                OriginalPrice = 1999.00m,
                StockQuantity = 35,
                Dimensions = "24\"W x 6\"D x 24\"H",
                Material = "Solid Pine Wood & Industrial Metal Brackets",
                Color = "Espresso Brown",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = homeOffice.Id
            }
        };

        await context.Products.AddRangeAsync(normalPriceProducts);
        await context.SaveChangesAsync();
    }

    public static async Task CalibratePricesAndImagesAsync(FurniNestDbContext context)
    {
        var priceAndImageMap = new Dictionary<string, (decimal Price, decimal OriginalPrice, string ImageUrl)>
        {
            // Living Room
            ["nordic-velvet-haven-sofa"] = (21999.00m, 26999.00m, "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80"),
            ["sora-mid-century-lounge-chair"] = (9499.00m, 12999.00m, "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80"),
            ["kyoto-minimalist-coffee-table"] = (6999.00m, 8999.00m, "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=1200&q=80"),
            ["zenith-2-tier-glass-coffee-table"] = (5999.00m, 7499.00m, "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80"),
            ["komorebi-solid-oak-end-table"] = (2499.00m, 3299.00m, "https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=1200&q=80"),
            ["nordic-linen-floor-pouf-ottoman"] = (1899.00m, 2499.00m, "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80"),
            ["valen-sculpted-boucle-lounge-chair"] = (18499.00m, 22999.00m, "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80"),
            ["oslo-minimalist-low-coffee-table"] = (8999.00m, 11499.00m, "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80"),

            // Bedroom
            ["aura-floating-platform-bed"] = (24999.00m, 29999.00m, "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"),
            ["nordic-fluted-timber-platform-bed"] = (29999.00m, 35999.00m, "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80"),
            ["cove-two-drawer-nightstand"] = (4499.00m, 5999.00m, "https://images.unsplash.com/photo-1532372576444-dda954194ad0?auto=format&fit=crop&w=1200&q=80"),
            ["kyoto-floating-nightstand-with-brass-pull"] = (5499.00m, 6999.00m, "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"),
            ["haven-floating-wall-bedside-shelf"] = (2799.00m, 3499.00m, "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"),
            ["vesta-3-tier-bamboo-shoe-storage-rack"] = (1499.00m, 1999.00m, "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1200&q=80"),
            ["malabar-sheesham-bedside-stool"] = (1999.00m, 2699.00m, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80"),
            ["solstice-6-drawer-dresser"] = (14999.00m, 18999.00m, "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1200&q=80"),

            // Dining Room
            ["artisan-extendable-dining-table"] = (19499.00m, 24999.00m, "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80"),
            ["arden-oval-solid-oak-dining-table"] = (34999.00m, 42000.00m, "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80"),
            ["capri-round-2-seater-cafe-table"] = (4999.00m, 6499.00m, "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80"),
            ["bistro-solid-pine-dining-stools-set-2"] = (2199.00m, 2899.00m, "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80"),
            ["elowen-cane-back-dining-chair-set-2"] = (7999.00m, 9999.00m, "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=1200&q=80"),
            ["komorebi-sculpted-wishbone-chairs-set-2"] = (12999.00m, 16499.00m, "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=1200&q=80"),

            // Home Office
            ["veritas-executive-walnut-desk"] = (12499.00m, 15999.00m, "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80"),
            ["scribe-executive-walnut-writing-desk"] = (24999.00m, 31000.00m, "https://images.unsplash.com/photo-1597072689227-8882273e8f6a?auto=format&fit=crop&w=1200&q=80"),
            ["linear-work-from-home-study-desk"] = (3999.00m, 4999.00m, "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"),
            ["astral-ergonomic-task-chair"] = (7999.00m, 9999.00m, "https://images.unsplash.com/photo-1589834390005-5d4fb9bf3d32?auto=format&fit=crop&w=1200&q=80"),
            ["aero-breathable-ergonomic-desk-chair"] = (3499.00m, 4499.00m, "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=1200&q=80"),
            ["atelier-swivel-leather-desk-chair"] = (14499.00m, 18999.00m, "https://images.unsplash.com/photo-1549497538-303791108f95?auto=format&fit=crop&w=1200&q=80"),
            ["lattice-3-tier-floating-wall-shelf"] = (1299.00m, 1699.00m, "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=80")
        };

        var allProducts = await context.Products.ToListAsync();
        bool changed = false;

        foreach (var prod in allProducts)
        {
            if (priceAndImageMap.TryGetValue(prod.Slug, out var item))
            {
                if (prod.Price != item.Price || prod.OriginalPrice != item.OriginalPrice || prod.PrimaryImageUrl != item.ImageUrl)
                {
                    prod.Price = item.Price;
                    prod.OriginalPrice = item.OriginalPrice;
                    prod.PrimaryImageUrl = item.ImageUrl;
                    changed = true;
                }
            }
        }

        // Calibrate review images
        var existingReviews = await context.ProductReviews.Where(r => string.IsNullOrEmpty(r.ImageUrl)).ToListAsync();
        if (existingReviews.Any())
        {
            var samplePhotos = new[]
            {
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
            };
            int photoIndex = 0;
            foreach (var rev in existingReviews)
            {
                rev.ImageUrl = samplePhotos[photoIndex % samplePhotos.Length];
                photoIndex++;
                changed = true;
            }
        }

        if (changed)
        {
            await context.SaveChangesAsync();
        }
    }

    public static async Task SeedCuratedCategoryProductsAsync(FurniNestDbContext context)
    {
        var livingRoom = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "living-room");
        var bedroom = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "bedroom");
        var diningRoom = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "dining-room");
        var homeOffice = await context.Categories.FirstOrDefaultAsync(c => c.Slug == "home-office");

        if (livingRoom == null || bedroom == null || diningRoom == null || homeOffice == null)
        {
            return;
        }

        var newCategoryProducts = new List<Product>
        {
            // --- Living Room ---
            new Product
            {
                Name = "Valen Sculpted Bouclé Lounge Chair",
                Slug = "valen-sculpted-boucle-lounge-chair",
                Description = "Ergonomically sculpted silhouette draped in ultra-tactile ivory bouclé. Reinforced with organic mortise and tenon solid walnut frame and high-density supportive foam.",
                Price = 18499.00m,
                OriginalPrice = 22999.00m,
                StockQuantity = 10,
                Dimensions = "33\"W x 35\"D x 32\"H",
                Material = "FSC Solid Walnut Frame, Textured Ivory Bouclé Fabric",
                Color = "Ivory Bouclé / Walnut",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = true,
                CategoryId = livingRoom.Id
            },
            new Product
            {
                Name = "Oslo Minimalist Low Coffee Table",
                Slug = "oslo-minimalist-low-coffee-table",
                Description = "Organic floating profile with soft pill-shaped corners, solid exposed end-grain timber legs, and a matte protective seal that repels spills.",
                Price = 8999.00m,
                OriginalPrice = 11499.00m,
                StockQuantity = 14,
                Dimensions = "46\"W x 24\"D x 15\"H",
                Material = "Solid American White Oak, Natural Matte Hardwax Oil",
                Color = "Bleached Natural Oak",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = livingRoom.Id
            },

            // --- Bedroom ---
            new Product
            {
                Name = "Nordic Fluted Timber Platform Bed",
                Slug = "nordic-fluted-timber-platform-bed",
                Description = "Architecturally fluted headboard handcrafted with solid oak timber battens. Engineered with acoustic zero-squeak internal jointing and breathable curved slats.",
                Price = 29999.00m,
                OriginalPrice = 35999.00m,
                StockQuantity = 6,
                Dimensions = "86\"L x 64\"W x 44\"H",
                Material = "Solid Appalachian White Oak, Natural Linen Upholstered Slats",
                Color = "Natural Honey Oak",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = true,
                CategoryId = bedroom.Id
            },
            new Product
            {
                Name = "Kyoto Floating Nightstand with Brass Pull",
                Slug = "kyoto-floating-nightstand-with-brass-pull",
                Description = "Clean floating side table featuring a soft-close dovetailed timber drawer and solid aged brass drawer pull. Kiln-dried to maintain perfect alignment.",
                Price = 5499.00m,
                OriginalPrice = 6999.00m,
                StockQuantity = 18,
                Dimensions = "20\"W x 16\"D x 18\"H",
                Material = "Solid American Black Walnut, Brushed Patina Brass",
                Color = "Smoked Walnut",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = bedroom.Id
            },

            // --- Dining Room ---
            new Product
            {
                Name = "Arden Oval Solid Oak Dining Table",
                Slug = "arden-oval-solid-oak-dining-table",
                Description = "Masterfully contoured oval dining table resting on twin fluted pedestal pillars. Generously seats 6-8 people with premium stain and heat resistance.",
                Price = 34999.00m,
                OriginalPrice = 42000.00m,
                StockQuantity = 5,
                Dimensions = "78\"L x 38\"W x 30\"H",
                Material = "100% Solid European Oak, Eco-Certified Matte Lacquer",
                Color = "Smoked White Oak",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = true,
                CategoryId = diningRoom.Id
            },
            new Product
            {
                Name = "Komorebi Sculpted Wishbone Chairs (Set of 2)",
                Slug = "komorebi-sculpted-wishbone-chairs-set-2",
                Description = "Iconic Y-back silhouette formed by steam-bending solid ash timber, complemented by 120 meters of handwoven natural paper cord seating.",
                Price = 12999.00m,
                OriginalPrice = 16499.00m,
                StockQuantity = 12,
                Dimensions = "21\"W x 21\"D x 29\"H",
                Material = "Steam-Bent Solid Ash Wood, Handwoven Natural Paper Cord",
                Color = "Natural Ash / Sand Cord",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = diningRoom.Id
            },

            // --- Home Office ---
            new Product
            {
                Name = "Scribe Executive Walnut Writing Desk",
                Slug = "scribe-executive-walnut-writing-desk",
                Description = "Seamless executive work desk with chamfered edge geometry, two flush-front dovetailed drawers, and discrete integrated magnetic cord routing channel.",
                Price = 24999.00m,
                OriginalPrice = 31000.00m,
                StockQuantity = 7,
                Dimensions = "56\"W x 26\"D x 30\"H",
                Material = "Solid American Black Walnut, Felt-Lined Cable Management Tray",
                Color = "Rich Dark Walnut",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1597072689227-8882273e8f6a?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = true,
                CategoryId = homeOffice.Id
            },
            new Product
            {
                Name = "Atelier Swivel Leather Desk Chair",
                Slug = "atelier-swivel-leather-desk-chair",
                Description = "Ergonomic pneumatic swivel chair wrapped in buttery top-grain cognac leather. Sculpted oak armrests and matte black aluminum 5-point caster base.",
                Price = 14499.00m,
                OriginalPrice = 18999.00m,
                StockQuantity = 11,
                Dimensions = "24\"W x 25\"D x 34-38\"H",
                Material = "Top-Grain Cognac Italian Leather, Solid Oak, Aluminum Base",
                Color = "Cognac Tan / Black Base",
                PrimaryImageUrl = "https://images.unsplash.com/photo-1549497538-303791108f95?auto=format&fit=crop&w=1200&q=80",
                IsFeatured = false,
                CategoryId = homeOffice.Id
            }
        };

        bool anyAdded = false;
        foreach (var prod in newCategoryProducts)
        {
            if (!await context.Products.AnyAsync(p => p.Slug == prod.Slug))
            {
                await context.Products.AddAsync(prod);
                anyAdded = true;
            }
        }

        if (anyAdded)
        {
            await context.SaveChangesAsync();
        }
    }
}

