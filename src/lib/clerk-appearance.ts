import type { ComponentProps } from "react";
import type { ClerkProvider } from "@clerk/nextjs";

type Appearance = NonNullable<ComponentProps<typeof ClerkProvider>["appearance"]>;

/**
 * Skin Clerk's prebuilt UI with the BetterReads tokens. Because these are CSS
 * variables, the same config follows the light/dark theme switch.
 */
export const appearance: Appearance = {
  variables: {
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "#ffffff",
    colorBackground: "var(--card)",
    colorForeground: "var(--ink)",
    colorMuted: "var(--card-2)",
    colorMutedForeground: "var(--ink-soft)",
    colorInput: "var(--card)",
    colorInputForeground: "var(--ink)",
    colorBorder: "var(--edge-strong)",
    colorNeutral: "var(--ink)",
    colorDanger: "#e5484d",
    fontFamily: "var(--font-nunito), system-ui, sans-serif",
    fontFamilyButtons: "var(--font-fredoka), system-ui, sans-serif",
    borderRadius: "1rem",
  },
  elements: {
    rootBox: "!w-full",
    cardBox:
      "!w-full !overflow-hidden !rounded-[1.75rem] !border-[2.5px] !border-[var(--edge)] !bg-[var(--card)] !shadow-[0_6px_0_var(--edge),var(--shadow-soft)]",
    card: "!border-0 !bg-transparent !shadow-none",
    footer: "!bg-[var(--card-2)]",
    formButtonPrimary:
      "!font-display !font-semibold !rounded-full !border-[2.5px] !border-[var(--primary-edge)] !shadow-[0_5px_0_var(--primary-edge)] hover:!brightness-105",
    footerActionLink: "!text-[var(--plum)] !font-bold",
  },
};

export const userButtonAppearance: Appearance = {
  elements: {
    avatarBox: "!size-9 !border-[2.5px] !border-[var(--edge-strong)]",
  },
};
