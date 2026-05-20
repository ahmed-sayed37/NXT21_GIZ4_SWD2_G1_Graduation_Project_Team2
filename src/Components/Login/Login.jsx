import { useContext, useState } from "react";
import InputLabel from "../InputLabel";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
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

  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { handleSubmit, register, formState } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  function handleLogin(data) {
    return axios
      .post("https://linked-posts.routemisr.com/users/signin", data)
      .then((res) => {
        toast.success("Successfully logged in");
        insertUserToken(res.data.token);
        setSuccessMsg(true);
        setTimeout(() => navigate("/home"), 2000);
      })
      .catch((err) => {
        const msg = err.response?.data?.error || "Login failed";
        toast.error(msg);
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(null), 2000);
      });
  }

  return (
    <>
      <Toaster />
      <div className="md:p-19 min-h-screen dark:text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="flex justify-center">
          <div className="md:w-1/2 shadow-2xl bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 md:rounded-3xl p-4">
            <h1 className="text-4xl md:text-6xl text-center font-bold animate-pulse duration-700">
              Login Page
            </h1>

            <form
              onSubmit={handleSubmit(handleLogin)}
              className="px-20 py-5 text-gray-200"
            >
              <InputLabel
                register={register}
                info="email"
                content="Email"
                id="email"
                type="email"
                placeholder="Your Email"
              />
              {formState.errors.email && formState.touchedFields.email && (
                <p className="text-red-700">{formState.errors.email.message}</p>
              )}

              <InputLabel
                register={register}
                info="password"
                content="Password"
                id="password"
                type="password"
                placeholder="Your Password"
              />
              {formState.errors.password && formState.touchedFields.password && (
                <p className="text-red-700">{formState.errors.password.message}</p>
              )}

              <button
                type="submit"
                disabled={formState.isSubmitting}
                className="border-0 py-2 w-full rounded-2xl cursor-pointer bg-violet-500 text-white text-2xl hover:bg-violet-800 duration-500 disabled:opacity-60"
              >
                {formState.isSubmitting ? <ClipLoader size={24} color="#fff" /> : "Login"}
              </button>

              {successMsg && (
                <p className="py-1.5 w-full text-center bg-green-500 rounded-2xl my-3">
                  Successfully
                </p>
              )}
              {errorMsg && (
                <p className="py-1.5 w-full text-center bg-red-500 rounded-2xl my-3">
                  {errorMsg}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
