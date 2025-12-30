using EasyCredit.API.Data;
using EasyCredit.API.Services;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Infrastructure;
using FluentValidation.AspNetCore;
using FluentValidation; // Add this
using EasyCredit.API.Validators;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;


// <--- 2. QUAN TRỌNG: Đăng ký License miễn phí (Bắt buộc)
QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Register FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<LoanApplicationValidator>();
// Đăng ký Service AI (Singleton vì Model chỉ cần load 1 lần)
builder.Services.AddSingleton<EasyCredit.API.Services.LoanRecommendationService>();

// Add Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured")))
        };
    });

builder.Services.AddAuthorization(); // Add Authorization service

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

app.UseAuthentication(); // IMPORTANT: Must be before UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();