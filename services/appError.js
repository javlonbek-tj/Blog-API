class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  static UnauthenticatedError() {
    return new ApiError(401, 'User not authenticated');
  }
  static UnauthorizedError() {
    return new ApiError(403, 'You are not allowed to do this action');
  }

  static BadRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }
}

export default ApiError;
