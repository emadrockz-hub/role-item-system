using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoleBasedItemApi.Repositories;
using RoleBasedItemApi.Services;
using System.Security.Claims;

namespace RoleBasedItemApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _users;
        private readonly IPasswordHasher _hasher;
        private readonly IJwtTokenService _jwt;

        public AuthController(IUserRepository users, IPasswordHasher hasher, IJwtTokenService jwt)
        {
            _users = users;
            _hasher = hasher;
            _jwt = jwt;
        }

        public record LoginRequest(string Username, string Password);

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            var user = await _users.GetByUsername(req.Username);

            if (user is null || !user.IsActive)
                return Unauthorized(new { message = "Invalid credentials" });

            var ok = _hasher.Verify(user.PasswordHash, req.Password, out var isLegacyPlainText);
            if (!ok)
                return Unauthorized(new { message = "Invalid credentials" });

            // Auto-upgrade old plaintext password to PBKDF2 on successful login
            if (isLegacyPlainText)
            {
                var newHash = _hasher.Hash(req.Password);
                await _users.UpdatePasswordHash(user.UserId, newHash);
            }

            var token = _jwt.CreateToken(user.UserId, user.Username, user.Role);

            return Ok(new
            {
                token,
                user = new { user.UserId, user.Username, user.Role }
            });
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            return Ok(new
            {
                userId = User.FindFirstValue(ClaimTypes.NameIdentifier),
                username = User.Identity?.Name,
                role = User.FindFirstValue(ClaimTypes.Role)
            });
        }
    }
}
