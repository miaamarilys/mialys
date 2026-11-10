import { useEffect, useState } from "react";
import { featured, formatPrice } from "../data/products.js";

export default function Featured({ onAdd }) {
  const [photos, setPhotos] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    fetch("/api/photos")
      .then((response) => (response.ok ? response.json() : {}))
      .then((data) => setPhotos(data))
      .catch(() => setPhotos({}));
  }, []);

  async function handlePhoto(id, file) {
    if (!file || uploadingId) return;

    setUploadingId(id);
    setUploadError("");
    const body = new FormData();
    body.append("photo", file);

    try {
      const response = await fetch(`/api/photos/${id}`, { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "No se pudo subir la foto.");
      }
      setPhotos((current) => ({ ...current, [id]: data.url }));
    } catch (error) {
      setUploadError(
        error.message === "Failed to fetch"
          ? "No se pudo subir la foto. Revisa que el backend esté en marcha."
          : error.message
      );
    } finally {
      setUploadingId(null);
    }
  }

  function handleAdd(product) {
    onAdd(product);
    setAddedId(product.id);
    window.setTimeout(() => {
      setAddedId((current) => (current === product.id ? null : current));
    }, 1400);
  }

  return (
    <section className="featured" aria-label="Productos destacados">
      <div className="featured-card">
        <div className="featured-head">
          <h2>
            Productos destacados
            <svg className="featured-heart" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 19s-6.2-3.8-8-7.4C2.6 8.6 3.6 5.6 6.4 5.1 8.4 4.7 10 5.7 12 8c2-2.3 3.6-3.3 5.6-2.9 2.8.5 3.8 3.5 2.4 6.5-1.8 3.6-8 7.4-8 7.4Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </h2>
          <a href="#catalogo">
            Ver todos <span aria-hidden="true">→</span>
          </a>
        </div>

        {uploadError && (
          <p className="field-error catalog-error" role="alert">
            {uploadError}
          </p>
        )}

        <div className="featured-grid">
          {featured.map((product) => {
            const photo = photos[product.id];
            const uploading = uploadingId === product.id;

            return (
              <article className="spot" key={product.id}>
                <div className={photo ? "spot-photo has-photo" : "spot-photo"}>
                  {photo ? <img src={photo} alt={product.name} /> : null}
                  <label className={photo ? "spot-upload is-change" : "spot-upload"}>
                    {uploading ? "Subiendo…" : photo ? "Cambiar imagen" : "Agregar imagen"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      disabled={Boolean(uploadingId)}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) handlePhoto(product.id, file);
                      }}
                    />
                  </label>
                </div>
                <h3>{product.name}</h3>
                <p className="spot-price">{formatPrice(product.price)}</p>
                <button type="button" className="spot-add" onClick={() => handleAdd(product)}>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M6.5 8.5h11l-.7 9.2a1.4 1.4 0 0 1-1.4 1.3H8.6a1.4 1.4 0 0 1-1.4-1.3L6.5 8.5Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M9 8.5V7.4A3 3 0 0 1 12 4.4a3 3 0 0 1 3 3v1.1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  {addedId === product.id ? "Agregado" : "Agregar"}
                </button>
              </article>
            );
          })}
        </div>

        <div className="offer">
          <div className="offer-copy">
            <h3>
              Descubre
              <br />
              nuestras mejores ofertas
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 19s-6.2-3.8-8-7.4C2.6 8.6 3.6 5.6 6.4 5.1 8.4 4.7 10 5.7 12 8c2-2.3 3.6-3.3 5.6-2.9 2.8.5 3.8 3.5 2.4 6.5-1.8 3.6-8 7.4-8 7.4Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
            </h3>
            <p>Productos de calidad, pensados para ti.</p>
            <a className="offer-btn" href="#catalogo">
              Ver ofertas <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className={photos.ofertas ? "offer-photo has-photo" : "offer-photo"}>
            {photos.ofertas ? <img src={photos.ofertas} alt="Imagen de ofertas" /> : null}
            <label className={photos.ofertas ? "spot-upload is-change" : "spot-upload"}>
              {uploadingId === "ofertas" ? "Subiendo…" : photos.ofertas ? "Cambiar imagen" : "Agregar imagen"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={Boolean(uploadingId)}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) handlePhoto("ofertas", file);
                }}
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
