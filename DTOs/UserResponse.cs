namespace RoleBasedItemApi.DTOs
{
    public record UserResponse(int UserId, string Username, string Role, bool IsActive);
}
