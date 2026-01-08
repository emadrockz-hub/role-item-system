using Dapper;
using RoleBasedItemApi.Data;
using RoleBasedItemApi.DTOs;
using RoleBasedItemApi.Models;
using System.Data;

namespace RoleBasedItemApi.Repositories
{
    public class AdminItemRepository : IAdminItemRepository
    {
        private readonly IDbConnectionFactory _db;

        public AdminItemRepository(IDbConnectionFactory db)
        {
            _db = db;
        }

        public async Task<IEnumerable<AdminItemDto>> GetAllAsync()
        {
            using var conn = _db.Create();
            return await conn.QueryAsync<AdminItemDto>(
                "dbo.spItems_GetAll",
                commandType: CommandType.StoredProcedure);
        }

        public async Task UpdateAsync(int itemId, string name, string description)
        {
            using var conn = _db.Create();
            await conn.ExecuteAsync(
                "dbo.spItems_Update",
                new { ItemId = itemId, Name = name, Description = description },
                commandType: CommandType.StoredProcedure);
        }

        public async Task DeleteAsync(int itemId)
        {
            using var conn = _db.Create();
            await conn.ExecuteAsync(
                "dbo.spItems_Delete",
                new { ItemId = itemId },
                commandType: CommandType.StoredProcedure);
        }
    }
}
