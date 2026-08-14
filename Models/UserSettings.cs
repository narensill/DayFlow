namespace DayFlow.Models;

public class UserSettings
{
    public int Id { get; set; }

    public string WeatherLocation { get; set; } = "Mumbai";

    public string TimeFormat { get; set; } = "12-hour";

    public string Theme { get; set; } = "system";

    public int DefaultReminderMinutes { get; set; } = 10;

    public DateTime UpdatedAt { get; set; }
}
