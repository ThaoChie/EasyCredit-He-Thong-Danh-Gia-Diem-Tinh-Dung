namespace EasyCredit.API.Models;

public class LoanApplication
{
    public int Id { get; set; }

    // Liên kết với User
    public int UserId { get; set; }
    public User? User { get; set; }

    public double Amount { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    // Liên kết 1-1 với kết quả chấm điểm (Để hiển thị luôn)
    public CreditScore? CreditScore { get; set; }
}