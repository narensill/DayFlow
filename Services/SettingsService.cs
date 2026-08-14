using DayFlow.Data;
using DayFlow.DTOs;
using DayFlow.Models;
using Microsoft.EntityFrameworkCore;

namespace DayFlow.Services;

public class SettingsService : ISettingsService
{
    private readonly DayFlowDbContext _context;

    public SettingsService(DayFlowDbContext context)
    {
        _context = context;
    }

    public async Task<UserSettings> GetAsync(
        CancellationToken cancellationToken = default)
    {
        var settings = await _context.UserSettings
            .FirstOrDefaultAsync(cancellationToken);

        if (settings is not null)
            return settings;

        settings = new UserSettings
        {
            Id = 1,
            WeatherLocation = "Mumbai",
            TimeFormat = "12-hour",
            Theme = "system",
            DefaultReminderMinutes = 10,
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

        var settings = await _context.UserSettings
            .FirstOrDefaultAsync(cancellationToken);

        if (settings is null)
        {
            settings = new UserSettings
            {
                Id = 1
            };

            _context.UserSettings.Add(settings);
        }

        settings.WeatherLocation = request.WeatherLocation.Trim();
        settings.TimeFormat = request.TimeFormat.Trim().ToLower();
        settings.Theme = request.Theme.Trim().ToLower();
        settings.DefaultReminderMinutes = request.DefaultReminderMinutes;
        settings.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return settings;
    }

    private static void Validate(UpdateSettingsRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.WeatherLocation))
            throw new ArgumentException("Weather location is required.");

        var validTimeFormats = new[] { "12-hour", "24-hour" };

        if (!validTimeFormats.Contains(
                request.TimeFormat.Trim().ToLower()))
        {
            throw new ArgumentException(
                "Time format must be 12-hour or 24-hour.");
        }

        var validThemes = new[] { "light", "dark", "system" };

        if (!validThemes.Contains(
                request.Theme.Trim().ToLower()))
        {
            throw new ArgumentException(
                "Theme must be light, dark, or system.");
        }

        var validReminderTimes = new[] { 0, 5, 10, 30, 60, 1440 };

        if (!validReminderTimes.Contains(
                request.DefaultReminderMinutes))
        {
            throw new ArgumentException(
                "Default reminder must be 0, 5, 10, 30, 60, or 1440 minutes.");
        }
    }
}
