import {
  LeafIcon,
  HeartIcon,
  SparklesIcon,
  WhatsAppIcon,
  ShieldIcon,
  TruckIcon,
  StoreIcon
} from "./Icons.jsx";
import { whatsappLink } from "../data/products.js";

export default function About({ onClose }) {
  return (
    <div className="about-grid">
      <div className="about-hero-col">
        <span className="about-badge">
          <SparklesIcon size={14} /> Filosofía &amp; Esencia
        </span>
        <h2 className="about-title">Cuidado lento, fórmulas honestas.</h2>

        <div className="about-quote-card">
          <p>
            &ldquo;La belleza consciente nace de escuchar a tu piel y brindarle texturas
            que reconozca, sin pasos innecesarios.&rdquo;
          </p>
        </div>

        <div className="about-stats-row">
          <div className="about-stat-item">
            <ShieldIcon size={15} />
            <span>100% Original</span>
          </div>
          <div className="about-stat-item">
            <HeartIcon size={15} />
            <span>Cruelty-Free</span>
          </div>
          <div className="about-stat-item">
            <TruckIcon size={15} />
            <span>Envíos Ecuador</span>
          </div>
        </div>
      </div>

      <div className="about-copy">
        <p className="about-lead">
          Mialys Skin nace de una idea sencilla: la piel no necesita diez pasos, necesita
          texturas que reconozca. Formulamos cremas, bálsamos y leches limpiadoras en
          lotes pequeños, con ingredientes botánicos y sin pruebas en animales.
        </p>
        <p className="about-subtext">
          Cada producto indica el tipo de piel para el que fue pensado. Si tu piel cambia
          con el clima o el día, el catálogo está ordenado para que elijas sin adivinar.
        </p>

        <div className="about-cards-list">
          <div className="about-card-item">
            <div className="about-icon-box">
              <StoreIcon size={18} />
            </div>
            <div className="about-card-text">
              <strong>La marca</strong>
              <span>Rituales de belleza y cuidado facial con envíos seguros a todo el país.</span>
            </div>
          </div>

          <div className="about-card-item">
            <div className="about-icon-box">
              <LeafIcon size={18} />
            </div>
            <div className="about-card-text">
              <strong>La fórmula</strong>
              <span>Botánica, cruelty-free y revisada rigurosamente para el uso diario.</span>
            </div>
          </div>

          <div className="about-card-item">
            <div className="about-icon-box is-green">
              <WhatsAppIcon size={18} />
            </div>
            <div className="about-card-text">
              <strong>La atención</strong>
              <span>Te orientamos por el formulario o directo por WhatsApp.</span>
            </div>
          </div>
        </div>

        <div className="about-actions-row">
          <a
            className="btn btn-about-whatsapp"
            href={whatsappLink("Hola Mialys Skin, leí sobre su marca y me gustaría recibir asesoría personalizada.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={16} />
            <span>Asesoría por WhatsApp</span>
          </a>
          {onClose && (
            <button type="button" className="btn btn-about-close" onClick={onClose}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
