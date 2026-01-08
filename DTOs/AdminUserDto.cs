namespace RoleBasedItemApi.DTOs;

public class AdminUserDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string Role { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
