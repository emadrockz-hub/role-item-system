using Dapper;
using RoleBasedItemApi.Data;
using RoleBasedItemApi.DTOs;
using System.Data;

namespace RoleBasedItemApi.Repositories
{
    public class AdminUserRepository : IAdminUserRepository
    {
        private readonly IDbConnectionFactory _db;

        public AdminUserRepository(IDbConnectionFactory db)
        {
            _db = db;
        }

        public async Task<IEnumerable<AdminUserDto>> GetAllAsync()
        {
            using var conn = _db.Create();
            return await conn.QueryAsync<AdminUserDto>(
                "dbo.spUsers_GetAll",
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> CreateAsync(string username, string passwordHash, string role)
        {
            using var conn = _db.Create();
            return await conn.ExecuteScalarAsync<int>(
                "dbo.spUsers_Create",
                new { Username = username, PasswordHash = passwordHash, Role = role },
                commandType: CommandType.StoredProcedure);
        }

        public async Task UpdateRoleAsync(int userId, string role)
        {
            using var conn = _db.Create();
            await conn.ExecuteAsync(
                "dbo.spUsers_UpdateRole",
                new { UserId = userId, Role = role },
                commandType: CommandType.StoredProcedure);
        }

        // We align with your existing naming pattern: spUsers_UpdatePasswordHash
        public async Task UpdatePasswordHashAsync(int userId, string passwordHash)
        {
            using var conn = _db.Create();
            await conn.ExecuteAsync(
                "dbo.spUsers_UpdatePasswordHash",
                new { UserId = userId, PasswordHash = passwordHash },
                commandType: CommandType.StoredProcedure);
        }

        public async Task DeleteAsync(int userId)
        {
            using var conn = _db.Create();
            await conn.ExecuteAsync(
                "dbo.spUsers_Delete",
                new { UserId = userId },
                commandType: CommandType.StoredProcedure);
        }
    }
}
