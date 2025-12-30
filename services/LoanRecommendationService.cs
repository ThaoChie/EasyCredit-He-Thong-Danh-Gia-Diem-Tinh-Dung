using Microsoft.ML;
using Microsoft.ML.Data;

namespace EasyCredit.API.Services;

// 1. Định nghĩa dữ liệu đầu vào (Input)
public class LoanInputData
{
    [LoadColumn(0)] public float Amount { get; set; }        // Số tiền muốn vay
    [LoadColumn(1)] public float MonthlyIncome { get; set; } // Thu nhập
    [LoadColumn(2)] public float TermMonths { get; set; }    // Thời hạn
    [LoadColumn(3)] public string Label { get; set; }        // Nhãn (Gói vay) - Dùng để train
}

// 2. Định nghĩa kết quả dự đoán (Output)
public class LoanPrediction
{
    [ColumnName("PredictedLabel")]
    public string SuggestedPackage { get; set; }
    public float[] Score { get; set; } // Độ tin cậy
}

public class LoanRecommendationService
{
    private readonly MLContext _mlContext;
    private ITransformer _model;

    public LoanRecommendationService()
    {
        _mlContext = new MLContext(seed: 0); // Seed cố định để kết quả nhất quán
        TrainModel(); // Tự động train khi khởi động Service
    }

    private void TrainModel()
    {
        // --- A. TẠO DỮ LIỆU GIẢ LẬP (DẠY AI HỌC LUẬT) ---
        // Quy tắc ngầm:
        // - Thu nhập > 50tr, Vay > 100tr -> VIP
        // - Thu nhập > 10tr, Vay < 50tr -> STANDARD
        // - Thu nhập < 10tr, Vay nhỏ -> BASIC
        var data = new List<LoanInputData>();

        // Tạo 100 mẫu dữ liệu ngẫu nhiên cho mỗi loại để Model học
        var rand = new Random();
        for (int i = 0; i < 50; i++)
        {
            // Mẫu Gói VIP (Thu nhập cao, Vay nhiều)
            data.Add(new LoanInputData { Amount = rand.Next(100000000, 500000000), MonthlyIncome = rand.Next(50000000, 100000000), TermMonths = 24, Label = "VIP" });
            
            // Mẫu Gói Tiêu chuẩn (Thu nhập trung bình)
            data.Add(new LoanInputData { Amount = rand.Next(20000000, 80000000), MonthlyIncome = rand.Next(15000000, 40000000), TermMonths = 12, Label = "STANDARD" });

            // Mẫu Gói Cơ bản (Sinh viên/Thu nhập thấp)
            data.Add(new LoanInputData { Amount = rand.Next(1000000, 15000000), MonthlyIncome = rand.Next(3000000, 10000000), TermMonths = 6, Label = "BASIC" });
        }

        var trainingDataView = _mlContext.Data.LoadFromEnumerable(data);

        // --- B. XÂY DỰNG PIPELINE XỬ LÝ ---
        var pipeline = _mlContext.Transforms.Conversion.MapValueToKey("Label") // Chuyển nhãn text sang số
            .Append(_mlContext.Transforms.Concatenate("Features", "Amount", "MonthlyIncome", "TermMonths")) // Gom input thành vector
            .Append(_mlContext.Transforms.NormalizeMinMax("Features")) // Chuẩn hóa dữ liệu về 0-1
            .Append(_mlContext.MulticlassClassification.Trainers.SdcaMaximumEntropy()) // Thuật toán ML
            .Append(_mlContext.Transforms.Conversion.MapKeyToValue("PredictedLabel")); // Chuyển kết quả số về text lại

        // --- C. TRAIN MODEL ---
        _model = pipeline.Fit(trainingDataView);
    }

    public string Predict(float amount, float income, float term)
    {
        var predictionEngine = _mlContext.Model.CreatePredictionEngine<LoanInputData, LoanPrediction>(_model);
        
        var input = new LoanInputData
        {
            Amount = amount,
            MonthlyIncome = income,
            TermMonths = term
        };

        var result = predictionEngine.Predict(input);
        return result.SuggestedPackage;
    }
}