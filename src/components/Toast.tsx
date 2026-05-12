"use client";

import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  message: string;
  onClose: () => void;
}

export default function Toast({ message, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-3 bg-gray-800 dark:bg-gray-700 text-white text-sm px-4 py-2.5 rounded-lg shadow-xl w-max max-w-sm">
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-white/60 hover:text-white flex-shrink-0 transition-colors"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
