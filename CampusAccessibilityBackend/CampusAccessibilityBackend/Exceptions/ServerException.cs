namespace CampusAccessibilityBackend.Exceptions
{
    public class ServerException : AppException
    {
        private static readonly string DEFAULT_CODE = "ServerError";

        public ServerException(string code, string message)
            : base(code + DEFAULT_CODE, message)
        {
        }
    }
}
