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
