import { ImageResponse } from "@vercel/og";

export const runtime = "nodejs";
export const revalidate = false;

const BRAND = "#2563EB";
const TEXT_DARK = "#0F172A";
const TEXT_MUTED = "#64748B";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(160deg, #FFFFFF 0%, #EFF6FF 100%)",
          color: TEXT_DARK,
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 26,
            color: BRAND,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: BRAND,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            AI
          </div>
          <span>AIJobFit</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.1 }}>
            AI Career
          </div>
          <div
            style={{
              fontSize: 66,
              fontWeight: 700,
              lineHeight: 1.1,
              color: BRAND,
            }}
          >
            Diagnosis
          </div>
          <div
            style={{
              fontSize: 22,
              color: TEXT_MUTED,
              marginTop: 24,
              maxWidth: 560,
              lineHeight: 1.5,
            }}
          >
            Non-engineer AI career positioning based on 2370+ real JDs.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 18,
            color: TEXT_MUTED,
          }}
        >
          <span>aijobfit.llmxfactor.cloud</span>
          <span>Agent Hunt · 14 roles · 4 tracks</span>
        </div>
      </div>
    ),
    { width: 800, height: 800 },
  );
}
