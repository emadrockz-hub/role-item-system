using Dapper;
using RoleBasedItemApi.Data;
using RoleBasedItemApi.Models;
using System.Data;

namespace RoleBasedItemApi.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByUsername(string username);
        Task<int> Create(string username, string passwordHash, string role);
        Task<IEnumerable<User>> GetAll();
        Task UpdatePasswordHash(int userId, string newHash);
    }

    public class UserRepository : IUserRepository
    {
        private readonly IDbConnectionFactory _db;

        public UserRepository(IDbConnectionFactory db)
        {
            _db = db;
        }

        public async Task<User?> GetByUsername(string username)
        {
            using var conn = _db.Create();
            return await conn.QueryFirstOrDefaultAsync<User>(
                "dbo.spUsers_GetByUsername",
                new { Username = username },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> Create(string username, string passwordHash, string role)
        {
            using var conn = _db.Create();
            return await conn.ExecuteScalarAsync<int>(
                "dbo.spUsers_Create",
                new { Username = username, PasswordHash = passwordHash, Role = role },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<User>> GetAll()
        {
            using var conn = _db.Create();
            return await conn.QueryAsync<User>(
                "dbo.spUsers_GetAll",
                commandType: CommandType.StoredProcedure);
        }

        public async Task UpdatePasswordHash(int userId, string newHash)
        {
            using var conn = _db.Create();
            await conn.ExecuteAsync(
                "dbo.spUsers_UpdatePasswordHash",
                new { UserId = userId, PasswordHash = newHash },
                commandType: CommandType.StoredProcedure);
        }
    }
}
