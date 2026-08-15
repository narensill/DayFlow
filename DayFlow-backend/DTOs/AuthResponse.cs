namespace DayFlow.DTOs;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;

    public int ExpiresInMinutes { get; set; }

    public UserResponse User { get; set; } = new();
}

public class UserResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;
}
