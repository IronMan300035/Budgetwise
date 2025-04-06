
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface PasswordRequirementProps {
  isMet: boolean;
  label: string;
}

const PasswordRequirement = ({ isMet, label }: PasswordRequirementProps) => {
  return (
    <div className="flex items-center space-x-2">
      {isMet ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
      <span className={`text-sm ${isMet ? "text-green-500" : "text-red-500"}`}>
        {label}
      </span>
    </div>
  );
};

interface PasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements = ({ password }: PasswordRequirementsProps) => {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const requirements = [
    { isMet: hasMinLength, label: "At least 8 characters" },
    { isMet: hasUppercase, label: "At least one uppercase letter" },
    { isMet: hasLowercase, label: "At least one lowercase letter" },
    { isMet: hasNumber, label: "At least one number" },
    { isMet: hasSpecialChar, label: "At least one special character" },
  ];

  const strength = 
    (hasMinLength ? 1 : 0) + 
    (hasUppercase ? 1 : 0) + 
    (hasLowercase ? 1 : 0) + 
    (hasNumber ? 1 : 0) + 
    (hasSpecialChar ? 1 : 0);
  
  const getStrengthLabel = () => {
    if (strength === 0) return { label: "Very Weak", color: "bg-red-500" };
    if (strength <= 2) return { label: "Weak", color: "bg-orange-500" };
    if (strength <= 4) return { label: "Medium", color: "bg-yellow-500" };
    return { label: "Strong", color: "bg-green-500" };
  };

  const strengthInfo = getStrengthLabel();

  return (
    <div className="mt-2 space-y-2">
      <div className="space-y-1">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${strengthInfo.color} transition-all duration-300`} 
            style={{ width: `${(strength / 5) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-right">{strengthInfo.label}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {requirements.map((req, index) => (
          <PasswordRequirement key={index} isMet={req.isMet} label={req.label} />
        ))}
      </div>
    </div>
  );
};
