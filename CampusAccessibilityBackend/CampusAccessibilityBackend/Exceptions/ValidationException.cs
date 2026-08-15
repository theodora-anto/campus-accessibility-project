namespace CampusAccessibilityBackend.Exceptions
{
    public class ValidationException : AppException
    {
        private static readonly string DEFAULT_CODE = "ValidationError";

        public ValidationException(string code, string message)
            : base(code + DEFAULT_CODE, message)
        {
        }
    }
}
