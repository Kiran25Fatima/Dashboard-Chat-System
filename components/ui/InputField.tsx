import type { ChangeEvent, CSSProperties, InputHTMLAttributes, ReactNode } from "react";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
  required?: boolean;
  className?: string;
  wrapperStyle?: CSSProperties;
  inputStyle?: CSSProperties;
  inputClassName?: string;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

export default function InputField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  icon,
  suffix,
  required = false,
  className = "",
  wrapperStyle,
  inputStyle,
  inputClassName = "",
  inputProps,
}: InputFieldProps) {
  const hasIcon = !!icon;
  const hasSuffix = !!suffix;

  return (
    <div className={className} style={wrapperStyle}>
      <label
        className="text-[10px] font-bold uppercase tracking-[0.14em] ml-1"
        style={{ color: "#b8acd6" }}
      >
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </label>
      <div className="relative group flex items-center">
        {hasIcon ? (
          <div className="absolute left-3.5 flex items-center justify-center pointer-events-none text-slate-400">
            {icon}
          </div>
        ) : null}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm ${inputClassName}`}
          style={{
            paddingLeft: hasIcon ? 44 : 16,
            paddingRight: hasSuffix ? 48 : 16,
            ...inputStyle,
          }}
          {...inputProps}
        />

        {hasSuffix ? (
          <div className="absolute right-3.5 flex items-center justify-center">{suffix}</div>
        ) : null}
      </div>
    </div>
  );
}
