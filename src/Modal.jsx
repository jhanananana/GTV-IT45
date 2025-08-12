import React from "react";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

const iconMap = {
  success: <CheckCircle className="text-green-500 w-5 h-5 mr-2" />,
  warning: <AlertTriangle className="text-yellow-500 w-5 h-5 mr-2" />,
  error: <XCircle className="text-red-500 w-5 h-5 mr-2" />,
  info: <Info className="text-blue-500 w-5 h-5 mr-2" />,
};

const Modal = ({ isOpen, onClose, title, children, footer, icon = "info" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-800">
            {iconMap[icon] || iconMap.info}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-4 text-gray-700 border-t pt-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 mt-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
