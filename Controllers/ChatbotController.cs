using Microsoft.AspNetCore.Mvc;
using EasyCredit.API.Services; // Import Service AI
using Microsoft.AspNetCore.Authorization;

namespace EasyCredit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatbotController : ControllerBase
{
    private readonly LoanRecommendationService _aiService;

    public ChatbotController(LoanRecommendationService aiService)
    {
        _aiService = aiService;
    }

    // API nhận input từ Chatbot -> Trả về gói vay
    [HttpPost("recommend-ai")]
    public IActionResult Recommend([FromBody] LoanInputDto input)
    {
        // 1. Gọi AI dự đoán
        var predictedPackage = _aiService.Predict(input.Amount, input.Income, input.Term);

        // 2. Map kết quả dự đoán ra chi tiết gói vay để hiển thị Frontend
        object packageDetail = null;

        if (predictedPackage == "VIP")
        {
            packageDetail = new {
                Name = "👑 GÓI TÍN DỤNG VIP (AI Đề xuất)",
                Rate = "0.8%/tháng",
                Limit = "Đến 500 triệu",
                Desc = "Dựa trên thu nhập cao của bạn, đây là gói lãi suất thấp nhất."
            };
        }
        else if (predictedPackage == "STANDARD")
        {
            packageDetail = new {
                Name = "⭐ GÓI TIÊU DÙNG CHUẨN (AI Đề xuất)",
                Rate = "1.5%/tháng",
                Limit = "Đến 100 triệu",
                Desc = "Phù hợp với nhu cầu và thu nhập hiện tại của bạn."
            };
        }
        else // BASIC
        {
            packageDetail = new {
                Name = "🚀 GÓI KHỞI ĐỘNG (AI Đề xuất)",
                Rate = "0% tháng đầu",
                Limit = "Tối đa 15 triệu",
                Desc = "Gói hỗ trợ nhanh, thủ tục đơn giản cho khoản vay nhỏ."
            };
        }

        return Ok(new { 
            Prediction = predictedPackage, 
            Data = packageDetail,
            Message = "AI đã phân tích nhu cầu của bạn và tìm thấy gói phù hợp nhất:" 
        });
    }
}

// 👇👇👇 QUAN TRỌNG: Class này phải nằm ở đây (hoặc trong thư mục DTOs)
public class LoanInputDto
{
    public float Amount { get; set; }
    public float Income { get; set; }
    public float Term { get; set; }
}