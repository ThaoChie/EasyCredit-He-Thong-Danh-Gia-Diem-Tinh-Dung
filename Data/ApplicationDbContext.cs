using EasyCredit.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EasyCredit.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // Khai báo các bảng mới
    public DbSet<User> Users { get; set; }
    public DbSet<FinancialProfile> FinancialProfiles { get; set; }
    public DbSet<LoanApplication> LoanApplications { get; set; }
    public DbSet<CreditScore> CreditScores { get; set; }

    // (Tùy chọn) Bảng cũ nếu muốn giữ
    public DbSet<Customer> Customers { get; set; }
}