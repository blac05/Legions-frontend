import React, { useEffect, useRef, useState } from "react";
import { Fingerprint } from "lucide-react";
import { C, GRAD_SOFT } from "../theme.js";
import { Facet, GhostBtn, GradBtn } from "./YourComponents"; // Update import path if needed

export function TwoFactorModal({
  open,
  action,
  error,
  onClose,
  onConfirm,
}) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const refs = useRef([]);

  useEffect(() => {
    if (open) {
      setCode(["", "", "", "", "", ""]);
      setTimeout(() => refs.current[0]?.focus(), 100);
    }
  }, [open]);

  if (!open) return null;

  const setDigit = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const next = [...code];
    next[index] = value;
    setCode(next);

    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (code[index]) {
        const next = [...code];
        next[index] = "";
        setCode(next);
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "");

    if (pasted.length === 6) {
      const digits = pasted.split("");
      setCode(digits);
      refs.current[5]?.focus();
      e.preventDefault();
    }
  };

  const complete = code.every((digit) => digit !== "");

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: "rgba(4,6,20,0.72)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="anim-in"
        style={{
          width: 380,
          maxWidth: "90vw",
        }}
      >
        <Facet style={{ padding: 28 }}>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: GRAD_SOFT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Fingerprint size={19} color={C.teal} />
            </div>

            <div>
              <div
                className="f-display"
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: C.text,
                }}
              >
                Confirm with 2FA
              </div>

              <div
                className="f-body"
                style={{
                  fontSize: 12.5,
                  color: C.muted,
                }}
              >
                {action}
              </div>
            </div>
          </div>

          <p
            className="f-body"
            style={{
              fontSize: 13,
              color: C.muted,
              margin: "14px 0 10px",
            }}
          >
            Enter the 6-digit code from your authenticator app to continue.
          </p>

          {error && (
            <p
              className="f-body"
              style={{
                fontSize: 12.5,
                color: C.danger,
                marginBottom: 10,
              }}
            >
              {error}
            </p>
          )}

          <div
            className="flex gap-2 mb-5 justify-center"
            onPaste={handlePaste}
          >
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  refs.current[index] = el;
                }}
                value={digit}
                onChange={(e) => setDigit(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                maxLength={1}
                className="f-mono"
                style={{
                  width: 42,
                  height: 50,
                  textAlign: "center",
                  fontSize: 20,
                  fontWeight: 600,
                  background: C.bg2,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  color: C.text,
                  outline: "none",
                }}
              />
            ))}
          </div>

          <div className="flex gap-2.5">
            <GhostBtn onClick={onClose}>
              Cancel
            </GhostBtn>

            <div style={{ flex: 1 }}>
              <GradBtn
                full
                disabled={!complete}
                onClick={() => onConfirm(code.join(""))}
              >
                Verify & Confirm
              </GradBtn>
            </div>
          </div>
        </Facet>
      </div>
    </div>
  );
}