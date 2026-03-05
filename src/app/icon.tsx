import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #3b4bb1 0%, #f25a37 100%)",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            border: "1px solid rgba(255,255,255,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 0.5,
              fontFamily:
                "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
            }}
          >
            DS
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
