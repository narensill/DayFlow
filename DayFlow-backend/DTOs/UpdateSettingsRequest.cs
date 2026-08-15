namespace DayFlow.DTOs;

public class UpdateSettingsRequest
{
    public string WeatherLocation { get; set; } = "Mumbai";

    public string TimeFormat { get; set; } = "12-hour";

    public string Theme { get; set; } = "system";

    public int DefaultReminderMinutes { get; set; } = 10;
}
