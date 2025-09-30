import { superbase } from "./superbaseClient";

export async function uploadFilesToSupabase(
  files: File[],
  userId: string
): Promise<string[]> {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}-${file.name}`;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await superbase.storage
      .from("studio-uploads")
      .upload(filePath, file);

    if (error) {
      console.error("Upload error:", error.message);
      continue;
    }

    const { data: publicUrlData } = superbase.storage
      .from("studio-uploads")
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      uploadedUrls.push(publicUrlData.publicUrl);
    }
  }

  return uploadedUrls;
}
// TODO: linting anpassen
