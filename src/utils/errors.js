export class NotFoundError extends Error {
  constructor(message) {
    super(message); // Pass message to the parent Error class
    this.name = "NotFoundError"; // Set a custom error name
    this.status = 404;
  }
}

export class NotAuthError extends Error {
  constructor(message) {
    super(message); // Pass message to the parent Error class
    this.name = "NotAuthError"; // Set a custom error name
    this.status = 401;
  }
}
