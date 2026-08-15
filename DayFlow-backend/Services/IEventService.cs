using DayFlow.DTOs;
using DayFlow.Models;

namespace DayFlow.Services;

public interface IEventService
{
    Task<List<CalendarEvent>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<CalendarEvent?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<List<CalendarEvent>> GetByDateAsync(
        DateTime date,
        CancellationToken cancellationToken = default);

    Task<List<CalendarEvent>> GetUpcomingAsync(
        int days = 7,
        CancellationToken cancellationToken = default);

    Task<CalendarEvent> CreateAsync(
        CreateEventRequest request,
        CancellationToken cancellationToken = default);

    Task<CalendarEvent?> UpdateAsync(
        int id,
        UpdateEventRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);
}
