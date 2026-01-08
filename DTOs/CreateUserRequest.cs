namespace RoleBasedItemApi.DTOs
{
    public record CreateUserRequest(string Username, string Password, string Role);
}
