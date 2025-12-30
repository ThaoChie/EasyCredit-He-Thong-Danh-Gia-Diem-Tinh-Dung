using Microsoft.AspNetCore.Mvc;
using EasyCredit.API.Models; // Dùng Model
using EasyCredit.API.Data;   // Dùng Database

namespace EasyCredit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomerController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CustomerController(ApplicationDbContext context)
    {
        _context = context;
    }

    // 1. Lấy danh sách (GET)
    [HttpGet]
    public IActionResult Get()
    {
        var list = _context.Customers.ToList();
        return Ok(list);
    }

    // 2. Thêm mới (POST) - Đây là hàm bạn đang cần!
    [HttpPost]
    public IActionResult Post([FromBody] Customer newCustomer)
    {
        // Kiểm tra dữ liệu
        if (newCustomer == null)
        {
            return BadRequest("Dữ liệu không hợp lệ");
        }

        // Thêm vào Database
        _context.Customers.Add(newCustomer);
        _context.SaveChanges(); // Lưu vĩnh viễn

        return Ok(newCustomer);
    }

    // 3. Xóa khách hàng (DELETE: api/customer/5)
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var customer = _context.Customers.Find(id);
        if (customer == null)
        {
            return NotFound(); // Không tìm thấy thì báo lỗi
        }

        _context.Customers.Remove(customer); // Xóa khỏi bộ nhớ
        _context.SaveChanges(); // Lưu thay đổi vào Database

        return Ok(); // Báo thành công
    }

    // 4. Sửa khách hàng (PUT: api/customer/5)
    [HttpPut("{id}")]
    public IActionResult Put(int id, [FromBody] Customer updatedInfo)
    {
        var customer = _context.Customers.Find(id);
        if (customer == null)
        {
            return NotFound();
        }

        // Cập nhật thông tin mới
        customer.Name = updatedInfo.Name;
        customer.Phone = updatedInfo.Phone;
        customer.Amount = updatedInfo.Amount;
        // customer.Status = updatedInfo.Status; // (Giữ nguyên trạng thái hoặc sửa tùy ý)

        _context.SaveChanges(); // Lưu đè lại vào Database

        return Ok(customer);
    }
}