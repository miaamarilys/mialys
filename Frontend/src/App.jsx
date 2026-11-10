import { useCallback, useEffect, useState } from "react";
import Benefits from "./components/Benefits.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import CategoryModal from "./components/CategoryModal.jsx";
import Catalog from "./components/Catalog.jsx";
import Contact from "./components/Contact.jsx";
import Featured from "./components/Featured.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import InfoModal from "./components/InfoModal.jsx";
import Services from "./components/Services.jsx";

const CATALOG_CATEGORIES = ["Cremas", "Perfumes", "Desodorantes", "Maquillaje", "Capilar", "Skincare", "Sets"];

function categoryFromUrl() {
  const value = new URLSearchParams(window.location.search).get("categoria");
  return CATALOG_CATEGORIES.includes(value) ? value : "Todos";
}

export default function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [category] = useState(categoryFromUrl);
  const [standalone] = useState(() => categoryFromUrl() !== "Todos");
  const [modalCategory, setModalCategory] = useState(null);
  const [infoType, setInfoType] = useState(null);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    if (!notice) return undefined;
    const timeoutId = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...current, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
    setNotice(`${product.name} se añadió al carrito`);
  }

  function updateQty(id, qty) {
    setCart((current) =>
      qty <= 0
        ? current.filter((item) => item.id !== id)
        : current.map((item) => (item.id === id ? { ...item, qty } : item))
    );
  }

  const closeCart = useCallback(() => setCartOpen(false), []);
  const closeModal = useCallback(() => setModalCategory(null), []);
  const closeInfo = useCallback(() => setInfoType(null), []);

  return (
    <>
      <Header
        count={count}
        onOpenModal={setModalCategory}
        onOpenInfo={setInfoType}
        onNavigate={closeModal}
        catalogOpen={Boolean(modalCategory)}
        aboutOpen={infoType === "nosotros"}
        onOpenCart={() => setCartOpen(true)}
        linkBase={standalone ? "/" : ""}
      />
      {standalone ? (
        <main>
          <Catalog onAdd={addToCart} category={category} />
        </main>
      ) : (
        <main>
          <Hero />
          <Featured onAdd={addToCart} />
          <Benefits />
          <Services onOpenCatalog={setModalCategory} />
          <Contact />
        </main>
      )}
      <Footer onOpenInfo={setInfoType} onOpenCatalog={setModalCategory} />
      <CategoryModal category={modalCategory} onClose={closeModal} onAdd={addToCart} onOpenInfo={setInfoType} />
      <InfoModal type={infoType} onClose={closeInfo} cart={cart} />
      <CartDrawer open={cartOpen} items={cart} onClose={closeCart} onQty={updateQty} />
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
    </>
  );
}
