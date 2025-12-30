using Microsoft.AspNetCore.Mvc;
using EasyCredit.API.Models;
using EasyCredit.API.Data;
using BCrypt.Net;
using EasyCredit.API.DTOs; // Import DTOs namespace
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore; // Add this for async EF Core methods

namespace EasyCredit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration; // Inject IConfiguration

    public UserController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    // 1. Tạo User mới (Đăng ký)
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] User user)
    {
        // Kiểm tra xem Username đã tồn tại chưa
        if (_context.Users.Any(u => u.Username == user.Username))
        {
            return Conflict("Tên đăng nhập đã tồn tại.");
        }

        // Hash mật khẩu trước khi lưu
        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        
        // Gán role mặc định là "Customer" nếu không có hoặc không hợp lệ
        if (string.IsNullOrWhiteSpace(user.Role) || (user.Role != "Admin" && user.Role != "Customer"))
        {
            user.Role = "Customer";
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok(new { Message = "Đăng ký thành công!", UserId = user.Id, Username = user.Username, Role = user.Role });
    }

    // 2. Đăng nhập
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginDto)
    {
        var user = await _context.Users.SingleOrDefaultAsync(u => u.Username == loginDto.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
        {
            return Unauthorized("Tên đăng nhập hoặc mật khẩu không đúng.");
        }

        // Tạo JWT Token
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured")));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            _configuration["Jwt:Issuer"],
            _configuration["Jwt:Audience"],
            claims,
            expires: DateTime.Now.AddMinutes(120), // Token hết hạn sau 120 phút
            signingCredentials: credentials);

        return Ok(new { Token = new JwtSecurityTokenHandler().WriteToken(token), Role = user.Role });
    }

    // 3. Lấy danh sách toàn bộ User (Dành cho Admin)
    [HttpGet]
    // [Authorize(Roles = "Admin")] // Bỏ comment dòng này nếu muốn bảo mật
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _context.Users.Select(u => new {
            u.Id,
            u.Username,
            u.FullName,
            u.Role
        }).ToListAsync();
        
        return Ok(users);
    }
}