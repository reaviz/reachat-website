import React, { FC } from "react";
import SparklesIcon from "@/icons/Sparkles";
import { cn } from "@/utils/cn";

export type SignatureDividerProps = {
  className?: string;
};

export const SignatureDivider: FC<SignatureDividerProps> = ({ className }) => (
  <div className={cn("m-auto flex w-full items-center gap-1", className)}>
    <div className="h-px flex-1" style={{ backgroundImage: "linear-gradient(to right, transparent, #87aeff)" }}/>
    <SparklesIcon className="h-3 w-3 shrink-0" />
    <SparklesIcon className="h-4 w-4 shrink-0" />
    <SparklesIcon className="h-3 w-3 shrink-0" />
    <div className="h-px flex-1 bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(to right, #87aeff, transparent)" }} />
  </div>
);
