import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

export default function Home() {
  const [total, setTotal] = useState(null);

  useEffect(() => {
    fetch("/api/books?pageNo=1&numOfRows=1&koreanOnly=true")
      .then((r) => r.json())
      .then((d) => setTotal(d?.body?.totalCount || d?.totalCount || null))
      .catch(() => {});
  }, []);

  return (
    <>
      <Head>
        <title>PRISON OF LITERATURE — 책은 죄수다</title>
      </Head>

      <main>
        {/* ── HERO ── */}
        <section style={{
          minHeight: "100vh",
          display: "flex", flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 32px 64px",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(245,240,232,0.03) 79px, rgba(245,240,232,0.03) 80px)",
          }} />
          <div style={{
            position: "absolute", top: 96, left: 32,
            fontSize: 10, letterSpacing: "0.35em",
            color: "rgba(245,240,232,0.25)", textTransform: "uppercase",
          }}>
            서지교정국 — Dept. of Library Corrections
          </div>

          <div style={{ maxWidth: 1200, position: "relative" }}>
            <h1 style={{
              fontFamily: "'Noto Serif KR', Georgia, serif",
              fontSize: "clamp(52px, 8.5vw, 130px)",
              fontWeight: 700, lineHeight: 1.0,
              letterSpacing: "-0.02em", color: "#F5F0E8", marginBottom: 28,
            }}>
              Prison<br />of<br />Literature
            </h1>

            <div style={{
              display: "flex", alignItems: "flex-end",
              justifyContent: "space-between", flexWrap: "wrap", gap: 32,
            }}>
              <div>
                <div style={{
                  fontFamily: "'Noto Serif KR', Georgia, serif",
                  fontSize: "clamp(18px, 3vw, 36px)",
                  fontWeight: 400, color: "#C62828",
                  letterSpacing: "0.05em", marginBottom: 16,
                }}>
                  책은 죄수다
                </div>
                <p style={{
                  fontSize: 13, lineHeight: 1.85,
                  color: "rgba(245,240,232,0.45)",
                  maxWidth: 400, letterSpacing: "0.02em", fontWeight: 300,
                }}>
                  모든 책은 국립중앙도서관의 벽 안에 수감되어 있다.<br />
                  Every book is an inmate within the walls<br />
                  of the National Library of Korea.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-end" }}>
                {total !== null && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontFamily: "'Noto Serif KR', monospace",
                      fontSize: "clamp(32px, 4vw, 56px)",
                      fontWeight: 700, color: "#F5F0E8", lineHeight: 1,
                    }}>
                      {total.toLocaleString()}
                    </div>
                    <div style={{
                      fontSize: 10, letterSpacing: "0.25em",
                      color: "rgba(245,240,232,0.3)",
                      marginTop: 4, textTransform: "uppercase",
                    }}>
                      현재 수감 중인 책
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 28 }}>
                  <Link href="/books" className="cta-link">
                    명부 보기 <span className="arrow">→</span>
                  </Link>
                  <Link href="/about" className="cta-link">
                    About <span className="arrow">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* ── TICKER ── */}
        <section style={{
          overflow: "hidden", padding: "14px 0",
          borderBottom: "1px solid rgba(245,240,232,0.08)",
        }}>
          <div className="ticker-inner">
            {[0, 1].map((ri) => (
              <span key={ri} style={{
                fontSize: 11, letterSpacing: "0.25em",
                color: "rgba(245,240,232,0.2)", textTransform: "uppercase",
              }}>
                {[
                  "AVAILABLE", "접견가능", "CHECKED OUT", "접견중",
                  "RESTRICTED", "접견불가", "INMATE FILE", "수감자 기록",
                  "PRISON OF LITERATURE", "책은 죄수다",
                  "DEPT. OF LIBRARY CORRECTIONS", "서지교정국",
                ].map((w, i) => (
                  <span key={i} style={{ marginRight: "4em" }}>{w}</span>
                ))}
              </span>
            ))}
          </div>
        </section>

        <hr className="divider" />

        {/* ── CONCEPT ── */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "60vh" }}>
          <div style={{
            padding: "80px 48px 80px 32px",
            borderRight: "1px solid rgba(245,240,232,0.08)",
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.3em",
              color: "rgba(245,240,232,0.25)", textTransform: "uppercase", marginBottom: 32,
            }}>01 — Concept</div>
            <h2 style={{
              fontFamily: "'Noto Serif KR', Georgia, serif",
              fontSize: "clamp(22px, 2.8vw, 42px)",
              fontWeight: 700, lineHeight: 1.25, color: "#F5F0E8", marginBottom: 24,
            }}>
              도서관은 감옥이다.<br />The Library is a Prison.
            </h2>
            <p style={{
              fontSize: 14, lineHeight: 1.95,
              color: "rgba(245,240,232,0.45)", fontWeight: 300, maxWidth: 420,
            }}>
              서지교정국(書誌矯正局)은 국립중앙도서관 소장 도서를
              수감자로 재구성하는 개념적 프로젝트입니다.
              각 책은 분류 번호를 수감번호로, 서가를 감방으로,
              대출 상태를 접견 허가로 번역합니다.
            </p>
          </div>

          <div style={{
            padding: "80px 32px 80px 48px",
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.3em",
              color: "rgba(245,240,232,0.25)", textTransform: "uppercase", marginBottom: 32,
            }}>02 — Context</div>
            <p style={{
              fontSize: 14, lineHeight: 1.95,
              color: "rgba(245,240,232,0.45)", fontWeight: 300,
            }}>
              The Dept. of Library Corrections (서지교정국) is a conceptual
              project that reimagines the holdings of the National Library of
              Korea as inmates within a carceral system. Call numbers become
              prisoner IDs; stacks become cells; loan status becomes visitation
              rights.
            </p>
            <div style={{ marginTop: 40 }}>
              <Link href="/about" className="cta-link">
                Read more about the project <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* ── STATUS KEY ── */}
        <section style={{
          padding: "72px 32px",
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1, background: "rgba(245,240,232,0.04)",
        }}>
          {[
            { ko: "접견가능", en: "Available", color: "#2B6E2B",
              desc: "해당 수감자(책)는 현재 접견이 가능합니다. 방문을 신청하세요." },
            { ko: "접견중", en: "Checked Out", color: "#C25700",
              desc: "현재 다른 방문자가 접견 중입니다. 반납 예정일을 확인하세요." },
            { ko: "접견불가", en: "Restricted", color: "#C62828",
              desc: "해당 수감자(책)는 접근이 제한되어 있습니다. 열람 허가 필요." },
          ].map((s, i) => (
            <div key={i} style={{ padding: "40px 32px", borderRight: "1px solid rgba(245,240,232,0.06)" }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: s.color, marginBottom: 20,
              }} />
              <div style={{
                fontFamily: "'Noto Serif KR', Georgia, serif",
                fontSize: 22, fontWeight: 700, color: "#F5F0E8", marginBottom: 4,
              }}>{s.ko}</div>
              <div style={{
                fontSize: 11, letterSpacing: "0.2em", color: s.color,
                marginBottom: 16, textTransform: "uppercase",
              }}>{s.en}</div>
              <p style={{
                fontSize: 12, lineHeight: 1.8,
                color: "rgba(245,240,232,0.35)", fontWeight: 300,
              }}>{s.desc}</p>
            </div>
          ))}
        </section>

        <hr className="divider" />

        {/* ── ENTER CTA ── */}
        <section style={{ padding: "120px 32px", textAlign: "center" }}>
          <div style={{
            fontSize: 10, letterSpacing: "0.3em",
            color: "rgba(245,240,232,0.2)", textTransform: "uppercase", marginBottom: 40,
          }}>
            수감자 명부 열람 / Browse the Index
          </div>
          <Link href="/books" style={{
            display: "inline-block",
            fontFamily: "'Noto Serif KR', Georgia, serif",
            fontSize: "clamp(28px, 4vw, 56px)",
            fontWeight: 700, color: "#F5F0E8",
            borderBottom: "1px solid rgba(245,240,232,0.2)",
            paddingBottom: 4, letterSpacing: "-0.01em",
            transition: "color 0.2s, border-color 0.2s",
          }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#C62828";
              e.currentTarget.style.borderColor = "#C62828";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "#F5F0E8";
              e.currentTarget.style.borderColor = "rgba(245,240,232,0.2)";
            }}
          >
            수감자 명부 열람 →
          </Link>
        </section>
      </main>

      <footer style={{
        borderTop: "1px solid rgba(245,240,232,0.08)",
        padding: "20px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 8,
      }}>
        <span style={{
          fontSize: 10, letterSpacing: "0.25em",
          color: "rgba(245,240,232,0.2)", textTransform: "uppercase",
        }}>
          Prison of Literature — 서지교정국
        </span>
        <span style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(245,240,232,0.15)" }}>
          201, Banpo-daero, Seocho-gu, Seoul
        </span>
      </footer>
    </>
  );
}
