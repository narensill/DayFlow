namespace DayFlow.DTOs;

public class UpdateSettingsRequest
{
    public string WeatherLocation { get; set; } = "Mumbai";

    public string TimeFormat { get; set; } = "12-hour";

    public string Theme { get; set; } = "system";

    public int DefaultReminderMinutes { get; set; } = 10;

    public bool AnimationsEnabled { get; set; } = true;

    public bool CompactMode { get; set; } = false;

    public string WeekStartsOn { get; set; } = "sunday";

    public string DefaultTaskPriority { get; set; } = "Medium";

    public string DefaultTaskStatus { get; set; } = "Pending";

    public bool BrowserNotificationsEnabled { get; set; } = true;
}
