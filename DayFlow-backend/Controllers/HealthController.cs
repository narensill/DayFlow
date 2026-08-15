using DayFlow.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DayFlow.Controllers;

[ApiController]
[Route("api/health")]
public class HealthController : ControllerBase
{
    private readonly DayFlowDbContext _context;
    private readonly IHostEnvironment _environment;

    public HealthController(
        DayFlowDbContext context,
        IHostEnvironment environment)
    {
        _context = context;
        _environment = environment;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetHealth(
        CancellationToken cancellationToken)
    {
        try
        {
            var databaseHealthy =
                await _context.Database.CanConnectAsync(
                    cancellationToken);

            var response = new
            {
                status = databaseHealthy ? "healthy" : "degraded",
                api = "healthy",
                database = databaseHealthy ? "healthy" : "unavailable",
                environment = _environment.EnvironmentName,
                timestamp = DateTime.UtcNow
            };

            return databaseHealthy
                ? Ok(response)
                : StatusCode(503, response);
        }
        catch
        {
            return StatusCode(503, new
            {
                status = "degraded",
                api = "healthy",
                database = "unavailable",
                environment = _environment.EnvironmentName,
                timestamp = DateTime.UtcNow
            });
        }
    }
}
