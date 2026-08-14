using DayFlow.DTOs;
using DayFlow.Services;
using Microsoft.AspNetCore.Mvc;

namespace DayFlow.Controllers;

[ApiController]
[Route("api/weather")]
public class WeatherController : ControllerBase
{
    private readonly IWeatherService _weatherService;

    public WeatherController(IWeatherService weatherService)
    {
        _weatherService = weatherService;
    }

    [HttpGet]
    public async Task<ActionResult<WeatherResponse>> GetWeather(
        [FromQuery] string city,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(
                await _weatherService.GetCurrentWeatherAsync(
                    city,
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
        catch (InvalidOperationException ex)
        {
            return StatusCode(503, new
            {
                message = ex.Message
            });
        }
    }
}
