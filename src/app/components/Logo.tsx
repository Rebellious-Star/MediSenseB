import logoImage from "@/assets/logo.png";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
};

const sizeClasses = {
  sm: "size-10",
  md: "size-14",
  lg: "size-20",
};

export function Logo({ size = "md", showText = false, className = "" }: LogoProps) {
  const iconSize = sizeClasses[size];
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-300 to-teal-300 rounded-full blur-md opacity-50" />
        <img
          src={logoImage}
          alt="MediSense"
          className={`relative ${iconSize} object-contain shadow-lg`}
        />
      </div>
      {showText && (
        <span className="font-bold text-slate-800" style={{ fontSize: size === "lg" ? "1.5rem" : size === "md" ? "1.25rem" : "1rem" }}>
          MediSense
        </span>
      )}
    </div>
  );
}
