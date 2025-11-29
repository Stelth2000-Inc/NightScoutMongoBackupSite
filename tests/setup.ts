import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Set default environment variables for tests
// These can be overridden in individual tests
if (!process.env.BACKUP_S3_BUCKET) {
  process.env.BACKUP_S3_BUCKET = "test-bucket";
}
if (!process.env.BACKUP_S3_PREFIX) {
  process.env.BACKUP_S3_PREFIX = "backups/";
}
if (!process.env.AWS_REGION) {
  process.env.AWS_REGION = "us-east-1";
}
if (!process.env.PYTHON_BACKUP_API_URL) {
  process.env.PYTHON_BACKUP_API_URL = "http://localhost:8000";
}

// Cleanup after each test
afterEach(() => {
  cleanup();
});

