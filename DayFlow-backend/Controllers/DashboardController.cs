using DayFlow.DTOs;
using DayFlow.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DayFlow.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardResponse>> GetDashboard(
        CancellationToken cancellationToken)
    {
        return Ok(
            await _dashboardService.GetDashboardAsync(
                cancellationToken)
        );
    }
}
