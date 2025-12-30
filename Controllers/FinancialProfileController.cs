using Microsoft.AspNetCore.Mvc;
using EasyCredit.API.Models;
using EasyCredit.API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;

namespace EasyCredit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // All financial profile actions require authentication
public class FinancialProfileController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FinancialProfileController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/FinancialProfile/{userId}
    [HttpGet("{userId}")]
    public async Task<ActionResult<FinancialProfile>> GetFinancialProfile(int userId)
    {
        var financialProfile = await _context.FinancialProfiles
                                             .FirstOrDefaultAsync(fp => fp.UserId == userId);

        if (financialProfile == null)
        {
            return NotFound($"Không tìm thấy hồ sơ tài chính cho người dùng có ID: {userId}.");
        }

        return Ok(financialProfile);
    }

    // POST: api/FinancialProfile
    [HttpPost]
    public async Task<ActionResult<FinancialProfile>> CreateFinancialProfile([FromBody] FinancialProfile financialProfile)
    {
        // Kiểm tra xem người dùng đã có hồ sơ tài chính chưa
        var existingProfile = await _context.FinancialProfiles
                                            .FirstOrDefaultAsync(fp => fp.UserId == financialProfile.UserId);

        if (existingProfile != null)
        {
            return Conflict($"Người dùng có ID: {financialProfile.UserId} đã có hồ sơ tài chính. Vui lòng sử dụng PUT để cập nhật.");
        }

        _context.FinancialProfiles.Add(financialProfile);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFinancialProfile), new { userId = financialProfile.UserId }, financialProfile);
    }

    // PUT: api/FinancialProfile/{userId}
    [HttpPut("{userId}")]
    public async Task<IActionResult> UpdateFinancialProfile(int userId, [FromBody] FinancialProfile financialProfile)
    {
        if (userId != financialProfile.UserId)
        {
            return BadRequest("ID người dùng trong URL không khớp với ID trong hồ sơ.");
        }

        var existingProfile = await _context.FinancialProfiles
                                            .FirstOrDefaultAsync(fp => fp.UserId == userId);

        if (existingProfile == null)
        {
            return NotFound($"Không tìm thấy hồ sơ tài chính cho người dùng có ID: {userId}.");
        }

        // Cập nhật các trường
        existingProfile.MonthlyIncome = financialProfile.MonthlyIncome;
        existingProfile.ExistingDebt = financialProfile.ExistingDebt;
        existingProfile.EmploymentStatus = financialProfile.EmploymentStatus;
        existingProfile.HasCollateral = financialProfile.HasCollateral;

        _context.Entry(existingProfile).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.FinancialProfiles.Any(e => e.Id == existingProfile.Id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }
}