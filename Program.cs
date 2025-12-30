using EasyCredit.API.Data;
using EasyCredit.API.Services; // Dùng Service chấm điểm
using Microsoft.EntityFrameworkCore;
using QuestPDF.Infrastructure; // <--- 1. Thư viện PDF

// <--- 2. QUAN TRỌNG: Đăng ký License miễn phí (Bắt buộc)
QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Đăng ký Service chấm điểm (Bộ não AI)
builder.Services.AddScoped<CreditScoringService>();

// Kết nối Database SQLite
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=EasyCredit.db"));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Cấu hình CORS (Cho phép Frontend cổng 3000 gọi vào)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

app.Run();