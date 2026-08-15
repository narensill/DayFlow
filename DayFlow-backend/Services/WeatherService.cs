using System.Text.Json;
using System.Text.Json.Serialization;
using DayFlow.DTOs;
using DayFlow.Models;

namespace DayFlow.Services;

public class WeatherService : IWeatherService
{
    private readonly HttpClient _httpClient;

    public WeatherService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<WeatherResponse> GetCurrentWeatherAsync(
        string city,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(city))
            throw new ArgumentException("City is required.");

        var encodedCity = Uri.EscapeDataString(city.Trim());

        var geoUrl =
            $"https://geocoding-api.open-meteo.com/v1/search?name={encodedCity}&count=1&language=en&format=json";

        using var geoResponse = await _httpClient.GetAsync(
            geoUrl,
            cancellationToken);

        if (!geoResponse.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                "Unable to retrieve location information.");
        }

        var geoJson = await geoResponse.Content.ReadAsStringAsync(
            cancellationToken);

        var geoData = JsonSerializer.Deserialize<GeocodingResponse>(
            geoJson,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        var location = geoData?.Results?.FirstOrDefault();

        if (location is null)
        {
            throw new ArgumentException(
                $"Location '{city}' was not found.");
        }

        var weatherUrl =
            $"https://api.open-meteo.com/v1/forecast" +
            $"?latitude={location.Latitude}" +
            $"&longitude={location.Longitude}" +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m" +
            "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
            "&forecast_days=6" +
            "&timezone=auto";

        using var weatherResponse = await _httpClient.GetAsync(
            weatherUrl,
            cancellationToken);

        if (!weatherResponse.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                "Unable to retrieve weather information.");
        }

        var weatherJson = await weatherResponse.Content.ReadAsStringAsync(
            cancellationToken);

        var weatherData = JsonSerializer.Deserialize<
            OpenMeteoWeatherResponse>(
            weatherJson,
            new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

        if (weatherData?.Current is null)
        {
            throw new InvalidOperationException(
                "Weather information was unavailable.");
        }

        var forecast = new List<WeatherForecastDay>();

        if (weatherData.Daily is not null)
        {
            for (var i = 0; i < weatherData.Daily.Time.Count; i++)
            {
                forecast.Add(new WeatherForecastDay
                {
                    Date = DateTime.Parse(
                        weatherData.Daily.Time[i]).Date,
                    MaxTemperature =
                        weatherData.Daily.Temperature2mMax[i],
                    MinTemperature =
                        weatherData.Daily.Temperature2mMin[i],
                    WeatherCode =
                        weatherData.Daily.WeatherCode[i],
                    Condition =
                        GetCondition(weatherData.Daily.WeatherCode[i]),
                    PrecipitationProbability =
                        weatherData.Daily.PrecipitationProbabilityMax[i]
                });
            }
        }

        return new WeatherResponse
        {
            Location = location.Name ?? city.Trim(),
            Latitude = location.Latitude,
            Longitude = location.Longitude,
            Temperature = weatherData.Current.Temperature2m,
            FeelsLike = weatherData.Current.ApparentTemperature,
            Humidity = weatherData.Current.RelativeHumidity2m,
            WindSpeed = weatherData.Current.WindSpeed10m,
            WeatherCode = weatherData.Current.WeatherCode,
            Condition = GetCondition(weatherData.Current.WeatherCode),
            RetrievedAt = DateTime.UtcNow,
            Forecast = forecast
        };
    }

    private static string GetCondition(int code)
    {
        return code switch
        {
            0 => "Clear sky",
            1 or 2 or 3 => "Partly cloudy",
            45 or 48 => "Fog",
            51 or 53 or 55 or 56 or 57 => "Drizzle",
            61 or 63 or 65 or 66 or 67 => "Rain",
            71 or 73 or 75 or 77 => "Snow",
            80 or 81 or 82 => "Rain showers",
            85 or 86 => "Snow showers",
            95 => "Thunderstorm",
            96 or 99 => "Thunderstorm with hail",
            _ => "Unknown"
        };
    }

    private class GeocodingResponse
    {
        public List<GeoLocation>? Results { get; set; }
    }

    private class GeoLocation
    {
        public string? Name { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }
    }

    private class OpenMeteoWeatherResponse
    {
        public CurrentWeather? Current { get; set; }

        public DailyWeather? Daily { get; set; }
    }

    private class CurrentWeather
    {
        [JsonPropertyName("temperature_2m")]
        public double Temperature2m { get; set; }

        [JsonPropertyName("apparent_temperature")]
        public double ApparentTemperature { get; set; }

        [JsonPropertyName("relative_humidity_2m")]
        public int RelativeHumidity2m { get; set; }

        [JsonPropertyName("wind_speed_10m")]
        public double WindSpeed10m { get; set; }

        [JsonPropertyName("weather_code")]
        public int WeatherCode { get; set; }
    }

    private class DailyWeather
    {
        [JsonPropertyName("time")]
        public List<string> Time { get; set; } = [];

        [JsonPropertyName("weather_code")]
        public List<int> WeatherCode { get; set; } = [];

        [JsonPropertyName("temperature_2m_max")]
        public List<double> Temperature2mMax { get; set; } = [];

        [JsonPropertyName("temperature_2m_min")]
        public List<double> Temperature2mMin { get; set; } = [];

        [JsonPropertyName("precipitation_probability_max")]
        public List<int> PrecipitationProbabilityMax { get; set; } = [];
    }
}
