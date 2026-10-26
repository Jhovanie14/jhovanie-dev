import { createCn } from "cn/config"

// The five type steps (globals.css @theme) are font sizes, not colours, so
// `text-heading text-foreground` must keep both instead of merging them away.
export const cn = createCn({
  extend: { classGroups: { "font-size": [{ text: ["display", "heading", "lead", "body", "small"] }] } },
})
