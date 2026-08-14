using DayFlow.DTOs;

namespace DayFlow.Services;

public interface IWeatherService
{
    Task<WeatherResponse> GetCurrentWeatherAsync(
        string city,
        CancellationToken cancellationToken = default);
}
