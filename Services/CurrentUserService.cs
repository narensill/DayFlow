using System.Security.Claims;

namespace DayFlow.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public int UserId
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?
                .User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(value, out var userId) || userId <= 0)
                throw new UnauthorizedAccessException("Authenticated user is required.");

            return userId;
        }
    }
}
