using DayFlow.DTOs;
using DayFlow.Models;

namespace DayFlow.Services;

public interface IReminderService
{
    Task<List<Reminder>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<List<Reminder>> GetDueAsync(
        CancellationToken cancellationToken = default);

    Task<Reminder?> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default);

    Task<Reminder> CreateAsync(
        CreateReminderRequest request,
        CancellationToken cancellationToken = default);

    Task<Reminder?> UpdateAsync(
        int id,
        UpdateReminderRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteAsync(
        int id,
        CancellationToken cancellationToken = default);
}
