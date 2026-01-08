namespace RoleBasedItemApi.DTOs;

public class AdminItemDto
{
    public int ItemId { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}
