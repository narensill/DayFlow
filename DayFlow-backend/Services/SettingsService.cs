using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using DayFlow.Data;
using DayFlow.DTOs;
using DayFlow.Models;
using Microsoft.EntityFrameworkCore;

namespace DayFlow.Services;

public class SettingsService : ISettingsService
{
    private readonly DayFlowDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public SettingsService(
        DayFlowDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<UserSettings> GetAsync(
        CancellationToken cancellationToken = default)
    {
        var userId = _currentUser.UserId;

        var settings = await _context.UserSettings
            .FirstOrDefaultAsync(
                s => s.UserId == userId,
                cancellationToken);

        if (settings is not null)
            return settings;

        settings = new UserSettings
        {
            UserId = userId,
            WeatherLocation = "Mumbai",
            TimeFormat = "12-hour",
            Theme = "system",
            DefaultReminderMinutes = 10,
            AnimationsEnabled = true,
            CompactMode = false,
            WeekStartsOn = "sunday",
            DefaultTaskPriority = "Medium",
            DefaultTaskStatus = "Pending",
            BrowserNotificationsEnabled = true,
            UpdatedAt = DateTime.UtcNow
        };

        _context.UserSettings.Add(settings);
        await _context.SaveChangesAsync(cancellationToken);

        return settings;
    }

    public async Task<UserSettings> UpdateAsync(
        UpdateSettingsRequest request,
        CancellationToken cancellationToken = default)
    {
        Validate(request);

        var userId = _currentUser.UserId;

        var settings = await _context.UserSettings
            .FirstOrDefaultAsync(
                s => s.UserId == userId,
                cancellationToken);

        if (settings is null)
        {
            settings = new UserSettings
            {
                UserId = userId
            };

            _context.UserSettings.Add(settings);
        }

        settings.WeatherLocation = request.WeatherLocation.Trim();
        settings.TimeFormat = request.TimeFormat.Trim().ToLowerInvariant();
        settings.Theme = request.Theme.Trim().ToLowerInvariant();
        settings.DefaultReminderMinutes = request.DefaultReminderMinutes;
        settings.AnimationsEnabled = request.AnimationsEnabled;
        settings.CompactMode = request.CompactMode;
        settings.WeekStartsOn = request.WeekStartsOn.Trim().ToLowerInvariant();
        settings.DefaultTaskPriority = NormalizeEnumValue(request.DefaultTaskPriority, ValidPriorities);
        settings.DefaultTaskStatus = NormalizeEnumValue(request.DefaultTaskStatus, ValidStatuses);
        settings.BrowserNotificationsEnabled = request.BrowserNotificationsEnabled;
        settings.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return settings;
    }

    private static readonly string[] ValidPriorities = { "Low", "Medium", "High" };
    private static readonly string[] ValidStatuses = { "Pending", "InProgress", "Completed", "Cancelled" };

    private static string NormalizeEnumValue(string value, string[] validValues)
    {
        var trimmed = (value ?? string.Empty).Trim();
        var match = validValues.FirstOrDefault(v => string.Equals(v, trimmed, StringComparison.OrdinalIgnoreCase));
        return match ?? trimmed;
    }

    private static void Validate(UpdateSettingsRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.WeatherLocation))
            throw new ArgumentException("Weather location is required.");

        if (request.WeatherLocation.Trim().Length > 100)
            throw new ArgumentException(
                "Weather location cannot exceed 100 characters.");

        var validTimeFormats = new[] { "12-hour", "24-hour" };

        if (!validTimeFormats.Contains(
                request.TimeFormat.Trim().ToLowerInvariant()))
        {
            throw new ArgumentException(
                "Time format must be 12-hour or 24-hour.");
        }

        var validThemes = new[] { "light", "dark", "system" };

        if (!validThemes.Contains(
                request.Theme.Trim().ToLowerInvariant()))
        {
            throw new ArgumentException(
                "Theme must be light, dark, or system.");
        }

        var validReminderTimes = new[] { 0, 5, 10, 30, 60, 1440 };

        if (!validReminderTimes.Contains(
                request.DefaultReminderMinutes))
        {
            throw new ArgumentException(
                "Default reminder must be 0, 5, 10, or 30, 60, or 1440 minutes.");
        }

        var validWeekStarts = new[] { "sunday", "monday" };

        if (!validWeekStarts.Contains(
                (request.WeekStartsOn ?? string.Empty).Trim().ToLowerInvariant()))
        {
            throw new ArgumentException(
                "Week start must be sunday or monday.");
        }

        var priorityInput = (request.DefaultTaskPriority ?? string.Empty).Trim();
        if (!ValidPriorities.Any(v => string.Equals(v, priorityInput, StringComparison.OrdinalIgnoreCase)))
        {
            throw new ArgumentException(
                "Default task priority must be Low, Medium, or High.");
        }

        var statusInput = (request.DefaultTaskStatus ?? string.Empty).Trim();
        if (!ValidStatuses.Any(v => string.Equals(v, statusInput, StringComparison.OrdinalIgnoreCase)))
        {
            throw new ArgumentException(
                "Default task status must be Pending, InProgress, Completed, or Cancelled.");
        }
    }
}
