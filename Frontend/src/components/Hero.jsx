import { useEffect, useRef, useState } from "react";

const SLIDES = [
  {
    src: "/carrusel/nube.jpg",
    alt: "Crema corporal Natura Tododia, fresa y vainilla dorada",
  },
  {
    src: "/carrusel/ambar.jpg",
    alt: "Crema corporal Natura Tododia, avellana y casis",
  },
  {
    src: "/carrusel/bruma.jpg",
    alt: "Crema corporal Natura Tododia, té de manzanilla y lavanda",
  },
  {
    src: "/carrusel/lino.jpg",
    alt: "Crema corporal Natura Ekos Maracuyá, antiestrés",
  },
  {
    src: "/carrusel/equilibrio.jpg",
    alt: "Crema hidratante para las manos Natura Ekos Castanha",
  },
];

const INTERVAL = 4500;

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [extended, setExtended] = useState(false);
  const scrollY = useRef(0);
  const hold = useRef(0);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timeoutId = window.setTimeout(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, INTERVAL);
    return () => window.clearTimeout(timeoutId);
  }, [index, paused]);

  useEffect(() => {
    scrollY.current = window.scrollY;
    function onScroll() {
      const y = window.scrollY;
      if (Date.now() > hold.current && y < scrollY.current - 8) setExtended(false);
      scrollY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function extend(event) {
    if (event.target.closest("a, button")) return;
    hold.current = Date.now() + 700;
    setExtended(true);
  }

  return (
    <section
      id="inicio"
      className={extended ? "hero is-extended" : "hero"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={extend}
    >
      <div className="hero-card">
        <div className="hero-copy">
          <p className="hero-kicker">Cuida tu belleza,</p>
          <h1>
            <span className="hero-script">realza tu esencia</span>
            <svg className="hero-heart" viewBox="0 0 32 32" aria-hidden="true">
              <path
                d="M16 27s-8.2-5.1-11-10C3.2 13.2 4.4 8.8 8.2 8c2.6-.6 4.6.8 5.8 2.8 1.2-2 3.2-3.4 5.8-2.8 3.8.8 5 5.2 3.2 9-2.8 4.9-7 10-7 10Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </h1>
          <p className="lede">
            Cremas, perfumes, desodorantes y mucho más,
            <br />
            todo en un solo lugar.
          </p>
          <a className="btn btn-pill" href="#catalogo">
            Explora ahora <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="hero-frame">
          {SLIDES.map((slide, slideIndex) => (
            <img
              key={slide.src}
              className={slideIndex === index ? "hero-photo is-active" : "hero-photo"}
              src={slide.src}
              alt={slideIndex === index ? slide.alt : ""}
              aria-hidden={slideIndex === index ? undefined : true}
            />
          ))}
        </div>
        <div className="hero-dots" role="tablist" aria-label="Cremas Natura">
          {SLIDES.map((slide, slideIndex) => (
            <button
              key={slide.src}
              type="button"
              role="tab"
              className={slideIndex === index ? "is-active" : undefined}
              aria-label={slide.alt}
              aria-selected={slideIndex === index}
              onClick={() => setIndex(slideIndex)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
