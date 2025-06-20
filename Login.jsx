import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { setShowUserLogin, setUser, axios } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [state, setState] = useState("login"); // "login" or "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState(""); // State for name validation

  // Regex for name validation (only letters allowed)
  const nameRegex = /^[A-Za-z]+$/;

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Validate name field if it's a registration
    if (state === "register" && !nameRegex.test(name)) {
      setNameError("Name must only contain letters.");
      return;
    }

    try {
      const { data } = await axios.post(`/api/user/${state}`, {
        name,
        email,
        password,
      });

      if (data.success) {
        toast.success(`${state === "register" ? "Account created" : "Login successful"}!`);

        // Save to context
        setUser(data.user);

        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(data.user));

        // Close login popup
        setShowUserLogin(false);

        // Redirect to previous or home page
        const redirectPath = location.state?.from || "/";
        navigate(redirectPath);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  const handleNameChange = (e) => {
    const inputName = e.target.value;
    // Only allow letters in the name field
    if (/^[A-Za-z]*$/.test(inputName)) {
      setName(inputName);
      setNameError(""); // Clear error if the name is valid
    } else {
      setNameError("Name must only contain letters.");
    }
  };

  return (
    <div onClick={() => setShowUserLogin(false)} className="fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center justify-center text-sm text-gray-600 bg-black/50">
      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white"
      >
        <p className="text-2xl font-medium m-auto">
          <span className="text-primary">User</span> {state === "login" ? "Login" : "Sign Up"}
        </p>

        {state === "register" && (
          <div className="w-full">
            <p>Name</p>
            <input
              onChange={handleNameChange} // Update name using handleNameChange
              value={name}
              placeholder="type here"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
              type="text"
              required
            />
            {nameError && <p className="text-red-500 text-sm">{nameError}</p>} {/* Show error message */}
          </div>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            type="email"
            required
          />
        </div>

        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
            type="password"
            required
          />
        </div>

        <p className="w-full text-center">
          {state === "register" ? (
            <>
              Already have an account?{" "}
              <span onClick={() => setState("login")} className="text-primary cursor-pointer">
                Click here
              </span>
            </>
          ) : (
            <>
              Create an account?{" "}
              <span onClick={() => setState("register")} className="text-primary cursor-pointer">
                Click here
              </span>
            </>
          )}
        </p>

        <button className="bg-primary hover:bg-primary-dull transition-all text-white w-full py-2 rounded-md cursor-pointer">
          {state === "register" ? "Create Account" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
