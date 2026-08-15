using DayFlow.Models;
using Microsoft.EntityFrameworkCore;

namespace DayFlow.Data;

public class DayFlowDbContext : DbContext
{
    public DayFlowDbContext(
        DbContextOptions<DayFlowDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<TaskItem> TaskItems => Set<TaskItem>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();
    public DbSet<Reminder> Reminders => Set<Reminder>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(user => user.Email)
            .IsUnique();

        modelBuilder.Entity<TaskItem>()
            .Property(task => task.Priority)
            .HasConversion<string>();

        modelBuilder.Entity<TaskItem>()
            .Property(task => task.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Category>()
            .HasIndex(category => category.Name)
            .IsUnique();

        modelBuilder.Entity<TaskItem>()
            .Property(task => task.UserId)
            .HasDefaultValue(1);

        modelBuilder.Entity<TaskItem>()
            .HasOne(task => task.User)
            .WithMany()
            .HasForeignKey(task => task.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskItem>()
            .HasOne(task => task.Category)
            .WithMany(category => category.Tasks)
            .HasForeignKey(task => task.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TaskItem>()
            .Property(task => task.CategoryId)
            .HasDefaultValue(7);

        modelBuilder.Entity<CalendarEvent>()
            .Property(calendarEvent => calendarEvent.UserId)
            .HasDefaultValue(1);

        modelBuilder.Entity<CalendarEvent>()
            .HasOne(calendarEvent => calendarEvent.User)
            .WithMany()
            .HasForeignKey(calendarEvent => calendarEvent.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Reminder>()
            .Property(reminder => reminder.UserId)
            .HasDefaultValue(1);

        modelBuilder.Entity<Reminder>()
            .HasOne(reminder => reminder.User)
            .WithMany()
            .HasForeignKey(reminder => reminder.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Reminder>()
            .HasOne(reminder => reminder.Task)
            .WithMany()
            .HasForeignKey(reminder => reminder.TaskId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Reminder>()
            .HasOne(reminder => reminder.Event)
            .WithMany()
            .HasForeignKey(reminder => reminder.EventId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserSettings>()
            .Property(settings => settings.UserId)
            .HasDefaultValue(1);

        modelBuilder.Entity<UserSettings>()
            .HasKey(settings => settings.Id);

        modelBuilder.Entity<UserSettings>()
            .HasIndex(settings => settings.UserId)
            .IsUnique();

        modelBuilder.Entity<UserSettings>()
            .HasOne(settings => settings.User)
            .WithMany()
            .HasForeignKey(settings => settings.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Development/migration owner for existing data.
        // Change this password immediately after first login.
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                Name = "DayFlow Owner",
                Email = "owner@dayflow.local",
                PasswordHash = "PBKDF2$100000$JW2Eji/W0dvJpxKIR9F2iA==$SmojNJPjXCBHW+lltyWk3PT3uTJSY+jup+X1AsXwY+o=",
                IsActive = true,
                CreatedAt = new DateTime(
                    2026, 1, 1, 0, 0, 0,
                    DateTimeKind.Utc),
                UpdatedAt = new DateTime(
                    2026, 1, 1, 0, 0, 0,
                    DateTimeKind.Utc)
            }
        );

        modelBuilder.Entity<Category>().HasData(
            new Category
            {
                Id = 1,
                Name = "College",
                CreatedAt = new DateTime(
                    2026, 1, 1, 0, 0, 0,
                    DateTimeKind.Utc)
            },
            new Category
            {
                Id = 2,
                Name = "Work",
                CreatedAt = new DateTime(
                    2026, 1, 1, 0, 0, 0,
                    DateTimeKind.Utc)
            },
            new Category
            {
                Id = 3,
                Name = "Personal",
                CreatedAt = new DateTime(
                    2026, 1, 1, 0, 0, 0,
                    DateTimeKind.Utc)
            },
            new Category
            {
                Id = 4,
                Name = "Fitness",
                CreatedAt = new DateTime(
                    2026, 1, 1, 0, 0, 0,
                    DateTimeKind.Utc)
            },
            new Category
            {
                Id = 5,
                Name = "Project",
                CreatedAt = new DateTime(
                    2026, 1, 1, 0, 0, 0,
                    DateTimeKind.Utc)
            },
            new Category
            {
                Id = 6,
                Name = "Study",
                CreatedAt = new DateTime(
                    2026, 1, 1, 0, 0, 0,
                    DateTimeKind.Utc)
            },
            new Category
            {
                Id = 7,
                Name = "Other",
                CreatedAt = new DateTime(
                    2026, 1, 1, 0, 0, 0,
                    DateTimeKind.Utc)
            }
        );
    }
}
