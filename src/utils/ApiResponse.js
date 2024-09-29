class apiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.statusCode = data;
    this.message = message;
    this.success = statusCode<40
  }
}
