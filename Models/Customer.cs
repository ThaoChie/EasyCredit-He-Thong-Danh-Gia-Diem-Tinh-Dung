namespace EasyCredit.API.Models;

public class Customer
{
    // Id là khóa chính (tự tăng)
    public int Id { get; set; }

    // Họ và tên khách
    public string Name { get; set; } = string.Empty;

    // Số điện thoại
    public string Phone { get; set; } = string.Empty;

    // Số tiền vay (dùng decimal cho tiền bạc để chính xác)
    public decimal Amount { get; set; }

    // Trạng thái: "Chờ", "Duyệt", "Từ chối"
    public string Status { get; set; } = "Chờ";
}