import { useState } from "react";
import InputLabel from "../InputLabel";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { Link, useNavigate } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { signup } from "../../api/mockApi";

const schema = zod
  .object({
    name: zod
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(15, "Name must be at most 15 characters"),
    email: zod.string().email("Please enter a valid email"),
    password: zod
      .string()
      .regex(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
        "Password must contain uppercase, lowercase, number and special character (min 8 chars)"
      ),
    rePassword: zod.string(),
    dateOfBirth: zod
      .string()
      .min(1, "Please enter your date of birth")
      .refine((d) => !Number.isNaN(Date.parse(d)), "Please enter a valid date"),
    gender: zod.enum(["male", "female"], { message: "Please select a gender" }),
  })
  .refine((val) => val.password === val.rePassword, {
    message: "Passwords do not match",
    path: ["rePassword"],
  });

export default function Register() {
  useDocumentTitle("Register");

  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState(null);

  const { handleSubmit, register, formState } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rePassword: "",
      dateOfBirth: "",
      gender: "",
    },
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  function handleRegister(data) {
    return signup(data)
      .then(() => {
        toast.success("Account created successfully");
        navigate("/login");
      })
      .catch((err) => {
        const msg = err.response?.data?.error || err.message || "Registration failed";
        toast.error(msg);
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(null), 4000);
      });
  }

  return (
    <div className="flex justify-center">
      <div className="w-full md:w-1/2 shadow-2xl bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 md:rounded-3xl p-4">
        <h1 className="text-4xl md:text-6xl text-center font-bold text-white">
          Register
        </h1>

        <form
          onSubmit={handleSubmit(handleRegister)}
          className="px-6 md:px-20 py-5 text-gray-200"
        >
          <InputLabel
            register={register}
            info="name"
            content="User Name"
            id="userName"
            type="text"
            placeholder="Your Name"
          />
          {formState.errors.name && (
            <p className="text-red-300 text-sm">{formState.errors.name.message}</p>
          )}

          <InputLabel
            register={register}
            info="email"
            content="Email"
            id="email"
            type="email"
            placeholder="Your Email"
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

          <InputLabel
            register={register}
            info="rePassword"
            content="Confirm Password"
            id="rePassword"
            type="password"
            placeholder="Confirm Your Password"
          />
          {formState.errors.rePassword && (
            <p className="text-red-300 text-sm">{formState.errors.rePassword.message}</p>
          )}

          <InputLabel
            register={register}
            info="dateOfBirth"
            content="Date of Birth"
            id="dateOfBirth"
            type="date"
            placeholder="Your Date of Birth"
          />
          {formState.errors.dateOfBirth && (
            <p className="text-red-300 text-sm">
              {formState.errors.dateOfBirth.message}
            </p>
          )}

          <div className="flex items-center gap-6 mb-3 mt-2">
            <label className="inline-flex items-center gap-2">
              <input {...register("gender")} value="male" type="radio" />
              <span>Male</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input {...register("gender")} value="female" type="radio" />
              <span>Female</span>
            </label>
          </div>
          {formState.errors.gender && (
            <p className="text-red-300 text-sm">{formState.errors.gender.message}</p>
          )}

          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="border-0 py-2 w-full rounded-2xl cursor-pointer bg-violet-500 text-white text-xl mt-2 hover:bg-violet-700 transition disabled:opacity-60"
          >
            {formState.isSubmitting ? <ClipLoader size={22} color="#fff" /> : "Sign up"}
          </button>

          {errorMsg && (
            <p className="py-1.5 w-full text-center bg-red-500/80 rounded-2xl my-3">
              {errorMsg}
            </p>
          )}

          <p className="text-center mt-4 text-sm">
            Have an account?{" "}
            <Link to="/login" className="text-violet-200 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
