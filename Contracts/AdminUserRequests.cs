namespace RoleBasedItemApi.Contracts;

public class AdminCreateUserRequest
{
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public string Role { get; set; } = "User"; // "User" or "Admin"
}

public class AdminUpdateUserRoleRequest
{
    public string Role { get; set; } = "User";
}

public class AdminResetPasswordRequest
{
    public string NewPassword { get; set; } = "";
}
