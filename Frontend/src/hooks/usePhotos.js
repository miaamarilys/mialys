import { useEffect, useState, useCallback } from "react";
import { fetchPhotos, uploadPhoto } from "../services/photoService.js";

export function usePhotos() {
  const [photos, setPhotos] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadError, setUploadError] = useState("");

  const refreshPhotos = useCallback(async () => {
    try {
      const data = await fetchPhotos();
      setPhotos(data);
    } catch {
      setPhotos({});
    }
  }, []);

  useEffect(() => {
    refreshPhotos();
  }, [refreshPhotos]);

  const handlePhoto = useCallback(async (id, file) => {
    if (!file || !id) return;
    setUploadingId(id);
    setUploadError("");

    try {
      const result = await uploadPhoto(id, file);
      setPhotos((current) => ({ ...current, [id]: result.url }));
      return result;
    } catch (err) {
      setUploadError(err.message || "Error al subir la imagen");
      throw err;
    } finally {
      setUploadingId(null);
    }
  }, []);

  return {
    photos,
    uploadingId,
    uploadError,
    handlePhoto,
    refreshPhotos,
  };
}
