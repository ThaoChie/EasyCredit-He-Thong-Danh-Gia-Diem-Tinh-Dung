using FluentValidation;
using EasyCredit.API.Models;

namespace EasyCredit.API.Validators;

public class FinancialProfileValidator : AbstractValidator<FinancialProfile>
{
    public FinancialProfileValidator()
    {
        RuleFor(x => x.UserId)
            .GreaterThan(0).WithMessage("ID người dùng không hợp lệ.")
            .NotNull().WithMessage("ID người dùng không được để trống.");

        RuleFor(x => x.MonthlyIncome)
            .GreaterThanOrEqualTo(0).WithMessage("Thu nhập hàng tháng phải không âm.")
            .NotNull().WithMessage("Thu nhập hàng tháng không được để trống.");

        RuleFor(x => x.ExistingDebt)
            .GreaterThanOrEqualTo(0).WithMessage("Nợ hiện tại phải không âm.")
            .NotNull().WithMessage("Nợ hiện tại không được để trống.");

        RuleFor(x => x.EmploymentStatus)
            .NotEmpty().WithMessage("Tình trạng công việc không được để trống.")
            .Must(BeValidEmploymentStatus).WithMessage("Tình trạng công việc không hợp lệ. Các giá trị cho phép: Employed, SelfEmployed, Unemployed.");
            
        RuleFor(x => x.HasCollateral)
            .NotNull().WithMessage("Thông tin tài sản đảm bảo không được để trống.");
    }

    private bool BeValidEmploymentStatus(string status)
    {
        return status == "Employed" || status == "SelfEmployed" || status == "Unemployed";
    }
}
