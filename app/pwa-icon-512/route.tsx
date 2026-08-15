import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e0a16",
        }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: 160,
            background: "radial-gradient(circle at 35% 30%, #ffd66b, #ff7a2d 72%)",
            boxShadow: "0 0 100px #ff7a2d",
          }}
        />
      </div>
    ),
    { width: 512, height: 512 }
  );
}
