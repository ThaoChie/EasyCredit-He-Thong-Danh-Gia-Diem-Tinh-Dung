namespace EasyCredit.API.Models;

public class CreditScore
{
    public int Id { get; set; }

    // Liên kết với Đơn vay
    public int LoanApplicationId { get; set; }
    
    public int TotalScore { get; set; } // Tổng điểm
    public string Rank { get; set; } = "C"; // A, B, C
    public string Recommendation { get; set; } = "Reject"; // Approve, Review, Reject
}