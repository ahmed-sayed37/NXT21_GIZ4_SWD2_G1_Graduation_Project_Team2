import { useState } from "react";
import InputLabel from "../InputLabel";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
import useDocumentTitle from "../../hooks/useDocumentTitle";

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

  const [successMsg, setSuccessMsg] = useState(false);
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
    return axios
      .post("https://linked-posts.routemisr.com/users/signup", data)
      .then(() => {
        toast.success("Account created successfully");
        setSuccessMsg(true);
        setTimeout(() => navigate("/login"), 2000);
      })
      .catch((err) => {
        const res = err.response?.data;
        const msg =
          res?.error ||
          res?.message ||
          res?.errors?.[0]?.msg ||
          err.message ||
          "Registration failed";
        toast.error(msg);
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(null), 4000);
      });
  }

  return (
    <>
      <Toaster />

      <div className="flex justify-center">
        <div className="md:w-1/2 shadow-2xl bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 md:rounded-3xl p-4">
          <h1 className="text-4xl md:text-6xl text-center font-bold animate-pulse duration-700">
            Register Page
          </h1>

          <form
            onSubmit={handleSubmit(handleRegister)}
            className="px-20 py-5 text-gray-200"
          >
            <InputLabel
              register={register}
              info="name"
              content="User Name"
              id="userName"
              type="text"
              placeholder="Your Name"
            />
            {formState.errors.name && formState.touchedFields.name && (
              <p className="text-red-700">{formState.errors.name.message}</p>
            )}

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

            <InputLabel
              register={register}
              info="rePassword"
              content="Confirm Password"
              id="rePassword"
              type="password"
              placeholder="Confirm Your Password"
            />
            {formState.errors.rePassword && formState.touchedFields.rePassword && (
              <p className="text-red-700">{formState.errors.rePassword.message}</p>
            )}

            <InputLabel
              register={register}
              info="dateOfBirth"
              content="Date of Birth"
              id="dateOfBirth"
              type="date"
              placeholder="Your Date of Birth"
            />
            {formState.errors.dateOfBirth && formState.touchedFields.dateOfBirth && (
              <p className="text-red-700">{formState.errors.dateOfBirth.message}</p>
            )}

            <div className="mb-3 flex items-end">
              <label htmlFor="male">Male</label>
              <input
                {...register("gender")}
                value="male"
                id="male"
                type="radio"
                className="ms-2"
              />
            </div>

            <div className="mb-3 flex items-end">
              <label htmlFor="female">Female</label>
              <input
                {...register("gender")}
                value="female"
                id="female"
                type="radio"
                className="ms-2"
              />
            </div>
            {formState.errors.gender && (
              <p className="text-red-700">{formState.errors.gender.message}</p>
            )}

            <button
              type="submit"
              disabled={formState.isSubmitting}
              className="border-0 py-2 w-full rounded-2xl cursor-pointer bg-violet-500 text-white text-2xl hover:bg-violet-800 duration-500 disabled:opacity-60"
            >
              {formState.isSubmitting ? <ClipLoader size={24} color="#fff" /> : "Sign up"}
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
    </>
  );
}
