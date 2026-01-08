using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoleBasedItemApi.Contracts;
using RoleBasedItemApi.DTOs;
using RoleBasedItemApi.Repositories;
using RoleBasedItemApi.Services;
using System.Security.Claims;

namespace RoleBasedItemApi.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "Admin")]
    public class AdminUsersController : ControllerBase
    {
        private readonly IUserRepository _users;
        private readonly IAdminUserRepository _adminUsers;
        private readonly IPasswordHasher _hasher;
        private readonly IAuditRepository _audit;

        public AdminUsersController(
            IUserRepository users,
            IAdminUserRepository adminUsers,
            IPasswordHasher hasher,
            IAuditRepository audit)
        {
            _users = users;
            _adminUsers = adminUsers;
            _hasher = hasher;
            _audit = audit;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Username) || req.Username.Length < 3)
                return BadRequest(new { message = "Username must be at least 3 characters." });

            if (string.IsNullOrWhiteSpace(req.Password) || req.Password.Length < 6)
                return BadRequest(new { message = "Password must be at least 6 characters." });

            var role = req.Role?.Trim();
            if (role != "Admin" && role != "User")
                return BadRequest(new { message = "Role must be Admin or User." });

            var existing = await _users.GetByUsername(req.Username);
            if (existing is not null)
                return Conflict(new { message = "Username already exists." });

            var hash = _hasher.Hash(req.Password);

            int newUserId;
            try
            {
                newUserId = await _users.Create(req.Username, hash, role);
            }
            catch (Exception ex) when (ex.Message.Contains("USERNAME_EXISTS", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { message = "Username already exists." });
            }

            int? actorId = GetActorId();
            await _audit.Write(actorId, "CreateUser", "User", newUserId,
                $"{{\"username\":\"{req.Username}\",\"role\":\"{role}\"}}");

            return Ok(new { userId = newUserId, username = req.Username, role });
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var all = await _users.GetAll();
            var result = all.Select(u => new UserResponse(u.UserId, u.Username, u.Role, u.IsActive));
            return Ok(result);
        }

        // ✅ Update role
        [HttpPut("{id:int}/role")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] AdminUpdateUserRoleRequest req)
        {
            var role = req.Role?.Trim();
            if (role != "Admin" && role != "User")
                return BadRequest(new { message = "Role must be Admin or User." });

            var actorId = GetActorId();
            if (actorId.HasValue && actorId.Value == id && role != "Admin")
                return BadRequest(new { message = "You cannot remove Admin role from yourself." });

            await _adminUsers.UpdateRoleAsync(id, role);

            await _audit.Write(actorId, "UpdateUserRole", "User", id,
                $"{{\"role\":\"{role}\"}}");

            return Ok();
        }

        // ✅ Reset password
        [HttpPost("{id:int}/reset-password")]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] AdminResetPasswordRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.NewPassword) || req.NewPassword.Length < 6)
                return BadRequest(new { message = "NewPassword must be at least 6 characters." });

            var actorId = GetActorId();
            if (actorId.HasValue && actorId.Value == id)
            {
                // Allowed, but you can remove this check if you want.
                // Just keeping it explicit.
            }

            var newHash = _hasher.Hash(req.NewPassword);
            await _users.UpdatePasswordHash(id, newHash);

            await _audit.Write(actorId, "ResetPassword", "User", id, "{}");

            return Ok();
        }

        // ✅ Delete user
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var actorId = GetActorId();
            if (actorId.HasValue && actorId.Value == id)
                return BadRequest(new { message = "You cannot delete your own user." });

            await _adminUsers.DeleteAsync(id);

            await _audit.Write(actorId, "DeleteUser", "User", id, "{}");

            return Ok();
        }

        // One-shot upgrade for any legacy plaintext passwords currently stored
        [HttpPost("upgrade-legacy-passwords")]
        public async Task<IActionResult> UpgradeLegacyPasswords()
        {
            var all = await _users.GetAll();

            int? actorId = GetActorId();
            int upgraded = 0;

            foreach (var u in all)
            {
                if (!u.PasswordHash.StartsWith("PBKDF2.", StringComparison.OrdinalIgnoreCase))
                {
                    var newHash = _hasher.Hash(u.PasswordHash);
                    await _users.UpdatePasswordHash(u.UserId, newHash);
                    upgraded++;

                    await _audit.Write(actorId, "UpgradePasswordHash", "User", u.UserId,
                        $"{{\"username\":\"{u.Username}\"}}");
                }
            }

            return Ok(new { upgraded });
        }

        private int? GetActorId()
        {
            var actorIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(actorIdStr, out var parsed) ? parsed : null;
        }
    }
}
