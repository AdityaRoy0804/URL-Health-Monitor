function ErrorMessage({
    message = "Something went wrong.",
    onRetry,
}) {
    return (
        <div className="error-container">
            <div className="error-icon">
                !
            </div>

            <h2>
                Something went wrong
            </h2>

            <p>{message}</p>

            {onRetry && (
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onRetry}
                >
                    Try Again
                </button>
            )}
        </div>
    );
}

export default ErrorMessage;