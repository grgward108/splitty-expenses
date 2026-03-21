/**
 * デザイントークン（配色）のマスター定義。
 * 配色を変更するときはこのファイルのみ編集する。
 * Tailwind設定・base.css・Ionic変数はここから派生する。
 *
 * ブランド: 背景 #F7FAFF、メインオレンジ #F7AB00、アクセントシアン #00E5FF、テキスト #0B1026。
 */

/** コアブランド（単色） */
export const brand = {
  background: { hex: "#F7FAFF", rgb: "247 250 255" },
  orange: { hex: "#F7AB00", rgb: "247 171 0" },
  cyan: { hex: "#00E5FF", rgb: "0 229 255" },
  text: { hex: "#0B1026", rgb: "11 16 38" },
};

export const colors = {
  /** メイン（オレンジ）— 500 がブランドオレンジ */
  primary: {
    50: { hex: "#FFFBF0", rgb: "255 251 240" },
    100: { hex: "#FEF3D6", rgb: "254 243 214" },
    200: { hex: "#FDE4A8", rgb: "253 228 168" },
    300: { hex: "#FCD06A", rgb: "252 208 106" },
    400: { hex: "#F9BC2E", rgb: "249 188 46" },
    500: { hex: brand.orange.hex, rgb: brand.orange.rgb },
    600: { hex: "#CC9000", rgb: "204 144 0" },
    700: { hex: "#A37300", rgb: "163 115 0" },
    800: { hex: "#7A5700", rgb: "122 87 0" },
    900: { hex: "#4D3600", rgb: "77 54 0" },
    950: { hex: "#291D00", rgb: "41 29 0" },
  },
  /** アクセント（シアン）— 500 がブランドシアン */
  accent: {
    50: { hex: "#E6FDFF", rgb: "230 253 255" },
    100: { hex: "#B3F7FF", rgb: "179 247 255" },
    200: { hex: "#80F0FF", rgb: "128 240 255" },
    300: { hex: "#4DE9FF", rgb: "77 233 255" },
    400: { hex: "#1AE3FF", rgb: "26 227 255" },
    500: { hex: brand.cyan.hex, rgb: brand.cyan.rgb },
    600: { hex: "#00B8CC", rgb: "0 184 204" },
    700: { hex: "#008A99", rgb: "0 138 153" },
    800: { hex: "#005C66", rgb: "0 92 102" },
    900: { hex: "#002E33", rgb: "0 46 51" },
    950: { hex: "#001719", rgb: "0 23 25" },
  },
  secondary: {
    50: { hex: "#F4F6FA", rgb: "244 246 250" },
    100: { hex: "#E8ECF4", rgb: "232 236 244" },
    200: { hex: "#D1D8E8", rgb: "209 216 232" },
    300: { hex: "#A8B4CC", rgb: "168 180 204" },
    400: { hex: "#7886A8", rgb: "120 134 168" },
    500: { hex: "#556189", rgb: "85 97 137" },
    600: { hex: "#3D4665", rgb: "61 70 101" },
    700: { hex: "#2B3248", rgb: "43 50 72" },
    800: { hex: "#1A1F30", rgb: "26 31 48" },
    900: { hex: brand.text.hex, rgb: brand.text.rgb },
    950: { hex: "#05070F", rgb: "5 7 15" },
  },
  success: {
    50: { hex: "#f0fdf4", rgb: "240 253 244" },
    500: { hex: "#22c55e", rgb: "34 197 94" },
    600: { hex: "#16a34a", rgb: "22 163 74" },
  },
  warning: {
    50: { hex: "#fffbeb", rgb: "255 251 235" },
    500: { hex: "#f59e0b", rgb: "245 158 11" },
    600: { hex: "#d97706", rgb: "217 119 6" },
  },
  danger: {
    50: { hex: "#fef2f2", rgb: "254 242 242" },
    500: { hex: "#ef4444", rgb: "239 68 68" },
    600: { hex: "#dc2626", rgb: "220 38 38" },
  },
};

/** セマンティックトークン（背景・前景・カード等）。base.css の CSS 変数と一致させる。 */
export const semanticTokens = {
  light: {
    background: brand.background.rgb,
    foreground: brand.text.rgb,
    card: "255 255 255",
    cardForeground: brand.text.rgb,
    border: colors.secondary[200].rgb,
    muted: colors.secondary[100].rgb,
    mutedForeground: colors.secondary[500].rgb,
  },
  dark: {
    background: brand.text.rgb,
    foreground: brand.background.rgb,
    card: colors.secondary[800].rgb,
    cardForeground: brand.background.rgb,
    border: colors.secondary[600].rgb,
    muted: colors.secondary[800].rgb,
    mutedForeground: colors.secondary[300].rgb,
  },
};
