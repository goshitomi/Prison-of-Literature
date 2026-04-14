import type { Metadata } from "next";
import Link from "next/link";
import { CtaLink } from "./_components/cta-link";

export const metadata: Metadata = {
  title:       "About — Prison of Literature",
  description: "Prison of Literature(책은 죄수다) 프로젝트 소개. 책과 죄수의 물리적·체계적 유사성을 탐구한다.",
};

const MUTED  = "#767676";
const BORDER = "#E8E8E8";
const ACCENT = "#C62828";

export default function AboutPage() {
  return (
    <>
      <main>
        {/* ── HERO: NLK building ── */}
        <section
          style={{
            position:       "relative",
            height:         "60vh",
            minHeight:      420,
            display:        "flex",
            flexDirection:  "column",
            justifyContent: "flex-end",
            padding:        "0 32px 48px",
            overflow:       "hidden",
          }}
        >
          <div
            style={{
              position:           "absolute",
              inset:              0,
              backgroundImage:    "url('/nlk-building.jpg')",
              backgroundSize:     "cover",
              backgroundPosition: "center 30%",
              filter:             "brightness(0.25) grayscale(20%)",
            }}
          />
          <div
            style={{
              position:   "absolute",
              inset:      0,
              background: "linear-gradient(135deg, #222 0%, #111 100%)",
              zIndex:     -1,
            }}
          />
          <div
            style={{
              position:   "absolute",
              bottom:     0, left: 0, right: 0,
              height:     "55%",
              background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
            }}
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                fontSize:      10,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color:         "rgba(255,255,255,0.4)",
                marginBottom:  14,
              }}
            >
              Location — 위치
            </div>
            <div
              style={{
                fontFamily:    "'Noto Serif KR', Georgia, serif",
                fontSize:      "clamp(16px, 2.5vw, 26px)",
                fontWeight:    700,
                color:         "#FFF",
                lineHeight:    1.4,
                marginBottom:  8,
              }}
            >
              201, Banpo-daero, Seocho-gu, Seoul,
              <br />
              Republic of Korea
            </div>
            <div
              style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.05em" }}
            >
              서울특별시 서초구 반포대로 201 — 국립중앙도서관
            </div>
          </div>
        </section>

        {/* ── 2컬럼 한/영 텍스트 ── */}
        <section
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: `1px solid ${BORDER}` }}
        >
          <div style={{ padding: "64px 48px 64px 32px", borderRight: `1px solid ${BORDER}` }}>
            <div
              style={{
                fontSize: 10, letterSpacing: "0.3em",
                textTransform: "uppercase", color: MUTED, marginBottom: 28,
              }}
            >한국어</div>
            <h2
              style={{
                fontFamily:   "'Noto Serif KR', Georgia, serif",
                fontSize:     "clamp(20px, 2.5vw, 32px)",
                fontWeight:   700,
                lineHeight:   1.3,
                color:        "#111",
                marginBottom: 24,
              }}
            >책은 죄수다</h2>
            <p style={{ fontSize: 14, lineHeight: 2.1, fontWeight: 300, color: "#444", marginBottom: 18 }}>
              &lsquo;Prison of Literature(책은 죄수다)&rsquo; 프로젝트는 우연히 책장을 바라보다 발견한
              책과 죄수 사이의 놀라운 물리적, 체계적 유사성에서 시작되었습니다.
            </p>
            <p style={{ fontSize: 14, lineHeight: 2.1, fontWeight: 300, color: "#444", marginBottom: 18 }}>
              이 프로젝트에서 책의 모든 정보는 죄수의 인적 사항으로 재정의됩니다. 책의 제목은 죄수를
              부르는 이름이 되며, 책의 판형과 무게는 죄수의 신장 및 체중과 같은 신체 스펙으로
              재정의됩니다.
            </p>
            <p style={{ fontSize: 14, lineHeight: 2.1, fontWeight: 300, color: "#444" }}>
              심지어 책의 청구기호는 죄수의 수인 번호로 재정의됩니다.
            </p>
          </div>

          <div style={{ padding: "64px 32px 64px 48px" }}>
            <div
              style={{
                fontSize: 10, letterSpacing: "0.3em",
                textTransform: "uppercase", color: MUTED, marginBottom: 28,
              }}
            >English</div>
            <h2
              style={{
                fontFamily:   "'Noto Serif KR', Georgia, serif",
                fontSize:     "clamp(20px, 2.5vw, 32px)",
                fontWeight:   700,
                lineHeight:   1.3,
                color:        "#111",
                marginBottom: 24,
              }}
            >Books Are Prisoners</h2>
            <p style={{ fontSize: 14, lineHeight: 2.1, fontWeight: 300, color: "#444", marginBottom: 18 }}>
              The project <em>Prison of Literature</em> originated from the discovery of striking
              physical and systemic parallels between books and prisoners.
            </p>
            <p style={{ fontSize: 14, lineHeight: 2.1, fontWeight: 300, color: "#444", marginBottom: 18 }}>
              Within this framework, every piece of information regarding a book is reimagined as a
              prisoner&rsquo;s personal profile. The title functions as the inmate&rsquo;s name, while trim
              size and weight are redefined as physical attributes.
            </p>
            <p style={{ fontSize: 14, lineHeight: 2.1, fontWeight: 300, color: "#444" }}>
              Stripped of their original covers, all books are garbed in standardized
              &lsquo;prison uniforms&rsquo; categorized into S, M, and L sizes.
            </p>
          </div>
        </section>

        {/* ── 기관 정보 ── */}
        <section
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: `1px solid ${BORDER}` }}
        >
          {[
            { num: "01", title: "기관 / Institution",      content: "국립중앙도서관\nNational Library of Korea" },
            { num: "02", title: "소장 규모 / Holdings",    content: "1,200만점 이상의 자료\nOver 12 million items" },
            { num: "03", title: "데이터 출처 / Data Source", content: "국립중앙도서관 오픈 API\nNLK Open API" },
          ].map((item, i) => (
            <div key={i} style={{ padding: "40px 32px", borderRight: i < 2 ? `1px solid ${BORDER}` : "none" }}>
              <div style={{ fontFamily: "Courier New, monospace", fontSize: 10, color: "#BBB", letterSpacing: "0.2em", marginBottom: 12 }}>{item.num}</div>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED, marginBottom: 10 }}>{item.title}</div>
              <div style={{ fontFamily: "'Noto Serif KR', Georgia, serif", fontSize: 16, fontWeight: 700, color: "#111", lineHeight: 1.6, whiteSpace: "pre-line" }}>{item.content}</div>
            </div>
          ))}
        </section>

        {/* ── 개념 노트 ── */}
        <section style={{ padding: "72px 32px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: MUTED, marginBottom: 32 }}>개념 노트 / Conceptual Notes</div>
            {[
              {
                q: "왜 수감자인가? / Why prisoners?",
                a: "도서관의 책은 자유롭게 이동하지 못한다. 분류되고, 배치되고, 반출이 통제된다.\n\nBooks in a library cannot move freely. They are classified, shelved, and their removal is controlled.",
              },
              {
                q: "접견이란 무엇인가? / What is visitation?",
                a: "대출은 일시적인 해방이다. 하지만 반드시 돌아와야 한다.\n\nBorrowing is temporary liberation — but the book must always return.",
              },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 36 }}>
                <div style={{ fontFamily: "'Noto Serif KR', Georgia, serif", fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 12 }}>{item.q}</div>
                <p style={{ fontSize: 13, lineHeight: 2.0, fontWeight: 300, color: "#444", whiteSpace: "pre-line" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 하단 CTA ── */}
        <section style={{ padding: "64px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24, borderTop: `1px solid ${BORDER}` }}>
          <CtaLink />
          <div style={{ fontFamily: "Courier New, monospace", fontSize: 11, color: "#BBB", lineHeight: 1.8, textAlign: "right" }}>
            서울특별시 서초구 반포대로 201<br />
            National Library of Korea<br />
            서지교정국 — Dept. of Library Corrections
          </div>
        </section>
      </main>

      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.2em", color: MUTED, textTransform: "uppercase" }}>Prison of Literature — 서지교정국</span>
        <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "#BBB" }}>201, Banpo-daero, Seocho-gu, Seoul</span>
      </footer>
    </>
  );
}
