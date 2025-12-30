namespace EasyCredit.API.Models;

public class FinancialProfile
{
    public int Id { get; set; }
    
    // Liên kết với User
    public int UserId { get; set; }
    public User? User { get; set; }

    public double MonthlyIncome { get; set; } // Thu nhập hàng tháng
    public double ExistingDebt { get; set; }  // Nợ hiện tại
    public string EmploymentStatus { get; set; } = "Unemployed"; // Employed, SelfEmployed, Unemployed
    public bool HasCollateral { get; set; } // Có tài sản đảm bảo không?
}