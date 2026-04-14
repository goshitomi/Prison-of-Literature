/* Roma Publications 패턴 기반 디자인 토큰 */
export const FONT = "Arial, Helvetica, sans-serif";
export const ACCENT = "#C62828";
export const ROW_BORDER = "#FFE0E0";
export const MUTED = "#767676";
export const PER_PAGE = 30;
export const VIRTUALIZATION_THRESHOLD = 100; // react-window 활성화 임계값

export const STATUS_BAR: Record<string, string> = {
  AVAILABLE: "#1B5E20",
  CHECKED_OUT: "#BF360C",
  RESTRICTED: "#B71C1C",
};

export const STRIPE: Record<string, [string, string]> = {
  AVAILABLE: ["#EEF7EE", "#D4EDD4"],
  CHECKED_OUT: ["#FFF4EE", "#FFE3CC"],
  RESTRICTED: ["#FFF2F2", "#FFD6D6"],
};

export type StatusKey = "AVAILABLE" | "CHECKED_OUT" | "RESTRICTED";
