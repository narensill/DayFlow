using DayFlow.DTOs;
using DayFlow.Models;
using DayFlow.Services;
using Microsoft.AspNetCore.Mvc;

namespace DayFlow.Controllers;

[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet]
    public async Task<ActionResult<UserSettings>> GetSettings(
        CancellationToken cancellationToken)
    {
        return Ok(
            await _settingsService.GetAsync(cancellationToken)
        );
    }

    [HttpPut]
    public async Task<ActionResult<UserSettings>> UpdateSettings(
        UpdateSettingsRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(
                await _settingsService.UpdateAsync(
                    request,
                    cancellationToken)
            );
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }
}
