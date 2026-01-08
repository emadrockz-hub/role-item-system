using Dapper;
using RoleBasedItemApi.Data;
using System.Data;

namespace RoleBasedItemApi.Repositories
{
    public interface IAuditRepository
    {
        Task Write(int? actorUserId, string action, string entityType, int entityId, string? details = null);
    }

    public class AuditRepository : IAuditRepository
    {
        private readonly IDbConnectionFactory _db;

        public AuditRepository(IDbConnectionFactory db)
        {
            _db = db;
        }

        public async Task Write(int? actorUserId, string action, string entityType, int entityId, string? details = null)
        {
            using var conn = _db.Create();
            await conn.ExecuteAsync(
                "dbo.spAudit_Insert",
                new
                {
                    ActorUserId = actorUserId,
                    Action = action,
                    EntityType = entityType,
                    EntityId = entityId,
                    Details = details
                },
                commandType: CommandType.StoredProcedure);
        }
    }
}
