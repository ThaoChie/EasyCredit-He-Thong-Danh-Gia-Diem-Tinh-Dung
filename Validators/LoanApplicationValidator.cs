using FluentValidation;
using EasyCredit.API.Models;

namespace EasyCredit.API.Validators;

public class LoanApplicationValidator : AbstractValidator<LoanApplication>
{
    public LoanApplicationValidator()
    {
        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Số tiền vay phải lớn hơn 0.")
            .NotNull().WithMessage("Số tiền vay không được để trống.");

        RuleFor(x => x.Purpose)
            .NotEmpty().WithMessage("Mục đích vay không được để trống.")
            .MaximumLength(500).WithMessage("Mục đích vay không được vượt quá 500 ký tự.");

        RuleFor(x => x.UserId)
            .GreaterThan(0).WithMessage("ID người dùng không hợp lệ.")
            .NotNull().WithMessage("ID người dùng không được để trống.");
            
        // Status và CreatedAt sẽ được tự động thiết lập bởi hệ thống, không cần validate từ client
    }
}
