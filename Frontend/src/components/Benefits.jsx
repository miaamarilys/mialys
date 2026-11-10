const BENEFITS = [
  {
    id: "beneficio-naturales",
    title: "Ingredientes Naturales",
    text: "Extractos botánicos elegidos por su textura y suavidad, sin rellenos de más.",
    images: [
      ["/beneficios/natural-flores.jpg?v=3", "Aceite botánico con manzanilla y romero"],
      ["/beneficios/natural-aloe.jpg?v=3", "Hojas de aloe vera recién cortadas"],
      ["/beneficios/natural-karite.jpg?v=3", "Manteca de karité con avena y nueces de karité"],
    ],
  },
  {
    id: "beneficio-cruelty",
    title: "Cruelty-Free",
    text: "Ninguna fórmula se prueba en animales. Cuidado consciente, de principio a fin.",
    images: [["/beneficios/cruelty-free.jpg?v=3", "Conejo junto a un frasco y lavanda"]],
  },
  {
    id: "beneficio-derma",
    title: "Probado Dermatológicamente",
    text: "Texturas evaluadas para el uso diario, incluso en pieles reactivas.",
    images: [["/beneficios/dermatologico.jpg?v=3", "Prueba de crema sobre la piel de la mano"]],
  },
  {
    id: "beneficio-envios",
    title: "Envíos a todo el país",
    text: "Llevamos tu ritual a cualquier ciudad, con empaque pensado para el viaje.",
    images: [["/beneficios/envios.jpg?v=3", "Caja de envío de cartón con cremas y perfume"]],
  },
];

export default function Benefits() {
  return (
    <section className="benefits" aria-labelledby="benefits-title">
      <div className="wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">Beneficios</p>
            <h2 id="benefits-title">Un cuidado simple, con criterio.</h2>
          </div>
        </div>
        <div className="benefit-grid">
          {BENEFITS.map(({ id, title, text, images }, index) => (
            <article className="benefit-card" key={id}>
              <div className={images.length > 1 ? "benefit-photo is-collage" : "benefit-photo"}>
                {images.map(([src, alt]) => (
                  <img key={src} src={src} alt={alt} loading="lazy" />
                ))}
              </div>
              <span className="benefit-index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
