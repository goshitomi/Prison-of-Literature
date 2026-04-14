/* CSS 모듈 및 글로벌 CSS 임포트 타입 선언 */
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}
