namespace DayFlow.DTOs;

public class CreateReminderRequest
{
    public int? TaskId { get; set; }

    public int? EventId { get; set; }

    public DateTime? ReminderTime { get; set; }

    public int? MinutesBefore { get; set; }
}
