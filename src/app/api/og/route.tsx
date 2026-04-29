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
          background: "linear-gradient(135deg, #FFFFFF 0%, #EFF6FF 100%)",
          color: TEXT_DARK,
          padding: "72px 64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
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
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            AI
          </div>
          AIJobFit
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 64,
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.15,
              color: TEXT_DARK,
              maxWidth: 1000,
            }}
          >
            9.9 RMB · AI Job Positioning Diagnosis
          </div>
          <div
            style={{
              fontSize: 30,
              color: TEXT_MUTED,
              lineHeight: 1.5,
              maxWidth: 1000,
            }}
          >
            5000+ real JDs · 14 role clusters · 7-section report · Honest free resources
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            justifyContent: "space-between",
            fontSize: 22,
            color: TEXT_MUTED,
          }}
        >
          <span>aijobfit.llmxfactor.cloud</span>
          <span>Powered by Agent Hunt</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
