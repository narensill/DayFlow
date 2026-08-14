using DayFlow.DTOs;
using DayFlow.Models;

namespace DayFlow.Services;

public interface ISettingsService
{
    Task<UserSettings> GetAsync(
        CancellationToken cancellationToken = default);

    Task<UserSettings> UpdateAsync(
        UpdateSettingsRequest request,
        CancellationToken cancellationToken = default);
}
