import { useContext, useState } from "react";
import InputLabel from "../InputLabel";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { Link, useNavigate } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { signin } from "../../api/mockApi";
import { AuthContext } from "../../context/AuthContextStore";

const schema = zod.object({
  email: zod.string().email("Please enter a valid email"),
  password: zod
    .string()
    .regex(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Password must contain uppercase, lowercase, number and special character (min 8 chars)"
    ),
});

export default function Login() {
  useDocumentTitle("Login");

  const navigate = useNavigate();
  const { insertUserToken } = useContext(AuthContext);

  const [errorMsg, setErrorMsg] = useState(null);

  const { handleSubmit, register, formState } = useForm({
    defaultValues: { email: "", password: "" },
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  function handleLogin(data) {
    return signin(data)
      .then((res) => {
        toast.success("Successfully logged in");
        insertUserToken(res.data.token);
        navigate("/home");
      })
      .catch((err) => {
        const msg = err.response?.data?.error || err.message || "Login failed";
        toast.error(msg);
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(null), 4000);
      });
  }

  return (
    <div className="flex justify-center">
      <div className="w-full md:w-1/2 shadow-2xl bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 md:rounded-3xl p-4">
        <h1 className="text-4xl md:text-6xl text-center font-bold text-white">Login</h1>

        <form
          onSubmit={handleSubmit(handleLogin)}
          className="px-6 md:px-20 py-5 text-gray-200"
        >
          <InputLabel
            register={register}
            info="email"
            content="Email"
            id="email"
            type="email"
            placeholder="you@example.com"
          />
          {formState.errors.email && (
            <p className="text-red-300 text-sm">{formState.errors.email.message}</p>
          )}

          <InputLabel
            register={register}
            info="password"
            content="Password"
            id="password"
            type="password"
            placeholder="Your Password"
          />
          {formState.errors.password && (
            <p className="text-red-300 text-sm">{formState.errors.password.message}</p>
          )}

          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="border-0 py-2 w-full rounded-2xl cursor-pointer bg-violet-500 text-white text-xl mt-4 hover:bg-violet-700 transition disabled:opacity-60"
          >
            {formState.isSubmitting ? <ClipLoader size={22} color="#fff" /> : "Login"}
          </button>

          {errorMsg && (
            <p className="py-1.5 w-full text-center bg-red-500/80 rounded-2xl my-3">
              {errorMsg}
            </p>
          )}

          <p className="text-center mt-4 text-sm">
            No account?{" "}
            <Link to="/register" className="text-violet-200 hover:underline">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
