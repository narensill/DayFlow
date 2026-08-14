using DayFlow.Data;
using DayFlow.DTOs;
using DayFlow.Models;
using Microsoft.EntityFrameworkCore;

namespace DayFlow.Services;

public class ReminderService : IReminderService
{
    private readonly DayFlowDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ReminderService(
        DayFlowDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<List<Reminder>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.Reminders
            .Include(r => r.Task)
            .Include(r => r.Event)
            .Where(r => r.UserId == _currentUser.UserId)
            .OrderBy(r => r.ReminderTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Reminder>> GetDueAsync(
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        return await _context.Reminders
            .Include(r => r.Task)
            .Include(r => r.Event)
            .Where(r => r.UserId == _currentUser.UserId &&
                !r.IsTriggered &&
                r.ReminderTime <= now)
            .OrderBy(r => r.ReminderTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<Reminder?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context.Reminders
            .Include(r => r.Task)
            .Include(r => r.Event)
            .FirstOrDefaultAsync(
                r => r.Id == id &&
                     r.UserId == _currentUser.UserId,
                cancellationToken);
    }

    public async Task<Reminder> CreateAsync(
        CreateReminderRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.TaskId is null && request.EventId is null)
        {
            throw new ArgumentException(
                "A reminder must be associated with a task or an event.");
        }

        if (request.TaskId.HasValue)
        {
            var taskExists = await _context.TaskItems.AnyAsync(
                task => task.Id == request.TaskId.Value,
                cancellationToken);

            if (!taskExists)
                throw new ArgumentException("Task not found.");
        }

        if (request.EventId.HasValue)
        {
            var eventExists = await _context.CalendarEvents.AnyAsync(
                calendarEvent =>
                    calendarEvent.Id == request.EventId.Value,
                cancellationToken);

            if (!eventExists)
                throw new ArgumentException("Event not found.");
        }

        if (request.TaskId.HasValue && request.EventId.HasValue)
        {
            throw new ArgumentException(
                "A reminder can be associated with a task or an event, not both.");
        }

        var reminderTime = await CalculateReminderTimeAsync(
            request,
            cancellationToken);

        if (reminderTime <= DateTime.UtcNow)
        {
            throw new ArgumentException(
                "Reminder time must be in the future.");
        }

        var reminder = new Reminder
        {
            UserId = _currentUser.UserId,
            TaskId = request.TaskId,
            EventId = request.EventId,
            ReminderTime = reminderTime,
            IsTriggered = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reminders.Add(reminder);

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(
            reminder.Id,
            cancellationToken) ?? reminder;
    }

    public async Task<Reminder?> UpdateAsync(
        int id,
        UpdateReminderRequest request,
        CancellationToken cancellationToken = default)
    {
        var reminder = await _context.Reminders
            .FirstOrDefaultAsync(
                r => r.Id == id &&
                     r.UserId == _currentUser.UserId,
                cancellationToken);

        if (reminder is null)
            return null;

        var reminderTime = ToUtc(request.ReminderTime);

        if (!request.IsTriggered &&
            reminderTime <= DateTime.UtcNow)
        {
            throw new ArgumentException(
                "Reminder time must be in the future unless the reminder is already triggered.");
        }

        reminder.ReminderTime = reminderTime;
        reminder.IsTriggered = request.IsTriggered;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(
            id,
            cancellationToken);
    }

    public async Task<Reminder?> TriggerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var reminder = await _context.Reminders
            .FirstOrDefaultAsync(
                r => r.Id == id &&
                     r.UserId == _currentUser.UserId,
                cancellationToken);

        if (reminder is null)
            return null;

        reminder.IsTriggered = true;

        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var reminder = await _context.Reminders
            .FirstOrDefaultAsync(
                r => r.Id == id &&
                     r.UserId == _currentUser.UserId,
                cancellationToken);

        if (reminder is null)
            return false;

        _context.Reminders.Remove(reminder);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private async Task<DateTime> CalculateReminderTimeAsync(
        CreateReminderRequest request,
        CancellationToken cancellationToken)
    {
        if (request.ReminderTime.HasValue &&
            request.MinutesBefore.HasValue)
        {
            throw new ArgumentException(
                "Provide either reminderTime or minutesBefore, not both.");
        }

        if (request.MinutesBefore.HasValue)
        {
            var minutes = request.MinutesBefore.Value;

            if (!new[] { 0, 5, 10, 30, 60, 1440 }
                .Contains(minutes))
            {
                throw new ArgumentException(
                    "minutesBefore must be 0, 5, 10, 30, 60, or 1440.");
            }

            DateTime targetTime;

            if (request.TaskId.HasValue)
            {
                var task = await _context.TaskItems
                    .FirstOrDefaultAsync(
                        t => t.Id == request.TaskId.Value &&
                             t.UserId == _currentUser.UserId,
                        cancellationToken);

                if (task?.DueDate is null)
                {
                    throw new ArgumentException(
                        "The task must have a due date to use minutesBefore.");
                }

                targetTime = ToUtc(task.DueDate.Value);
            }
            else
            {
                var calendarEvent = await _context.CalendarEvents
                    .FirstOrDefaultAsync(
                        e => e.Id == request.EventId!.Value &&
                             e.UserId == _currentUser.UserId,
                        cancellationToken);

                if (calendarEvent is null)
                {
                    throw new ArgumentException("Event not found.");
                }

                targetTime = ToUtc(
                    calendarEvent.StartDateTime);
            }

            return targetTime.AddMinutes(-minutes);
        }

        if (!request.ReminderTime.HasValue)
        {
            throw new ArgumentException(
                "Provide reminderTime or minutesBefore.");
        }

        return ToUtc(request.ReminderTime.Value);
    }

    private static DateTime ToUtc(DateTime value)
    {
        return value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(
                value,
                DateTimeKind.Utc)
        };
    }
}
