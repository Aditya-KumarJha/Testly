import { NextResponse } from "next/server";

type ApiSuccess<T> = {
  data: T;
};

type ApiError = {
  error: string;
};

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ data }, init);
}

export function apiError(message: string, status = 500) {
  return NextResponse.json<ApiError>({ error: message }, { status });
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "An unexpected error occurred";
}

export async function parseJsonBody<T>(
  request: Request,
): Promise<{ data: T | null; errorResponse?: NextResponse<ApiError> }> {
  try {
    const data = (await request.json()) as T;
    return { data };
  } catch {
    return {
      data: null,
      errorResponse: apiError("Invalid JSON request body", 400),
    };
  }
}

export function toInteger(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsedValue = Number(value);
    if (Number.isInteger(parsedValue)) {
      return parsedValue;
    }
  }

  return null;
}

export function toTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function toOptionalTrimmedString(value: unknown) {
  const trimmedValue = toTrimmedString(value);
  return trimmedValue || null;
}
