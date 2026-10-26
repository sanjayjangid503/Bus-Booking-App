"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/Field";

export function PasswordInput(props: Omit<ComponentProps<typeof Input>, "type" | "icon">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} icon={<Lock className="size-4" />} className="pr-12" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className={`absolute right-2 flex size-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg ${
          props.label ? "top-[30px]" : "top-1.5"
        }`}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
