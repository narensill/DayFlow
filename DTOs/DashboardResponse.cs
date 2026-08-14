using DayFlow.Models;

namespace DayFlow.DTOs;

public class DashboardResponse
{
    public DateTime Date { get; set; }

    public TaskSummary TaskSummary { get; set; } = new();

    public List<TaskItem> TodayTasks { get; set; } = [];

    public List<TaskItem> UpcomingTasks { get; set; } = [];

    public List<CalendarEvent> TodayEvents { get; set; } = [];

    public List<CalendarEvent> UpcomingEvents { get; set; } = [];

    public List<Reminder> UpcomingReminders { get; set; } = [];

    public WeatherResponse? Weather { get; set; }
}

public class TaskSummary
{
    public int Total { get; set; }

    public int Completed { get; set; }

    public int Pending { get; set; }

    public int Overdue { get; set; }
}
