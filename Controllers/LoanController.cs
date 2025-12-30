using Microsoft.AspNetCore.Mvc;
using EasyCredit.API.Models;
using EasyCredit.API.Data;
using EasyCredit.API.Services;
using Microsoft.EntityFrameworkCore;
// Thư viện tạo PDF
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace EasyCredit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoanController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly CreditScoringService _scoringService;

    public LoanController(ApplicationDbContext context, CreditScoringService scoringService)
    {
        _context = context;
        _scoringService = scoringService;
    }

    // 1. API Gửi đơn vay
    [HttpPost]
    public IActionResult ApplyForLoan([FromBody] LoanApplication application)
    {
        application.CreatedAt = DateTime.Now;
        application.Status = "Pending";
        
        _context.LoanApplications.Add(application);
        _context.SaveChanges();

        // Tự động chấm điểm
        var financialProfile = _context.FinancialProfiles
                                .FirstOrDefault(f => f.UserId == application.UserId);

        if (financialProfile != null)
        {
            var scoreResult = _scoringService.CalculateScore(financialProfile, application.Id);
            _context.CreditScores.Add(scoreResult);

            if (scoreResult.Recommendation == "Approve") application.Status = "Approved";
            if (scoreResult.Recommendation == "Reject") application.Status = "Rejected";

            _context.SaveChanges();
        }

        return Ok(new { Message = "Nộp đơn thành công!", LoanId = application.Id, Status = application.Status });
    }

    // 2. API Lấy danh sách (Kèm User và Điểm)
    [HttpGet]
    public IActionResult GetAllLoans()
    {
        var loans = _context.LoanApplications
                            .Include(l => l.User)
                            .Include(l => l.CreditScore)
                            .OrderByDescending(l => l.CreatedAt)
                            .ToList();
        return Ok(loans);
    }

    // 3. API Tải hợp đồng PDF (Đã sửa lỗi Font chữ)
    [HttpGet("{id}/contract")]
    public IActionResult DownloadContract(int id)
    {
        var loan = _context.LoanApplications.Include(l => l.User).FirstOrDefault(l => l.Id == id);
        
        if (loan == null) return NotFound("Không tìm thấy đơn vay");

        // Tạo nội dung PDF
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                
                // QUAN TRỌNG: Chỉ set cỡ chữ, KHÔNG set FontFamily để tránh lỗi
                page.DefaultTextStyle(x => x.FontSize(12)); 

                page.Header()
                    .Text("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM")
                    .SemiBold().FontSize(16).AlignCenter();

                page.Content()
                    .PaddingVertical(1, Unit.Centimetre)
                    .Column(x =>
                    {
                        x.Item().Text("Độc lập - Tự do - Hạnh phúc").AlignCenter().Italic();
                        x.Item().PaddingTop(20).Text("HỢP ĐỒNG TÍN DỤNG").Bold().FontSize(20).AlignCenter();
                        x.Item().Text($"Số: HD-{loan.Id}/2025").AlignCenter();

                        x.Item().PaddingTop(20).Text("Hôm nay, ngày " + DateTime.Now.ToString("dd/MM/yyyy") + ", tại EasyCredit, chúng tôi gồm:");
                        
                        x.Item().PaddingTop(10).Text("BÊN A (BÊN CHO VAY): CÔNG TY TÀI CHÍNH EASYCREDIT").Bold();
                        
                        x.Item().PaddingTop(10).Text("BÊN B (BÊN VAY):").Bold();
                        x.Item().Text($"- Ông/Bà: {loan.User?.FullName}");
                        x.Item().Text($"- Mã khách hàng: {loan.UserId}");

                        x.Item().PaddingTop(20).Text("Hai bên thống nhất ký kết hợp đồng vay vốn với nội dung sau:");
                        x.Item().PaddingTop(5).Text($"1. Số tiền vay: {loan.Amount:N0} VNĐ");
                        x.Item().Text($"2. Mục đích sử dụng: {loan.Purpose}");
                        x.Item().Text($"3. Lãi suất: 1.5%/tháng");
                        x.Item().Text($"4. Trạng thái hồ sơ: {loan.Status}");

                        x.Item().PaddingTop(30).Row(row =>
                        {
                            row.RelativeItem().Column(c => {
                                c.Item().Text("ĐẠI DIỆN BÊN A").Bold().AlignCenter();
                                c.Item().Text("(Đã ký)").Italic().AlignCenter();
                            });
                            row.RelativeItem().Column(c => {
                                c.Item().Text("ĐẠI DIỆN BÊN B").Bold().AlignCenter();
                                c.Item().PaddingTop(50).Text(loan.User?.FullName).AlignCenter();
                            });
                        });
                    });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Trang ");
                        x.CurrentPageNumber();
                    });
            });
        });

        // Xuất ra file Stream
        var stream = new MemoryStream();
        document.GeneratePdf(stream);
        stream.Position = 0;

        return File(stream, "application/pdf", $"HopDong_Vay_{id}.pdf");
    }
}