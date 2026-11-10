import { useEffect, useState } from "react";

const SERVICES = [
  {
    id: "servicio-limpieza",
    title: "Limpieza facial profunda con revitalización",
    duration: "80 min",
    price: 50,
    text: "Eliminamos las impurezas que opacan tu piel y la revitalizamos con nutrientes concentrados y fototerapia.",
    fallback: "/servicios/servicio-limpieza.jpg",
  },
  {
    id: "servicio-madura",
    title: "Tratamiento piel madura",
    duration: "90 min",
    price: 65,
    text: "Disminuye la aparición de arrugas y líneas de expresión, aportando firmeza y luminosidad a la piel.",
    fallback: "/servicios/servicio-madura.jpg",
  },
  {
    id: "servicio-manchas",
    title: "Tratamiento de hiperpigmentación",
    duration: "60 min",
    price: 50,
    text: "Atenúa notablemente las manchas de la piel y ayuda a unificar el tono para un rostro más parejo.",
    fallback: "/servicios/servicio-manchas.jpg",
  },
  {
    id: "servicio-corporal",
    title: "Ritual corporal relajante",
    duration: "70 min",
    price: 45,
    text: "Hidrata y suaviza el cuerpo con un masaje suave, texturas nutritivas y un ambiente cálido de descanso.",
    fallback: "/servicios/servicio-corporal.jpg",
  },
];

const LOCAL_SLOTS = [
  { id: "local-1", label: "Fachada del local", fallback: "/local/local-fachada.jpg" },
  { id: "local-2", label: "Área de atención", fallback: "/local/local-atencion.jpg" },
  { id: "local-3", label: "Espacio de productos", fallback: "/local/local-productos.jpg" },
  { id: "local-4", label: "Detalle del local", fallback: "/local/local-detalle.jpg" },
];

export default function Services({ onOpenCatalog }) {
  const [photos, setPhotos] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
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
      if (!response.ok) throw new Error(data.error || "No se pudo subir la foto.");
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

  function photoOf(id, fallback) {
    return photos[id] || fallback || null;
  }

  return (
    <section id="servicios" className="services" aria-labelledby="services-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Estética integral</p>
            <h2 id="services-title">Belleza con intención, de la piel al ritual.</h2>
          </div>
          <p className="section-note">
            En Mialys Skin reunimos tratamientos y orientación para un cuidado simple, honesto y completo.
          </p>
        </div>

        {uploadError && (
          <p className="field-error catalog-error" role="alert">
            {uploadError}
          </p>
        )}

        <div className="service-list">
          {SERVICES.map((service) => {
            const photo = photoOf(service.id, service.fallback);
            const uploading = uploadingId === service.id;
            return (
              <article className="service-row" key={service.id}>
                <div className={photo ? "service-row-photo has-photo" : "service-row-photo"}>
                  {photo ? <img src={photo} alt={service.title} loading="lazy" /> : null}
                  <label className={photo ? "spot-upload is-change" : "spot-upload"}>
                    {uploading ? "Subiendo…" : photo ? "Cambiar imagen" : "Agregar imagen"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      disabled={Boolean(uploadingId)}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) handlePhoto(service.id, file);
                      }}
                    />
                  </label>
                </div>
                <div className="service-row-copy">
                  <h3>
                    <span className="service-row-name">{service.title}</span>
                    <span className="service-row-sep" aria-hidden="true">
                      ---
                    </span>
                    <span className="service-row-meta">{service.duration}</span>
                    <span className="service-row-sep" aria-hidden="true">
                      ---
                    </span>
                    <span className="service-row-price">${service.price}</span>
                  </h3>
                  <p>{service.text}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="local-block">
          <div className="section-head">
            <div>
              <p className="eyebrow">Nuestro local</p>
              <h2 id="local-title">Conoce el espacio Mialys Skin</h2>
            </div>
            <p className="section-note">Fotos del local para que veas el lugar antes de visitarnos.</p>
          </div>

          <div className="local-grid">
            {LOCAL_SLOTS.map((slot) => {
              const photo = photoOf(slot.id, slot.fallback);
              const uploading = uploadingId === slot.id;
              return (
                <figure className="local-card" key={slot.id}>
                  <div className={photo ? "local-photo has-photo" : "local-photo"}>
                    {photo ? <img src={photo} alt={slot.label} loading="lazy" /> : null}
                    <label className={photo ? "spot-upload is-change" : "spot-upload"}>
                      {uploading ? "Subiendo…" : photo ? "Cambiar imagen" : "Agregar imagen"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        disabled={Boolean(uploadingId)}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          if (file) handlePhoto(slot.id, file);
                        }}
                      />
                    </label>
                  </div>
                  <figcaption>{slot.label}</figcaption>
                </figure>
              );
            })}
          </div>
        </div>

        <div className="services-cta">
          <p>¿Quieres ver el catálogo o pedir orientación por WhatsApp?</p>
          <div className="services-actions">
            <button type="button" className="btn btn-pill" onClick={() => onOpenCatalog?.("Todos")}>
              Ver catálogo
            </button>
            <a className="btn btn-ghost" href="#contacto">
              Escríbenos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
