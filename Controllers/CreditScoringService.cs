using EasyCredit.API.Models;

namespace EasyCredit.API.Services;

public class CreditScoringService
{
    // Hàm nhận vào Hồ sơ tài chính -> Trả về Kết quả chấm điểm
    public CreditScore CalculateScore(FinancialProfile profile, int loanId)
    {
        int score = 0;
        var result = new CreditScore
        {
            LoanApplicationId = loanId,
            TotalScore = 0,
            Rank = "C",
            Recommendation = "Reject"
        };

        // 1. Tiêu chí Thu nhập
        if (profile.MonthlyIncome > 20000000) score += 40;       // > 20tr
        else if (profile.MonthlyIncome >= 10000000) score += 20; // 10-20tr
        else score += 5;                                         // < 10tr

        // 2. Tiêu chí Tỷ lệ Nợ / Thu nhập
        if (profile.MonthlyIncome > 0)
        {
            double debtRatio = profile.ExistingDebt / profile.MonthlyIncome;
            if (debtRatio < 0.3) score += 30;       // Nợ ít (<30%)
            else if (debtRatio <= 0.5) score += 10; // Nợ vừa (30-50%)
            else score -= 20;                       // Nợ ngập đầu (>50%)
        }

        // 3. Tiêu chí Công việc
        if (profile.EmploymentStatus == "Employed") score += 20;
        else score += 5; // Tự do hoặc Thất nghiệp

        // 4. Có tài sản đảm bảo
        if (profile.HasCollateral) score += 15;

        // --- TỔNG KẾT ---
        result.TotalScore = score;

        if (score >= 70)
        {
            result.Rank = "A";
            result.Recommendation = "Approve"; // Duyệt ngay
        }
        else if (score >= 40)
        {
            result.Rank = "B";
            result.Recommendation = "Review"; // Xem xét
        }
        else
        {
            result.Rank = "C";
            result.Recommendation = "Reject"; // Từ chối
        }

        return result;
    }
}