namespace EasyCredit.API.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; // Lưu ý: Thực tế cần mã hóa, demo thì để plain text tạm
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = "Customer"; // "Admin" hoặc "Customer"
}