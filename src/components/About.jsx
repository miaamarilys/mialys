export default function About() {
  return (
    <div className="about-grid">
      <div>
        <p className="eyebrow">Sobre Nosotros</p>
        <h2>Cuidado lento, fórmulas honestas.</h2>
      </div>
      <div className="about-copy">
        <p>
          Mialys Skin nace de una idea sencilla: la piel no necesita diez pasos, necesita
          texturas que reconozca. Formulamos cremas, bálsamos y leches limpiadoras en
          lotes pequeños, con ingredientes botánicos y sin pruebas en animales.
        </p>
        <p>
          Cada producto indica el tipo de piel para el que fue pensado. Si tu piel cambia
          con el clima o el día, el catálogo está ordenado para que elijas sin adivinar.
        </p>
        <ul className="about-points">
          <li>
            <strong>La marca</strong>
            <span>Rituales de rostro hechos en Colombia, con envíos a todo el país.</span>
          </li>
          <li>
            <strong>La fórmula</strong>
            <span>Botánica, cruelty-free y revisada para el uso diario.</span>
          </li>
          <li>
            <strong>La atención</strong>
            <span>Te orientamos por el formulario o directo por WhatsApp.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
