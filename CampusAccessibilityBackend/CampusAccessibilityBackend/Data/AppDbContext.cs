using CampusAccessibilityBackend.Models;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace CampusAccessibilityBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Student> Students { get; set; }
        public DbSet<Complaint> Complaints { get; set; }
        public DbSet<ComplaintHistory> ComplaintHistories { get; set; }
        public DbSet<ComplaintImage> ComplaintImages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Role>(entity =>
            {
                entity.Property(e => e.Name).HasMaxLength(50);
                entity.HasIndex(e => e.Name, "UQ_Roles_Name").IsUnique();
                // Seed data — σταθερά, δεν αλλάζουν ποτέ. Explicit Id (όχι auto-increment)
                // γιατί το HasData απαιτεί ρητές τιμές για το primary key.
                entity.HasData(
                    new Role { Id = 1, Name = "Admin" },
                    new Role { Id = 2, Name = "Student" }
                );

            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.Firstname).HasMaxLength(50);
                entity.Property(e => e.Lastname).HasMaxLength(50);
                entity.Property(e => e.Password).HasMaxLength(255); // hashed password

                entity.HasIndex(e => e.Email, "UQ_Users_Email").IsUnique();

                entity.HasOne(d => d.Role)
                    .WithMany(p => p.Users)
                    .HasForeignKey(d => d.RoleId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_Users_Roles");

                //IsDeleted = 0
                entity.HasQueryFilter(e => !e.IsDeleted);

                //seed data
                //admin
                entity.HasData(
                    new User
                    {
                        Id = 1,
                        Email = "admin@campusaccessibility.local",
                        Password = "$2b$12$cT8Uhmj7KrJwXxNcoxpgnenbp54G5yZTsOGHjdz.Kvu56TOnMVv0W",
                        Firstname = "Admin",
                        Lastname = "Admin",
                        RoleId = 1,
                        InsertedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                        ModifiedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                    }
                );
            });

            modelBuilder.Entity<Student>(entity =>
            {
                entity.Property(e => e.School).HasMaxLength(150);
                entity.Property(e => e.Department).HasMaxLength(150);

                entity.HasOne(d => d.User)
                    .WithOne(p => p.Student)
                    .HasForeignKey<Student>(d => d.UserId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_Students_Users");

                entity.HasIndex(e => e.UserId, "UQ_Students_UserId").IsUnique();

                //IsDeleted = 0
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            modelBuilder.Entity<Complaint>(entity =>
            {
                entity.Property(e => e.Title).HasMaxLength(120);
                entity.Property(e => e.Category).HasMaxLength(100);
                entity.Property(e => e.School).HasMaxLength(150);
                entity.Property(e => e.Department).HasMaxLength(150);
                entity.Property(e => e.Location).HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(1000);

                entity.Property(e => e.Status)
                    .HasConversion<string>()  //string
                    .HasMaxLength(20);

                entity.HasOne(d => d.Student)
                    .WithMany(p => p.Complaints)
                    .HasForeignKey(d => d.StudentId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_Complaints_Students");

                entity.HasIndex(e => e.StudentId, "IX_Complaints_StudentId");
                entity.HasIndex(e => e.Status, "IX_Complaints_Status");
                entity.HasIndex(e => e.Department, "IX_Complaints_Department");
                entity.HasIndex(e => e.Category, "IX_Complaints_Category");

                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            modelBuilder.Entity<ComplaintHistory>(entity =>
            {
                entity.Property(e => e.AdminComment).HasMaxLength(500);

                entity.Property(e => e.Status)
                    .HasConversion<string>()
                    .HasMaxLength(20);

                entity.HasOne(d => d.Complaint)
                    .WithMany(p => p.ComplaintHistories)
                    .HasForeignKey(d => d.ComplaintId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_ComplaintHistories_Complaints");

                entity.HasOne(d => d.Admin)  //κάθε complainthistory έχει έναν User Admin που το έκανε 
                    .WithMany(p => p.ComplaintHistories)
                    .HasForeignKey(d => d.AdminId)
                    .OnDelete(DeleteBehavior.Restrict)
                    .HasConstraintName("FK_ComplaintHistories_Users");

                entity.HasIndex(e => e.ComplaintId, "IX_ComplaintHistories_ComplaintId");
                entity.HasIndex(e => e.AdminId, "IX_ComplaintHistories_AdminId");

                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            modelBuilder.Entity<ComplaintImage>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.FilePath).HasMaxLength(300);
                entity.Property(e => e.AltText).HasMaxLength(200);

                entity.HasOne(d => d.Complaint)
                    .WithMany(p => p.ComplaintImages)
                    .HasForeignKey(d => d.ComplaintId)
                    .OnDelete(DeleteBehavior.Cascade)
                    .HasConstraintName("FK_ComplaintImages_Complaints");

                entity.HasIndex(e => e.ComplaintId, "IX_ComplaintImages_ComplaintId");
                entity.HasQueryFilter(e => !e.Complaint.IsDeleted);
            });

            // για να αποθηκεύονται και στη συνέχεια εμφανίζονται σωστά χρόνοι
            var utcConverter = new ValueConverter<DateTime, DateTime>(
                v => v,
                v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

            var nullableUtcConverter = new ValueConverter<DateTime?, DateTime?>(
                v => v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v);

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(DateTime))
                        property.SetValueConverter(utcConverter);
                    else if (property.ClrType == typeof(DateTime?))
                        property.SetValueConverter(nullableUtcConverter);
                }
            }
        }
    }
}
