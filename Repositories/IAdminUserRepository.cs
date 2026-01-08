using RoleBasedItemApi.DTOs;

namespace RoleBasedItemApi.Repositories
{
    public interface IAdminUserRepository
    {
        Task<IEnumerable<AdminUserDto>> GetAllAsync();
        Task<int> CreateAsync(string username, string passwordHash, string role);
        Task UpdateRoleAsync(int userId, string role);
        Task UpdatePasswordHashAsync(int userId, string passwordHash);
        Task DeleteAsync(int userId);
    }
}
