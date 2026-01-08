namespace RoleBasedItemApi.Models
{
    public class Item
    {
        public int ItemId { get; set; }
        public string Name { get; set; } = "";
        public string? Description { get; set; }
        public int? CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
