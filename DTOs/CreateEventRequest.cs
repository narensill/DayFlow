namespace DayFlow.DTOs;

public class CreateEventRequest
{
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime StartDateTime { get; set; }

    public DateTime EndDateTime { get; set; }
}
