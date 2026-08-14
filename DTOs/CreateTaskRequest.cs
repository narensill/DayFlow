using DayFlow.Models;

namespace DayFlow.DTOs;

public class CreateTaskRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? DueDate { get; set; }
    public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    public DayFlow.Models.TaskStatus Status { get; set; } = DayFlow.Models.TaskStatus.Pending;
    public int CategoryId { get; set; }
}
