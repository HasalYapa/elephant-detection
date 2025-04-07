"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubmitted(true);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 24 24" fill="none" className="text-primary">
              <path
                d="M17 14C18.6569 14 20 12.6569 20 11C20 9.34315 18.6569 8 17 8C15.3431 8 14 9.34315 14 11C14 12.6569 15.3431 14 17 14Z"
                fill="currentColor"
              />
              <path
                d="M4 14.0001C5.65685 14.0001 7 12.6569 7 11.0001C7 9.34324 5.65685 8.00009 4 8.00009C2.34315 8.00009 1 9.34324 1 11.0001C1 12.6569 2.34315 14.0001 4 14.0001Z"
                fill="currentColor"
              />
              <path
                d="M10.5 22.0001C12.1569 22.0001 13.5 20.6569 13.5 19.0001C13.5 17.3432 12.1569 16.0001 10.5 16.0001C8.84315 16.0001 7.5 17.3432 7.5 19.0001C7.5 20.6569 8.84315 22.0001 10.5 22.0001Z"
                fill="currentColor"
              />
              <path
                d="M18.5 19.0001C20.1569 19.0001 21.5 17.6569 21.5 16.0001C21.5 14.3432 20.1569 13.0001 18.5 13.0001C16.8431 13.0001 15.5 14.3432 15.5 16.0001C15.5 17.6569 16.8431 19.0001 18.5 19.0001Z"
                fill="currentColor"
              />
              <path
                d="M7.5 6.00009C9.15685 6.00009 10.5 4.65694 10.5 3.00009C10.5 1.34324 9.15685 9.15527e-05 7.5 9.15527e-05C5.84315 9.15527e-05 4.5 1.34324 4.5 3.00009C4.5 4.65694 5.84315 6.00009 7.5 6.00009Z"
                fill="currentColor"
              />
              <path
                d="M13.5 11.0001C15.1569 11.0001 16.5 9.65694 16.5 8.00009C16.5 6.34324 15.1569 5.00009 13.5 5.00009C11.8431 5.00009 10.5 6.34324 10.5 8.00009C10.5 9.65694 11.8431 11.0001 13.5 11.0001Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isSubmitted ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-foreground">
                Check your email
              </h3>
              <div className="mt-2 text-sm text-muted-foreground">
                <p>
                  We've sent a password reset link to {email}. It may take a few
                  minutes to arrive.
                </p>
              </div>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div
                  className="mb-4 bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded relative"
                  role="alert"
                >
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground"
                  >
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-md border border-input bg-background px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
                  >
                    {isLoading ? "Sending..." : "Send reset link"}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-input" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link
                    href="/login"
                    className="font-medium text-primary hover:text-primary/90"
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
