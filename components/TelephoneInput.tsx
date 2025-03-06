import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { cn } from "@/lib/utils";

interface TelephoneInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const TelephoneInput: React.FC<TelephoneInputProps> = ({
  id,
  value,
  onChange,
  required = false,
  disabled = false,
  className,
}) => {
  const handlePhoneChange = (phone: string) => {
    if (!phone.startsWith("+")) {
      phone = "+" + phone;
    }
    onChange(phone);
  };

  return (
    <PhoneInput
      country={"tn"}
      value={value}
      onChange={handlePhoneChange}
      inputProps={{
        id,
        name: "telephone",
        required,
        disabled,
        className: cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-12",
          className
        ),
      }}
      containerClass="relative"
      buttonClass="border-r bg-background"
      dropdownClass="max-h-60 overflow-auto"
      enableSearch={true}
      disableDropdown={false}
      countryCodeEditable={false}
      disabled={disabled}
    />
  );
};

export default TelephoneInput;
