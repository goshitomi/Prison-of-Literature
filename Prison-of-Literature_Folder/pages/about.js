import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Noto+Serif+KR:wght@400;700&display=swap";

const DARK = "#0D0D0D";
const CREAM = "#F5F0E8";

export default function About() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Head>
        <title>About — Prison of Literature</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONTS} rel="stylesheet" />
      </Head>

      <style jsx global>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif;
          background: ${DARK};
          color: ${CREAM};
          -webkit-font-smoothing: antialiased;
        }
        a { color: inherit; text-decoration: none; }
        button { cursor: pointer; font-family: inherit; background: none; border: none; }

        .nav-link {
          position: relative;
          display: inline-block;
          padding: 4px 0;
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(245,240,232,0.4);
          transition: color 0.2s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 1px;
          background: ${CREAM};
          transition: width 0.25s ease;
        }
        .nav-link:hover { color: ${CREAM}; }
        .nav-link:hover::after { width: 100%; }

        .divider {
          border: none;
          border-top: 1px solid rgba(245,240,232,0.08);
          margin: 0;
        }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 32px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(13,13,13,0.95)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(245,240,232,0.07)" : "none",
        backdropFilter: scrolled ? "blur(8px)" : "none",
        transition: "background 0.3s",
      }}>
        <Link href="/" style={{
          fontFamily: "'Noto Serif KR', Georgia, serif",
          fontSize: 13, fontWeight: 700, letterSpacing: "0.2em",
          textTransform: "uppercase", color: CREAM,
        }}>
          Prison of Literature
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Link href="/books" className="nav-link">Index</Link>
          <Link href="/about" className="nav-link" style={{ color: CREAM }}>About</Link>
        </nav>
      </header>

      <main>
        {/* ── HERO: 국립중앙도서관 ── */}
        <section style={{
          position: "relative",
          height: "70vh",
          minHeight: 480,
          display: "flex", flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 32px 48px",
          overflow: "hidden",
        }}>
          {/* 배경 — 국립중앙도서관 이미지 플레이스홀더 */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 50%, #111 100%)",
          }}>
            {/* 그리드 패턴 */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `
                linear-gradient(rgba(245,240,232,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(245,240,232,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
            }} />
            {/* 건물 실루엣 암시 */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
              background: "linear-gradient(to top, rgba(13,13,13,0.9) 0%, transparent 100%)",
            }} />
          </div>

          {/* 주소 텍스트 */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase",
              color: "rgba(245,240,232,0.3)", marginBottom: 16,
            }}>
              Location — 위치
            </div>
            <div style={{
              fontFamily: "'Noto Serif KR', Georgia, serif",
              fontSize: "clamp(16px, 2.5vw, 28px)",
              fontWeight: 700, color: CREAM,
              letterSpacing: "0.02em", lineHeight: 1.4,
              marginBottom: 8,
            }}>
              201, Banpo-daero, Seocho-gu, Seoul,<br />
              Republic of Korea
            </div>
            <div style={{
              fontSize: 13, color: "rgba(245,240,232,0.35)",
              letterSpacing: "0.05em",
            }}>
              서울특별시 서초구 반포대로 201 — 국립중앙도서관
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* ── 프로젝트 설명: 2컬럼 ── */}
        <section style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "60vh",
        }}>
          {/* 국문 */}
          <div style={{
            padding: "72px 48px 72px 32px",
            borderRight: "1px solid rgba(245,240,232,0.08)",
          }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
              color: "rgba(245,240,232,0.25)", marginBottom: 32,
            }}>한국어</div>

            <h2 style={{
              fontFamily: "'Noto Serif KR', Georgia, serif",
              fontSize: "clamp(22px, 2.5vw, 36px)",
              fontWeight: 700, lineHeight: 1.3,
              color: CREAM, marginBottom: 28,
            }}>
              책은 죄수다
            </h2>

            <p style={{
              fontSize: 14, lineHeight: 2.1, fontWeight: 300,
              color: "rgba(245,240,232,0.5)", marginBottom: 20,
            }}>
              『서지교정국(書誌矯正局)』은 국립중앙도서관의 장서를
              수감 체계로 재구성하는 개념적 프로젝트입니다.
            </p>
            <p style={{
              fontSize: 14, lineHeight: 2.1, fontWeight: 300,
              color: "rgba(245,240,232,0.5)", marginBottom: 20,
            }}>
              이 프로젝트는 도서관이라는 제도적 공간이 지식을 분류·통제·
              보존하는 방식이 교도소의 그것과 구조적으로 유사하다는 전제에서 출발합니다.
              청구기호는 수감번호가 되고, 서가는 감방이 되며,
              대출 여부는 접견 허가 여부가 됩니다.
            </p>
            <p style={{
              fontSize: 14, lineHeight: 2.1, fontWeight: 300,
              color: "rgba(245,240,232,0.5)",
            }}>
              방문자는 수감자 명부(Index)에서 책을 검색하고,
              열람을 원할 경우 접견 신청서를 제출해야 합니다.
              이 과정은 실제 국립중앙도서관의 소장 데이터를 기반으로 합니다.
            </p>
          </div>

          {/* 영문 */}
          <div style={{
            padding: "72px 32px 72px 48px",
          }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
              color: "rgba(245,240,232,0.25)", marginBottom: 32,
            }}>English</div>

            <h2 style={{
              fontFamily: "'Noto Serif KR', Georgia, serif",
              fontSize: "clamp(22px, 2.5vw, 36px)",
              fontWeight: 700, lineHeight: 1.3,
              color: CREAM, marginBottom: 28,
            }}>
              Books Are Prisoners
            </h2>

            <p style={{
              fontSize: 14, lineHeight: 2.1, fontWeight: 300,
              color: "rgba(245,240,232,0.5)", marginBottom: 20,
            }}>
              <em>Prison of Literature</em> (서지교정국, Dept. of Library
              Corrections) is a conceptual project that reimagines the holdings
              of the National Library of Korea as inmates within a carceral system.
            </p>
            <p style={{
              fontSize: 14, lineHeight: 2.1, fontWeight: 300,
              color: "rgba(245,240,232,0.5)", marginBottom: 20,
            }}>
              The project departs from the structural proposition that the
              institutional logic of the library — its systems of classification,
              control, and preservation — mirrors that of the prison. Call numbers
              become prisoner IDs; stacks become cells; loan status becomes
              visitation rights.
            </p>
            <p style={{
              fontSize: 14, lineHeight: 2.1, fontWeight: 300,
              color: "rgba(245,240,232,0.5)",
            }}>
              Visitors may search the inmate index and submit a visitation request
              to access any book. All data is drawn from the actual holdings of
              the National Library of Korea.
            </p>
          </div>
        </section>

        <hr className="divider" />

        {/* ── 제도적 정보 ── */}
        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
        }}>
          {[
            {
              num: "01",
              title: "기관 / Institution",
              content: "국립중앙도서관\nNational Library of Korea",
            },
            {
              num: "02",
              title: "소장 규모 / Holdings",
              content: "1,200만점 이상의 자료\nOver 12 million items",
            },
            {
              num: "03",
              title: "데이터 출처 / Data Source",
              content: "국립중앙도서관 오픈 API\nNLK Open API",
            },
          ].map((item, i) => (
            <div key={i} style={{
              padding: "48px 32px",
              borderRight: i < 2 ? "1px solid rgba(245,240,232,0.06)" : "none",
              borderTop: "1px solid rgba(245,240,232,0.06)",
            }}>
              <div style={{
                fontFamily: "'Courier New', monospace",
                fontSize: 10, color: "rgba(245,240,232,0.2)",
                letterSpacing: "0.2em", marginBottom: 16,
              }}>{item.num}</div>
              <div style={{
                fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
                color: "rgba(245,240,232,0.3)", marginBottom: 12,
              }}>{item.title}</div>
              <div style={{
                fontFamily: "'Noto Serif KR', Georgia, serif",
                fontSize: 16, fontWeight: 700,
                color: CREAM, lineHeight: 1.6,
                whiteSpace: "pre-line",
              }}>
                {item.content}
              </div>
            </div>
          ))}
        </section>

        <hr className="divider" />

        {/* ── 개념 노트 ── */}
        <section style={{ padding: "80px 32px" }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
              color: "rgba(245,240,232,0.25)", marginBottom: 32,
            }}>개념 노트 / Conceptual Notes</div>

            {[
              {
                q: "왜 수감자인가? / Why prisoners?",
                a: `도서관의 책은 자유롭게 이동하지 못한다. 분류되고, 배치되고, 반출이 통제된다.\n
Books in a library cannot move freely. They are classified, shelved, and their removal is controlled. The metaphor of incarceration reveals the disciplinary apparatus embedded within the most benign of public institutions.`,
              },
              {
                q: "접견이란 무엇인가? / What is visitation?",
                a: `대출은 일시적인 해방이다. 하지만 반드시 돌아와야 한다.\n
Borrowing is temporary liberation — but the book must always return. The visitation system literalizes the transactional nature of library access: you may approach the prisoner, but only on the institution's terms.`,
              },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 40 }}>
                <div style={{
                  fontFamily: "'Noto Serif KR', Georgia, serif",
                  fontSize: 17, fontWeight: 700,
                  color: CREAM, marginBottom: 14,
                }}>{item.q}</div>
                <p style={{
                  fontSize: 13, lineHeight: 2.0, fontWeight: 300,
                  color: "rgba(245,240,232,0.45)",
                  whiteSpace: "pre-line",
                }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        {/* ── 하단 CTA ── */}
        <section style={{
          padding: "80px 32px",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 32,
        }}>
          <Link href="/books" style={{
            fontFamily: "'Noto Serif KR', Georgia, serif",
            fontSize: "clamp(20px, 3vw, 38px)",
            fontWeight: 700, color: CREAM,
            borderBottom: "1px solid rgba(245,240,232,0.2)",
            paddingBottom: 4,
            transition: "color 0.2s, border-color 0.2s",
          }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "#C62828";
              e.currentTarget.style.borderColor = "#C62828";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = CREAM;
              e.currentTarget.style.borderColor = "rgba(245,240,232,0.2)";
            }}
          >
            수감자 명부 보기 →
          </Link>
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 11, color: "rgba(245,240,232,0.2)",
            lineHeight: 1.8, textAlign: "right",
          }}>
            서울특별시 서초구 반포대로 201<br />
            National Library of Korea<br />
            서지교정국 — Dept. of Library Corrections
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(245,240,232,0.06)",
        padding: "20px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 8,
      }}>
        <span style={{ fontSize: 10, letterSpacing: "0.25em", color: "rgba(245,240,232,0.2)", textTransform: "uppercase" }}>
          Prison of Literature — 서지교정국
        </span>
        <span style={{ fontSize: 10, letterSpacing: "0.15em", color: "rgba(245,240,232,0.15)" }}>
          201, Banpo-daero, Seocho-gu, Seoul
        </span>
      </footer>
    </>
  );
}
