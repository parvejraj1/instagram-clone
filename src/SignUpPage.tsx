import { SignUp } from "@clerk/clerk-react";

export function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          redirectUrl="/"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white shadow-lg rounded-lg p-8",
              headerTitle: "text-2xl font-bold text-center mb-4",
              headerSubtitle: "text-gray-600 text-center mb-6",
              formButtonPrimary: "w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600",
            },
          }}
        />
      </div>
    </div>
  );
}
