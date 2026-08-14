using DayFlow.Data;
using DayFlow.DTOs;
using DayFlow.Models;
using Microsoft.EntityFrameworkCore;

namespace DayFlow.Services;

public class EventService : IEventService
{
    private readonly DayFlowDbContext _context;

    public EventService(DayFlowDbContext context)
    {
        _context = context;
    }

    public async Task<List<CalendarEvent>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.CalendarEvents
            .OrderBy(e => e.StartDateTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<CalendarEvent?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        return await _context.CalendarEvents
            .FindAsync([id], cancellationToken);
    }

    public async Task<List<CalendarEvent>> GetByDateAsync(
        DateTime date,
        CancellationToken cancellationToken = default)
    {
        var start = DateTime.SpecifyKind(
            date.Date,
            DateTimeKind.Utc);

        var end = start.AddDays(1);

        return await _context.CalendarEvents
            .Where(e =>
                e.StartDateTime < end &&
                e.EndDateTime >= start)
            .OrderBy(e => e.StartDateTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<CalendarEvent>> GetUpcomingAsync(
        int days = 7,
        CancellationToken cancellationToken = default)
    {
        if (days < 1)
            days = 1;

        if (days > 31)
            days = 31;

        var now = DateTime.UtcNow;
        var end = now.AddDays(days);

        return await _context.CalendarEvents
            .Where(e =>
                e.EndDateTime >= now &&
                e.StartDateTime <= end)
            .OrderBy(e => e.StartDateTime)
            .ToListAsync(cancellationToken);
    }

    public async Task<CalendarEvent> CreateAsync(
        CreateEventRequest request,
        CancellationToken cancellationToken = default)
    {
        ValidateDates(request.StartDateTime, request.EndDateTime);

        var now = DateTime.UtcNow;

        var calendarEvent = new CalendarEvent
        {
            Title = request.Title.Trim(),
            Description = request.Description,
            StartDateTime = ToUtc(request.StartDateTime),
            EndDateTime = ToUtc(request.EndDateTime),
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.CalendarEvents.Add(calendarEvent);

        await _context.SaveChangesAsync(cancellationToken);

        return calendarEvent;
    }

    public async Task<CalendarEvent?> UpdateAsync(
        int id,
        UpdateEventRequest request,
        CancellationToken cancellationToken = default)
    {
        var calendarEvent = await _context.CalendarEvents
            .FindAsync([id], cancellationToken);

        if (calendarEvent is null)
            return null;

        ValidateDates(request.StartDateTime, request.EndDateTime);

        calendarEvent.Title = request.Title.Trim();
        calendarEvent.Description = request.Description;
        calendarEvent.StartDateTime = ToUtc(request.StartDateTime);
        calendarEvent.EndDateTime = ToUtc(request.EndDateTime);
        calendarEvent.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return calendarEvent;
    }

    public async Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var calendarEvent = await _context.CalendarEvents
            .FindAsync([id], cancellationToken);

        if (calendarEvent is null)
            return false;

        _context.CalendarEvents.Remove(calendarEvent);

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static void ValidateDates(
        DateTime start,
        DateTime end)
    {
        if (end <= start)
        {
            throw new ArgumentException(
                "End date and time must be after the start date and time.");
        }
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
