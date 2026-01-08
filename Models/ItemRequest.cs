namespace RoleBasedItemApi.Models
{
    public class ItemRequest
    {
        public int RequestId { get; set; }
        public int RequestedByUserId { get; set; }

        public string Name { get; set; } = "";
        public string? Description { get; set; }

        public string Status { get; set; } = "Pending"; // Pending/Approved/Denied
        public string? DenyReason { get; set; }
        public string? RequestedByUsername { get; set; }

        public string? ReviewedByAdminUsername { get; set; }

        public string? AppealMessage { get; set; }
        public DateTime? AppealedAt { get; set; }

        public int? ReviewedByAdminUserId { get; set; }
        public DateTime? ReviewedAt { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
