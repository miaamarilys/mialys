import {
  LeafIcon,
  HeartIcon,
  WhatsAppIcon,
  ShieldIcon,
  TruckIcon,
  StoreIcon
} from "./Icons.jsx";
import { whatsappLink } from "../data/products.js";

export default function About({ onClose }) {
  return (
    <div className="about-grid-clean">
      <div className="about-left-col">
        <p className="eyebrow">Sobre Nosotros</p>
        <h2 className="about-clean-title">Cuidado lento, fórmulas honestas.</h2>

        <p className="about-statement">
          &ldquo;La piel no necesita diez pasos, necesita texturas botánicas que reconozca y nutran su barrera natural.&rdquo;
        </p>

        <div className="about-inline-hallmarks">
          <span>
            <ShieldIcon size={14} /> 100% Original
          </span>
          <span className="hallmark-sep">•</span>
          <span>
            <HeartIcon size={14} /> Cruelty-Free
          </span>
          <span className="hallmark-sep">•</span>
          <span>
            <TruckIcon size={14} /> Envíos a todo Ecuador
          </span>
        </div>
      </div>

      <div className="about-right-col">
        <p className="about-text-lead">
          Mialys Skin nace de una idea sencilla: la piel no necesita diez pasos, necesita
          texturas que reconozca. Formulamos cremas, bálsamos y leches limpiadoras en
          lotes pequeños, con ingredientes botánicos y sin pruebas en animales.
        </p>
        <p className="about-text-sub">
          Cada producto indica el tipo de piel para el que fue pensado. Si tu piel cambia
          con el clima o el día, el catálogo está ordenado para que elijas sin adivinar.
        </p>

        <ul className="about-editorial-points">
          <li>
            <StoreIcon size={17} className="editorial-ico" />
            <div>
              <strong>La marca:</strong>{" "}
              <span>Rituales de rostro con envíos seguros a todo el país.</span>
            </div>
          </li>
          <li>
            <LeafIcon size={17} className="editorial-ico" />
            <div>
              <strong>La fórmula:</strong>{" "}
              <span>Botánica, cruelty-free y revisada para el uso diario.</span>
            </div>
          </li>
          <li>
            <WhatsAppIcon size={17} className="editorial-ico is-wa" />
            <div>
              <strong>La atención:</strong>{" "}
              <span>Te orientamos por el formulario o directo por WhatsApp.</span>
            </div>
          </li>
        </ul>

        <div className="about-clean-actions">
          <a
            className="btn btn-about-wa"
            href={whatsappLink("Hola Mialys Skin, leí sobre su marca y me gustaría asesoría.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon size={16} />
            <span>Asesoría por WhatsApp</span>
          </a>
          {onClose && (
            <button type="button" className="btn-about-dismiss" onClick={onClose}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
