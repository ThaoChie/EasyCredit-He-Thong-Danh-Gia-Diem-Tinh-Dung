using Microsoft.AspNetCore.Mvc;
using EasyCredit.API.Models;
using EasyCredit.API.Data;
using EasyCredit.API.Services;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using EasyCredit.API.DTOs;
using System.Security.Claims; // <--- Cần thêm cái này để lấy ID người dùng

namespace EasyCredit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Yêu cầu đăng nhập (nhưng không bắt buộc là Admin ở đây)
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
        // QUAN TRỌNG: Luôn set là Pending để chờ duyệt
        application.Status = "Pending"; 
        
        _context.LoanApplications.Add(application);
        _context.SaveChanges();

        // Chấm điểm (giữ nguyên)
        var financialProfile = _context.FinancialProfiles
                                .FirstOrDefault(f => f.UserId == application.UserId);

        if (financialProfile != null)
        {
            var scoreResult = _scoringService.CalculateScore(financialProfile, application.Id);
            _context.CreditScores.Add(scoreResult);
            // Bỏ đoạn tự động duyệt Approve/Reject ở đây
            _context.SaveChanges();
        }

        return Ok(new { Message = "Nộp đơn thành công!", LoanId = application.Id, Status = application.Status });
    }

    // 2. API Lấy danh sách (ĐÃ SỬA LOGIC Ở ĐÂY)
    [HttpGet]
    // ❌ ĐÃ BỎ DÒNG: [Authorize(Roles = "Admin")]
    public IActionResult GetAllLoans()
    {
        // Lấy User ID và Role từ Token của người đang đăng nhập
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var userId = int.Parse(userIdString);

        // Chuẩn bị dữ liệu
        var query = _context.LoanApplications
                            .Include(l => l.User)
                            .Include(l => l.CreditScore)
                            .AsQueryable();

        // LOGIC PHÂN QUYỀN:
        // Nếu KHÔNG phải Admin thì chỉ được lấy đơn của chính mình
        if (role != "Admin")
        {
            query = query.Where(l => l.UserId == userId);
        }

        // Sắp xếp đơn mới nhất lên đầu
        var loans = query.OrderByDescending(l => l.CreatedAt).ToList();
        
        return Ok(loans);
    }

    // 3. API Tải hợp đồng PDF (Giữ nguyên)
    [HttpGet("{id}/contract")]
    public IActionResult DownloadContract(int id)
    {
        var loan = _context.LoanApplications.Include(l => l.User).FirstOrDefault(l => l.Id == id);
        
        if (loan == null) return NotFound("Không tìm thấy đơn vay");

        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(12));

                page.Header().Text("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM").SemiBold().FontSize(16).AlignCenter();

                page.Content().PaddingVertical(1, Unit.Centimetre).Column(x =>
                {
                    x.Item().Text("Độc lập - Tự do - Hạnh phúc").AlignCenter().Italic();
                    x.Item().PaddingTop(20).Text("HỢP ĐỒNG TÍN DỤNG").Bold().FontSize(20).AlignCenter();
                    x.Item().Text($"Số: HD-{loan.Id}/{DateTime.Now.Year}").AlignCenter();
                    x.Item().PaddingTop(20).Text($"Bên vay: {loan.User?.FullName}");
                    x.Item().Text($"Số tiền: {loan.Amount:N0} VNĐ");
                    x.Item().Text($"Trạng thái: {loan.Status}");
                    
                    x.Item().PaddingTop(30).Row(row =>
                    {
                        row.RelativeItem().Column(c => { c.Item().Text("ĐẠI DIỆN BÊN A").Bold().AlignCenter(); });
                        row.RelativeItem().Column(c => { c.Item().Text("ĐẠI DIỆN BÊN B").Bold().AlignCenter(); c.Item().PaddingTop(40).Text(loan.User?.FullName).AlignCenter(); });
                    });
                });
                
                page.Footer().AlignCenter().Text(x => { x.Span("Trang "); x.CurrentPageNumber(); });
            });
        });

        var stream = new System.IO.MemoryStream();
        document.GeneratePdf(stream);
        stream.Position = 0;
        return File(stream, "application/pdf", $"HopDong_Vay_{id}.pdf");
    }

    // 4. API Admin duyệt (Giữ nguyên)
    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateLoanStatus(int id, [FromBody] UpdateLoanStatusDto statusDto)
    {
        var loan = await _context.LoanApplications.FirstOrDefaultAsync(l => l.Id == id);
        if (loan == null) return NotFound($"Không tìm thấy đơn vay ID: {id}.");

        loan.Status = statusDto.Status;
        await _context.SaveChangesAsync();

        return Ok(new { Message = $"Cập nhật trạng thái thành công." });
    }

    [HttpPost("{id}/accept")]
    public async Task<IActionResult> AcceptContract(int id)
    {
        // 1. Lấy User đang đăng nhập
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
        var userId = int.Parse(userIdString);

        // 2. Tìm đơn vay
        var loan = await _context.LoanApplications.FirstOrDefaultAsync(l => l.Id == id);
        
        if (loan == null) return NotFound("Không tìm thấy đơn vay.");
        
        // 3. Kiểm tra quyền sở hữu
        if (loan.UserId != userId) return Forbid("Bạn không có quyền ký hợp đồng này.");

        // 4. Chỉ được ký khi trạng thái đang là "Approved" (Admin đã duyệt)
        if (loan.Status != "Approved")
        {
            return BadRequest("Hợp đồng chưa sẵn sàng hoặc đã được xử lý.");
        }

        // 5. Cập nhật trạng thái thành "Disbursed" (Đã giải ngân)
        loan.Status = "Disbursed";
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Chúc mừng! Bạn đã ký hợp đồng thành công. Tiền đang được chuyển về ví." });
    }
}