export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("An internal error ocurred.", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "contact support";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || "Service unavailable", {
      cause,
    });
    this.name = "ServiceError";
    this.action = "contact support";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
export class ValidationError extends Error {
  constructor({ cause, message, action }) {
    super(message || "Valition error ocurred", {
      cause,
    });
    this.name = "ValidationError";
    this.action = action || "validate the sent data";
    this.statusCode = 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
export class MethodNotAllowedError extends Error {
  constructor() {
    super("Method not allowed to this endpoint.");
    this.name = "MethodNotAllowedError";
    this.action = "Check if the HTTP method is allowed to this endpoint.";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
