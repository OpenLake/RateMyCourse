// components/auth/SignUp.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/services/auth-service';
import { useForm } from 'react-hook-form';

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpFormData>();
  
  const password = watch('password');

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      await registerUser(data.email, data.password);
      setVerificationSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Verification Email Sent</h1>
        <p className="mb-4">
          Please check your email to verify your account. Once verified, you can sign in.
        </p>
        <button
          onClick={() => router.push('/signin')}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="email">
            IIT Bhilai Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full p-2 border rounded"
            placeholder="youremail@iitbhilai.ac.in"
            {...register("email", { 
              required: "Email is required",
              pattern: {
                value: /@iitbhilai.ac.in$/,
                message: "Must be an IIT Bhilai email"
              }
            })}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full p-2 border rounded"
            {...register("password", { 
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters"
              }
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="w-full p-2 border rounded"
            {...register("confirmPassword", { 
              required: "Please confirm your password",
              validate: value => value === password || "Passwords do not match"
            })}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p>Already have an account? <a href="/signin" className="text-blue-500 hover:underline">Sign in</a></p>
      </div>
    </div>
  );
}