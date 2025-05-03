// components/auth/SignIn.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInUser } from '@/services/auth-service';
import { useForm } from 'react-hook-form';

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignIn() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>();

  const onSubmit = async (data: SignInFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      await signInUser(data.email, data.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      
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
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full p-2 border rounded"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p>Don't have an account? <a href="/signup" className="text-blue-500 hover:underline">Sign up</a></p>
      </div>
    </div>
  );
}