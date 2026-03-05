import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 44,
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 40,
            border: "4px solid rgba(255,255,255,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: 1,
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
