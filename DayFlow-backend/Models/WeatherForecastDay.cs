namespace DayFlow.Models;

public class WeatherForecastDay
{
    public DateTime Date { get; set; }

    public double MaxTemperature { get; set; }

    public double MinTemperature { get; set; }

    public int WeatherCode { get; set; }

    public string Condition { get; set; } = string.Empty;

    public int PrecipitationProbability { get; set; }
}
