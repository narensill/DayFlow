using System.Text.Json.Serialization;

namespace DayFlow.Models;

public class Reminder
{
    public int Id { get; set; }

    public int? TaskId { get; set; }

    [JsonIgnore]
    public TaskItem? Task { get; set; }

    public int? EventId { get; set; }

    [JsonIgnore]
    public CalendarEvent? Event { get; set; }

    public DateTime ReminderTime { get; set; }

    public bool IsTriggered { get; set; }

    public DateTime CreatedAt { get; set; }
}
