
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

    public DbSet<TaskItem> TaskItems => Set<TaskItem>();

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();

    public DbSet<Reminder> Reminders => Set<Reminder>();

    public DbSet<UserSettings> UserSettings => Set<UserSettings>();

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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
            .HasOne(task => task.Category)
            .WithMany(category => category.Tasks)
            .HasForeignKey(task => task.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TaskItem>()
            .Property(task => task.CategoryId)
            .HasDefaultValue(7);

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
            .HasKey(settings => settings.Id);

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
