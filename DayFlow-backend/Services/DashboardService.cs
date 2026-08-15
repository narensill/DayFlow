using DayFlow.Data;
using DayFlow.DTOs;
using DayFlow.Models;
using Microsoft.EntityFrameworkCore;

namespace DayFlow.Services;

public class DashboardService : IDashboardService
{
    private readonly DayFlowDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IWeatherService _weatherService;

    public DashboardService(
        DayFlowDbContext context,
        ICurrentUserService currentUser,
        IWeatherService weatherService)
    {
        _context = context;
        _currentUser = currentUser;
        _weatherService = weatherService;
    }

    public async Task<DashboardResponse> GetDashboardAsync(
        CancellationToken cancellationToken = default)
    {
        var userId = _currentUser.UserId;
        var now = DateTime.UtcNow;
        var todayStart = now.Date;
        var tomorrow = todayStart.AddDays(1);
        var upcomingEnd = tomorrow.AddDays(7);

        var tasks = await _context.TaskItems
            .Include(task => task.Category)
            .Where(task => task.UserId == userId)
            .ToListAsync(cancellationToken);

        var events = await _context.CalendarEvents
            .Where(e =>
                e.UserId == userId &&
                e.EndDateTime >= todayStart &&
                e.StartDateTime <= upcomingEnd)
            .OrderBy(e => e.StartDateTime)
            .ToListAsync(cancellationToken);

        var reminders = await _context.Reminders
            .Include(reminder => reminder.Task)
            .Include(reminder => reminder.Event)
            .Where(reminder =>
                reminder.UserId == userId &&
                !reminder.IsTriggered &&
                reminder.ReminderTime <= upcomingEnd)
            .OrderBy(reminder => reminder.ReminderTime)
            .ToListAsync(cancellationToken);

        var settings = await _context.UserSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(
                s => s.UserId == userId,
                cancellationToken);

        WeatherResponse? weather = null;

        if (settings is not null &&
            !string.IsNullOrWhiteSpace(settings.WeatherLocation))
        {
            try
            {
                weather = await _weatherService.GetCurrentWeatherAsync(
                    settings.WeatherLocation,
                    cancellationToken);
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch
            {
                // Weather is an external dependency. A weather outage
                // must not make the entire dashboard unavailable.
                weather = null;
            }
        }

        var todayTasks = tasks
            .Where(task =>
                task.DueDate.HasValue &&
                task.DueDate.Value >= todayStart &&
                task.DueDate.Value < tomorrow)
            .OrderBy(task => task.DueDate)
            .ToList();

        var upcomingTasks = tasks
            .Where(task =>
                task.DueDate.HasValue &&
                task.DueDate.Value >= tomorrow &&
                task.DueDate.Value <= upcomingEnd &&
                task.Status != DayFlow.Models.TaskStatus.Completed &&
                task.Status != DayFlow.Models.TaskStatus.Cancelled)
            .OrderBy(task => task.DueDate)
            .ToList();

        var todayEvents = events
            .Where(e =>
                e.StartDateTime < tomorrow &&
                e.EndDateTime >= todayStart)
            .OrderBy(e => e.StartDateTime)
            .ToList();

        var upcomingEvents = events
            .Where(e => e.StartDateTime >= tomorrow)
            .OrderBy(e => e.StartDateTime)
            .ToList();

        return new DashboardResponse
        {
            Date = todayStart,

            TaskSummary = new TaskSummary
            {
                Total = tasks.Count,
                Completed = tasks.Count(
                    task => task.Status == DayFlow.Models.TaskStatus.Completed),
                Pending = tasks.Count(
                    task => task.Status == DayFlow.Models.TaskStatus.Pending),
                Overdue = tasks.Count(
                    task =>
                        task.DueDate.HasValue &&
                        task.DueDate.Value < now &&
                        task.Status != DayFlow.Models.TaskStatus.Completed &&
                        task.Status != DayFlow.Models.TaskStatus.Cancelled)
            },

            TodayTasks = todayTasks,
            UpcomingTasks = upcomingTasks,
            TodayEvents = todayEvents,
            UpcomingEvents = upcomingEvents,
            UpcomingReminders = reminders,
            Weather = weather
        };
    }
}
