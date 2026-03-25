import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { PlacesSearchPlace } from "@/lib/crm/places-types";

type GoogPlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  types?: string[];
};

function normalizePlace(p: GoogPlace): PlacesSearchPlace | null {
  const id = p.id ?? "";
  const name = p.displayName?.text?.trim() ?? "";
  if (!id || !name) return null;
  return {
    id,
    name,
    formattedAddress: p.formattedAddress ?? null,
    rating: typeof p.rating === "number" ? p.rating : null,
    userRatingCount:
      typeof p.userRatingCount === "number" ? p.userRatingCount : null,
    websiteUri: p.websiteUri ?? null,
    types: Array.isArray(p.types) ? p.types : [],
  };
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized", places: [] }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "agency_admin" && profile?.role !== "agency_member") {
    return NextResponse.json({ error: "Forbidden", places: [] }, { status: 403 });
  }

  let body: { textQuery?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON", places: [] }, { status: 400 });
  }

  const textQuery = String(body.textQuery ?? "").trim();
  if (!textQuery || textQuery.length > 280) {
    return NextResponse.json(
      { error: "Enter a search between 1 and 280 characters.", places: [] },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({
      places: [] as PlacesSearchPlace[],
      warning:
        "Set GOOGLE_PLACES_API_KEY in .env.local (Places API enabled) to search businesses.",
    });
  }

  const fieldMask =
    "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.types";

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": fieldMask,
    },
    body: JSON.stringify({ textQuery, languageCode: "en" }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({
      places: [] as PlacesSearchPlace[],
      warning: `Places API error (${res.status}). Check billing and API enablement.`,
      detail: text.slice(0, 200),
    });
  }

  const data = (await res.json()) as { places?: GoogPlace[] };
  const places = (data.places ?? [])
    .map(normalizePlace)
    .filter((x): x is PlacesSearchPlace => x !== null);

  return NextResponse.json({ places });
}
