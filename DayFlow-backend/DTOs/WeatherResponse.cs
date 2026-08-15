using DayFlow.Models;

namespace DayFlow.DTOs;

public class WeatherResponse
{
    public string Location { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public double Temperature { get; set; }

    public double FeelsLike { get; set; }

    public int Humidity { get; set; }

    public double WindSpeed { get; set; }

    public int WeatherCode { get; set; }

    public string Condition { get; set; } = string.Empty;

    public DateTime RetrievedAt { get; set; }

    public List<WeatherForecastDay> Forecast { get; set; } = [];
}
