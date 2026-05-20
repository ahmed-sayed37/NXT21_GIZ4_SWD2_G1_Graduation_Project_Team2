export default function InputLabel({ content, id, type, register, info, placeholder }) {
  return (
    <div className="mb-3">
      <label htmlFor={id}>{content}</label>
      <input
        {...register(info)}
        id={id}
        type={type}
        className="block w-full border-2 p-1.5 rounded-lg text-black"
        placeholder={placeholder || content}
      />
    </div>
  );
}
