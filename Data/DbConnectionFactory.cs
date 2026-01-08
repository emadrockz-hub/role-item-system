using Microsoft.Data.SqlClient;
using System.Data;

namespace RoleBasedItemApi.Data
{
    public interface IDbConnectionFactory
    {
        IDbConnection Create();
    }

    public class DbConnectionFactory : IDbConnectionFactory
    {
        private readonly IConfiguration _config;

        public DbConnectionFactory(IConfiguration config)
        {
            _config = config;
        }

        public IDbConnection Create()
        {
            var cs = _config.GetConnectionString("Default");
            return new SqlConnection(cs);
        }
    }
}
