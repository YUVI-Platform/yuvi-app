import { superbase } from "./superbaseClient";

export const fetchAllStudios = async () => {
  const { data, error } = await superbase.from("studios").select("*");

  if (error) {
    console.error("Fehler beim Laden der Studios:", error);
    return [];
  }

  return data;
};
