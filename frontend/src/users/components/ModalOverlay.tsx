import { type ReactNode } from "react";

interface ModalOverlayProps {
  children: ReactNode;
  onClose?: () => void;
  maxWidth?: number;
}

export default function ModalOverlay({ children, onClose, maxWidth = 420 }: ModalOverlayProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "0 20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "28px 28px 24px",
          width: "100%",
          maxWidth,
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
