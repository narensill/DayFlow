namespace DayFlow.DTOs;

public class UpdateReminderRequest
{
    public DateTime ReminderTime { get; set; }

    public bool IsTriggered { get; set; }
}
