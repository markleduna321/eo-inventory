import LoginFormSection from "./_sections/login-form-section";

export default function Login() {
    return (
      <>
        
        <div className="flex min-h-screen items-center justify-center py-12 px-6">
          <div className="w-full max-w-sm bg-white p-6 lg:w-1/4 rounded-md shadow-md">
            <div className="sm:mx-auto">
              <img
                alt="Company Logo"
                src="/img/logo.jpg"
                className="mx-auto h-20 w-auto mb-4"
              />

              <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                Sign in to your account
              </h2>
            </div>

            <LoginFormSection />
          </div>
        </div>


      </>
    )
  }
  