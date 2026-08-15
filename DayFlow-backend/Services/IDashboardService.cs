using DayFlow.DTOs;

namespace DayFlow.Services;

public interface IDashboardService
{
    Task<DashboardResponse> GetDashboardAsync(
        CancellationToken cancellationToken = default);
}
