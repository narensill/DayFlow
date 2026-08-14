namespace DayFlow.DTOs;

public class TaskQueryParameters
{
    public string? Search { get; set; }

    public string? Status { get; set; }

    public string? Priority { get; set; }

    public int? CategoryId { get; set; }

    public bool? Overdue { get; set; }

    public string Sort { get; set; } = "dueDate";
}
