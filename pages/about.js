import Head from "next/head";
import Link from "next/link";

const CREAM = "#F5F0E8";

export default function About() {
  return (
    <>
      <Head>
        <title>About — Prison of Literature</title>
      </Head>

      <main>
        {/* ── HERO: NLK building ── */}
        <section style={{
          position: "relative",
          height: "70vh", minHeight: 480,
          display: "flex", flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 32px 48px",
          overflow: "hidden",
        }}>
          {/* Background photo — nlk-building.jpg in /public */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "url('/nlk-building.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            filter: "brightness(0.3)",
          }}>
            {/* Fallback gradient when image is absent */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 50%, #111 100%)",
              zIndex: -1,
            }} />
            {/* Grid pattern */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `
                linear-gradient(rgba(245,240,232,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(245,240,232,0.03) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
            }} />
          </div>

          {/* Bottom gradient overlay */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "60%",
            background: "linear-gradient(to top, rgba(13,13,13,1) 0%, transparent 100%)",
          }} />

          {/* Address text */}
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
              letterSpacing: "0.02em", lineHeight: 1.4, marginBottom: 8,
            }}>
              201, Banpo-daero, Seocho-gu, Seoul,<br />
              Republic of Korea
            </div>
            <div style={{
              fontSize: 13, color: "rgba(245,240,232,0.35)", letterSpacing: "0.05em",
            }}>
              서울특별시 서초구 반포대로 201 — 국립중앙도서관
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* ── Project description: 2-column bilingual ── */}
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "60vh" }}>
          {/* Korean */}
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
              fontWeight: 700, lineHeight: 1.3, color: CREAM, marginBottom: 28,
            }}>
              책은 죄수다
            </h2>

            <p style={{
              fontSize: 14, lineHeight: 2.1, fontWeight: 300,
              color: "rgba(245,240,232,0.5)", marginBottom: 20,
            }}>
              &lsquo;Prison of Literature(책은 죄수다)&rsquo; 프로젝트는 우연히 책장을 바라보다
              발견한 책과 죄수 사이의 놀라운 물리적, 체계적 유사성에서 시작되었습니다.
            </p>
            <p style={{
              fontSize: 14, lineHeight: 2.1, fontWeight: 300,
              color: "rgba(245,240,232,0.5)", marginBottom: 20,
            }}>
              이 프로젝트에서 책의 모든 정보는 죄수의 인적 사항으로 재정의됩니다.
              책의 제목은 죄수를 부르는 이름이 되며, 책의 판형과 무게는 죄수의 신장 및 체중과 같은
              신체 스펙으로 재정의됩니다. 또한 초판 발행일은 죄수의 생년월일이 되고,
              책을 체계적으로 관리하기 위해 부여된 고유 번호인 ISBN은 이 감옥에서
              부여하는 죄수 번호의 역할을 수행합니다.
            </p>
            <p style={{
              fontSize: 14, lineHeight: 2.1, fontWeight: 300,
              color: "rgba(245,240,232,0.5)",
            }}>
              심지어 책의 청구기호는 죄수의 수인 번호로 재정의됩니다. 모든 책은 기존의 화려한 표지를
              벗고, 판형에 따라 S, M, L 사이즈로 규격화된 &lsquo;죄수복(북 커버)&rsquo;을 입게 되며
              책등에는 수감 번호가 부착됩니다.
            </p>
          </div>

          {/* English */}
          <div style={{ padding: "72px 32px 72px 48px" }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
              color: "rgba(245,240,232,0.25)", marginBottom: 32,
            }}>English</div>

            <h2 style={{
              fontFamily: "'Noto Serif KR', Georgia, serif",
              fontSize: "clamp(22px, 2.5vw, 36px)",
              fontWeight: 700, lineHeight: 1.3, color: CREAM, marginBottom: 28,
            }}>
              Books Are Prisoners
            </h2>

            <p style={{
              fontSize: 14, lineHeight: 2.1, fontWeight: 300,
              color: "rgba(245,240,232,0.5)", marginBottom: 20,
            }}>
              The project <em>Prison of Literature</em> originated from the discovery of striking
              physical and systemic parallels between books and prisoners, observed by chance
              while gazing at a bookshelf.
            </p>
            <p style={{
              fontSize: 14, lineHeight: 2.1, fontWeight: 300,
              color: "rgba(245,240,232,0.5)", marginBottom: 20,
            }}>
              Within this framework, every piece of information regarding a book is reimagined
              as a prisoner&rsquo;s personal profile. The title of the book functions as the inmate&rsquo;s
              name, while its trim size and weight are redefined as physical attributes such as
              height and body mass. The date of first publication serves as the prisoner&rsquo;s date
              of birth, and the ISBN&mdash;the unique identifier used for systematic
              management&mdash;takes on the role of an inmate identification number within this prison.
            </p>
            <p style={{
              fontSize: 14, lineHeight: 2.1, fontWeight: 300,
              color: "rgba(245,240,232,0.5)",
            }}>
              Furthermore, even the call number is repurposed as the specific inmate number
              assigned to the prisoner. Stripped of their vibrant original covers, all books are
              garbed in standardized &lsquo;prison uniforms&rsquo;&mdash;custom book covers categorized into
              S, M, and L sizes according to their dimensions&mdash;with their inmate numbers
              clearly displayed on the spine.
            </p>
          </div>
        </section>

        <hr className="divider" />

        {/* ── Institutional facts: 3-column ── */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            { num: "01", title: "기관 / Institution",
              content: "국립중앙도서관\nNational Library of Korea" },
            { num: "02", title: "소장 규모 / Holdings",
              content: "1,200만점 이상의 자료\nOver 12 million items" },
            { num: "03", title: "데이터 출처 / Data Source",
              content: "국립중앙도서관 오픈 API\nNLK Open API" },
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
                color: CREAM, lineHeight: 1.6, whiteSpace: "pre-line",
              }}>{item.content}</div>
            </div>
          ))}
        </section>

        <hr className="divider" />

        {/* ── Conceptual notes ── */}
        <section style={{ padding: "80px 32px" }}>
          <div style={{ maxWidth: 720 }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
              color: "rgba(245,240,232,0.25)", marginBottom: 32,
            }}>개념 노트 / Conceptual Notes</div>

            {[
              {
                q: "왜 수감자인가? / Why prisoners?",
                a: "도서관의 책은 자유롭게 이동하지 못한다. 분류되고, 배치되고, 반출이 통제된다.\n\nBooks in a library cannot move freely. They are classified, shelved, and their removal is controlled. The metaphor of incarceration reveals the disciplinary apparatus embedded within the most benign of public institutions.",
              },
              {
                q: "접견이란 무엇인가? / What is visitation?",
                a: "대출은 일시적인 해방이다. 하지만 반드시 돌아와야 한다.\n\nBorrowing is temporary liberation — but the book must always return. The visitation system literalizes the transactional nature of library access: you may approach the prisoner, but only on the institution's terms.",
              },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 40 }}>
                <div style={{
                  fontFamily: "'Noto Serif KR', Georgia, serif",
                  fontSize: 17, fontWeight: 700, color: CREAM, marginBottom: 14,
                }}>{item.q}</div>
                <p style={{
                  fontSize: 13, lineHeight: 2.0, fontWeight: 300,
                  color: "rgba(245,240,232,0.45)", whiteSpace: "pre-line",
                }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        {/* ── Bottom CTA ── */}
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

      <footer style={{
        borderTop: "1px solid rgba(245,240,232,0.06)",
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
