using Microsoft.AspNetCore.Mvc;
using EasyCredit.API.Models;
using EasyCredit.API.Data;

namespace EasyCredit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UserController(ApplicationDbContext context)
    {
        _context = context;
    }

    // 1. Tạo User mới
    [HttpPost("register")]
    public IActionResult Register([FromBody] User user)
    {
        _context.Users.Add(user);
        _context.SaveChanges();
        return Ok(user);
    }

    // 2. Tạo Hồ sơ tài chính cho User
    [HttpPost("profile")]
    public IActionResult CreateProfile([FromBody] FinancialProfile profile)
    {
        _context.FinancialProfiles.Add(profile);
        _context.SaveChanges();
        return Ok(profile);
    }
}