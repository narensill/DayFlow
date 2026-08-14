using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DayFlow.Data;
using DayFlow.DTOs;
using DayFlow.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace DayFlow.Services;

public class AuthService : IAuthService
{
    private readonly DayFlowDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly IConfiguration _configuration;
    private readonly ICurrentUserService _currentUser;

    public AuthService(
        DayFlowDbContext context,
        IPasswordService passwordService,
        IConfiguration configuration,
        ICurrentUserService currentUser)
    {
        _context = context;
        _passwordService = passwordService;
        _configuration = configuration;
        _currentUser = currentUser;
    }

    public async Task<AuthResponse> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        var name = request.Name.Trim();
        var email = request.Email.Trim().ToLowerInvariant();

        ValidateCredentials(name, email, request.Password);

        if (await _context.Users.AnyAsync(
                user => user.Email == email,
                cancellationToken))
        {
            throw new InvalidOperationException(
                "An account with this email already exists.");
        }

        var now = DateTime.UtcNow;

        var user = new User
        {
            Name = name,
            Email = email,
            PasswordHash = _passwordService.Hash(request.Password),
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync(cancellationToken);

        _context.UserSettings.Add(new UserSettings
        {
            UserId = user.Id,
            WeatherLocation = "Mumbai",
            TimeFormat = "12-hour",
            Theme = "system",
            DefaultReminderMinutes = 10,
            UpdatedAt = now
        });

        await _context.SaveChangesAsync(cancellationToken);

        return CreateAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(
                u => u.Email == email,
                cancellationToken);

        if (user is null ||
            !user.IsActive ||
            !_passwordService.Verify(
                request.Password,
                user.PasswordHash))
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return CreateAuthResponse(user);
    }

    public async Task<UserResponse> GetCurrentUserAsync(
        CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(
                u => u.Id == _currentUser.UserId,
                cancellationToken);

        if (user is null || !user.IsActive)
            throw new UnauthorizedAccessException(
                "User account is unavailable.");

        return ToUserResponse(user);
    }

    public async Task ChangePasswordAsync(
        ChangePasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            throw new ArgumentException("Current password is required.");

        ValidatePassword(request.NewPassword);

        var user = await _context.Users
            .FirstOrDefaultAsync(
                u => u.Id == _currentUser.UserId,
                cancellationToken);

        if (user is null || !user.IsActive)
            throw new UnauthorizedAccessException(
                "User account is unavailable.");

        if (!_passwordService.Verify(
                request.CurrentPassword,
                user.PasswordHash))
        {
            throw new UnauthorizedAccessException(
                "Current password is incorrect.");
        }

        user.PasswordHash = _passwordService.Hash(
            request.NewPassword);

        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
    }

    private AuthResponse CreateAuthResponse(User user)
    {
        var expiresMinutes = GetTokenLifetime();

        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()),
            new Claim(
                ClaimTypes.Name,
                user.Name),
            new Claim(
                ClaimTypes.Email,
                user.Email),
            new Claim(
                JwtRegisteredClaimNames.Sub,
                user.Id.ToString())
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(GetJwtSecret()));

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expiresMinutes),
            signingCredentials: credentials);

        return new AuthResponse
        {
            Token = new JwtSecurityTokenHandler()
                .WriteToken(token),
            ExpiresInMinutes = expiresMinutes,
            User = ToUserResponse(user)
        };
    }

    private int GetTokenLifetime()
    {
        return int.TryParse(
            _configuration["Jwt:ExpiresInMinutes"],
            out var minutes) && minutes > 0
            ? minutes
            : 120;
    }

    private string GetJwtSecret()
    {
        var secret = _configuration["Jwt:Secret"];

        if (string.IsNullOrWhiteSpace(secret) ||
            secret.Length < 32)
        {
            throw new InvalidOperationException(
                "Jwt:Secret must be configured with at least 32 characters.");
        }

        return secret;
    }

    private static UserResponse ToUserResponse(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email
        };
    }

    private static void ValidateCredentials(
        string name,
        string email,
        string password)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required.");

        if (name.Length > 100)
            throw new ArgumentException(
                "Name cannot exceed 100 characters.");

        if (!email.Contains('@') || email.Length > 200)
            throw new ArgumentException(
                "A valid email address is required.");

        ValidatePassword(password);
    }

    private static void ValidatePassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password) ||
            password.Length < 8)
        {
            throw new ArgumentException(
                "Password must be at least 8 characters.");
        }

        if (password.Length > 128)
            throw new ArgumentException(
                "Password cannot exceed 128 characters.");
    }
}
