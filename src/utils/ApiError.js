// Custom error class that extends the built-in JavaScript Error class to handle API errors
class ApiError extends Error {
    // Constructor method to initialize the custom error object
    constructor(
      statuscode,        // HTTP status code (e.g., 404, 500)
      message = "Something went wrong",  // Default error message, if none is provided
      errors = [],       // Array to hold multiple error details (e.g., validation errors)
      statck = ""        // Optional custom stack trace (empty by default)
    ) {
      // Call the parent class (Error) constructor, passing the message to it
      super(message);
  
      // Assign the status code to the error instance (e.g., 404, 500)
      this.statuscode = statuscode;
  
      // Data property set to null (can be used to add error-related data later)
      this.data = null;
  
      // Reassign the message to this.message (already passed to the parent class)
      this.message = message;
  
      // Set success to false (indicating the operation failed)
      this.success = false;
  
      // Assign the errors array to hold any additional error details
      this.errors = errors;
  
      // If a custom stack trace is provided, set it
      if (statck) {
        this.stack = statck;
      } else {
        // If no custom stack trace, capture the current stack trace
        // 'this.constructor' ensures the stack trace starts from this class, excluding unnecessary details
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  // Export the ApiError class to be used in other files
  export { ApiError };
  