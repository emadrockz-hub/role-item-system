using Dapper;
using RoleBasedItemApi.Data;
using RoleBasedItemApi.Models;
using System.Data;

namespace RoleBasedItemApi.Repositories
{
    public interface IRequestRepository
    {
        Task<int> Create(int requestedByUserId, string name, string? description);
        Task<IEnumerable<ItemRequest>> GetMine(int requestedByUserId);
        Task<IEnumerable<ItemRequest>> AdminGetAll();
        Task<int> AdminApprove(int requestId, int adminUserId); // returns NewItemId
        Task AdminDeny(int requestId, int adminUserId, string denyReason);
        Task Appeal(int requestId, int requestedByUserId, string appealMessage);
    }

    public class RequestRepository : IRequestRepository
    {
        private readonly IDbConnectionFactory _db;

        public RequestRepository(IDbConnectionFactory db)
        {
            _db = db;
        }

        public async Task<int> Create(int requestedByUserId, string name, string? description)
        {
            using var conn = _db.Create();
            return await conn.ExecuteScalarAsync<int>(
                "dbo.spRequests_Create",
                new { RequestedByUserId = requestedByUserId, Name = name, Description = description },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<ItemRequest>> GetMine(int requestedByUserId)
        {
            using var conn = _db.Create();
            return await conn.QueryAsync<ItemRequest>(
                "dbo.spRequests_GetMine",
                new { RequestedByUserId = requestedByUserId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<ItemRequest>> AdminGetAll()
        {
            using var conn = _db.Create();
            return await conn.QueryAsync<ItemRequest>(
                "dbo.spAdminRequests_GetAll",
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> AdminApprove(int requestId, int adminUserId)
        {
            using var conn = _db.Create();
            return await conn.ExecuteScalarAsync<int>(
                "dbo.spAdminRequests_Approve",
                new { RequestId = requestId, AdminUserId = adminUserId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task AdminDeny(int requestId, int adminUserId, string denyReason)
        {
            using var conn = _db.Create();
            await conn.ExecuteAsync(
                "dbo.spAdminRequests_Deny",
                new { RequestId = requestId, AdminUserId = adminUserId, DenyReason = denyReason },
                commandType: CommandType.StoredProcedure);
        }

        public async Task Appeal(int requestId, int requestedByUserId, string appealMessage)
        {
            using var conn = _db.Create();
            await conn.ExecuteAsync(
                "dbo.spRequests_Appeal",
                new { RequestId = requestId, RequestedByUserId = requestedByUserId, AppealMessage = appealMessage },
                commandType: CommandType.StoredProcedure);
        }
    }
}
