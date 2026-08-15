using System.Text.Json.Serialization;

namespace DayFlow.Models;

public class UserSettings
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [JsonIgnore]
    public User User { get; set; } = null!;

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

    public DateTime UpdatedAt { get; set; }
}
