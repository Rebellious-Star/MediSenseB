import type { DeepPartial } from "./types";
import { en } from "./en";
import { hi } from "./hi";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { zh } from "./zh";
import { bn } from "./bn";
import { ta } from "./ta";
import { te } from "./te";
import { mr } from "./mr";
import { gu } from "./gu";
import { kn } from "./kn";
import { ml } from "./ml";
import { pa } from "./pa";
import { od } from "./od";

function deepMerge<T extends Record<string, unknown>>(base: T, override: DeepPartial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(override) as (keyof T)[]) {
    const baseVal = result[key];
    const overrideVal = override[key];
    if (overrideVal !== undefined && overrideVal !== null) {
      if (
        typeof baseVal === "object" &&
        baseVal !== null &&
        !Array.isArray(baseVal) &&
        typeof overrideVal === "object" &&
        overrideVal !== null &&
        !Array.isArray(overrideVal)
      ) {
        (result as Record<string, unknown>)[key as string] = deepMerge(
          baseVal as Record<string, unknown>,
          overrideVal as Record<string, unknown>
        );
      } else {
        (result as Record<string, unknown>)[key as string] = overrideVal;
      }
    }
  }
  return result;
}

const ALL: Record<string, DeepPartial<typeof en>> = {
  EN: en,
  HI: hi,
  OD: od,
  BN: bn,
  TE: te,
  MR: mr,
  TA: ta,
  GU: gu,
  KN: kn,
  ML: ml,
  PA: pa,
  ES: es,
  FR: fr,
  DE: de,
  ZH: zh,
};

export type Translations = typeof en;

export function getTranslations(lang: string): Translations {
  const override = ALL[lang] || ALL["EN"];
  return deepMerge({ ...en }, override) as Translations;
}
