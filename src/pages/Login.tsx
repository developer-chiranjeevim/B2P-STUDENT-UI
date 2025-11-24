import React, { useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [onLoad, setOnload] = useState<boolean>(false);


  const navigate = useNavigate();

  const storeTokenOneHour = (key: string, token: string) => {
    const now = Date.now();

    const item = {
      token: token,
      expiry: now + 3600 * 1000, // 1 hour in milliseconds
    };

    sessionStorage.setItem(key, JSON.stringify(item));
    navigate("/dashboard");
  };


  const getAccessToken = async() => {
    setOnload(true);
    console.log(import.meta.env.VITE_ADMIN_API);
    try{

      const response = await axios.post(`${import.meta.env.VITE_AUTH_API}/login-student-user`, {
        email: email,
        password: password,
      });

      const token = await response.data.token;
      storeTokenOneHour("B2P-STUDENT-ACCESS-TOKEN", token);

    }catch(error){
      if(axios.isAxiosError(error)){
        alert(`NETWORK ERROR: ${error.message}`);
      }else{
        alert(`UNKNOWN ERROR: ${error} `);
      };
    };

    setOnload(false);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign in attempt:", { email, password });
    getAccessToken();
    
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col background-image background-image">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center rounded-t-lg border-[1px] border-white py-[1rem]">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 text-white">
              B2P TEACHERS
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
              Sign in to your account
            </p>
          </div>

          {/* Sign In Form */}
          <div className="bg-white rounded-b-lg shadow-md p-6 sm:p-8">
            <div className="space-y-6">
              {/* Email Input */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="tonystark@gmail.com"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleSubmit}
                className="cursor-pointer w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition"
              >
                {
                    onLoad?
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 mx-auto animate-spin">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        :
                        "Sign In"

                }
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;