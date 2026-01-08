using Dapper;
using RoleBasedItemApi.Data;
using RoleBasedItemApi.Models;
using System.Data;

namespace RoleBasedItemApi.Repositories
{
    public interface IItemRepository
    {
        Task<IEnumerable<Item>> GetAll();
        Task<int> Create(string name, string? description, int? createdByUserId);
    }

    public class ItemRepository : IItemRepository
    {
        private readonly IDbConnectionFactory _db;

        public ItemRepository(IDbConnectionFactory db)
        {
            _db = db;
        }

        public async Task<IEnumerable<Item>> GetAll()
        {
            using var conn = _db.Create();
            return await conn.QueryAsync<Item>(
                "dbo.spItems_GetAll",
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> Create(string name, string? description, int? createdByUserId)
        {
            using var conn = _db.Create();
            return await conn.ExecuteScalarAsync<int>(
                "dbo.spItems_Create",
                new { Name = name, Description = description, CreatedByUserId = createdByUserId },
                commandType: CommandType.StoredProcedure);
        }
    }
}
