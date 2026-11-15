import { useCallback, useEffect, useState } from "react";
import Benefits from "./components/Benefits.jsx";
import PortalEmpresarial from "./components/PortalEmpresarial.jsx";
import CardPaymentModal from "./components/CardPaymentModal.jsx";
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
  const [cardPayOpen, setCardPayOpen] = useState(false);
  const [cartSummary, setCartSummary] = useState(null);
  const [businessOpen, setBusinessOpen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("admin") === "true" || window.location.hash === "#empresarial";
  });
  const [notice, setNotice] = useState("");
  const [category] = useState(categoryFromUrl);
  const [standalone] = useState(() => categoryFromUrl() !== "Todos");
  const [modalCategory, setModalCategory] = useState(null);
  const [searchProductId, setSearchProductId] = useState(null);
  const [infoType, setInfoType] = useState(null);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    if (!notice) return undefined;
    const timeoutId = window.setTimeout(() => setNotice(""), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  function addToCart(product) {
    if (product.stock === 0) {
      setNotice(`El producto ${product.name} se encuentra agotado`);
      return;
    }
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        if (product.stock && existing.qty >= product.stock) {
          setNotice(`Máximo stock disponible alcanzado (${product.stock} unidades)`);
          return current;
        }
        return current.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...current, { id: product.id, name: product.name, price: product.price, qty: 1, stock: product.stock }];
    });
    setNotice(`${product.name} se añadió al carrito`);
  }

  function updateQty(id, qty) {
    setCart((current) => {
      if (qty <= 0) return current.filter((item) => item.id !== id);
      return current.map((item) => {
        if (item.id !== id) return item;
        if (item.stock && qty > item.stock) {
          setNotice(`Solo hay ${item.stock} unidades disponibles de este producto`);
          return { ...item, qty: item.stock };
        }
        return { ...item, qty };
      });
    });
  }

  function handlePaymentSuccess(order) {
    setCart([]); // Desmarca todos los productos del catálogo
    setCartSummary(null);
    setNotice(`¡Pago exitoso! Pedido #${order.id} registrado para envío`);
  }

  function handleSelectProduct(product) {
    setSearchProductId(product.id);
    setModalCategory(product.category || "Todos");
  }

  function handleOpenCardPay(summary) {
    setCartSummary(summary || null);
    setCardPayOpen(true);
  }

  const closeCart = useCallback(() => setCartOpen(false), []);
  const closeModal = useCallback(() => {
    setModalCategory(null);
    setSearchProductId(null);
  }, []);
  const closeInfo = useCallback(() => setInfoType(null), []);

  const handleOpenBusiness = useCallback(() => {
    window.history.pushState(null, "", "?admin=true");
    setBusinessOpen(true);
  }, []);

  const handleCloseBusiness = useCallback(() => {
    window.history.pushState(null, "", window.location.pathname);
    setBusinessOpen(false);
  }, []);

  // SI ESTÁ ACTIVO EL PORTAL EMPRESARIAL, RENDERIZA LA PÁGINA COMPLETA
  if (businessOpen) {
    return <PortalEmpresarial onBackToStore={handleCloseBusiness} />;
  }

  return (
    <>
      <Header
        count={count}
        onOpenModal={(cat) => {
          setSearchProductId(null);
          setModalCategory(cat);
        }}
        onSelectProduct={handleSelectProduct}
        onOpenInfo={setInfoType}
        onOpenBusiness={handleOpenBusiness}
        onNavigate={closeModal}
        catalogOpen={Boolean(modalCategory)}
        aboutOpen={infoType === "nosotros"}
        businessOpen={businessOpen}
        onOpenCart={() => setCartOpen(true)}
        linkBase={standalone ? "/" : ""}
      />
      {standalone ? (
        <main>
          <Catalog
            onAdd={addToCart}
            category={category}
            cart={cart}
            onUpdateQty={updateQty}
            initialProductId={searchProductId}
          />
        </main>
      ) : (
        <main>
          <Hero />
          <Featured
            onAdd={addToCart}
            onOpenCatalog={setModalCategory}
            onSelectProduct={handleSelectProduct}
          />
          <Benefits />
          <Services onOpenCatalog={setModalCategory} />
          <Contact />
        </main>
      )}
      <Footer onOpenInfo={setInfoType} onOpenCatalog={setModalCategory} />
      <CategoryModal
        category={modalCategory}
        onClose={closeModal}
        onAdd={addToCart}
        onOpenInfo={setInfoType}
        cart={cart}
        onUpdateQty={updateQty}
        initialProductId={searchProductId}
      />
      <InfoModal type={infoType} onClose={closeInfo} cart={cart} />
      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={closeCart}
        onQty={updateQty}
        onOpenCardPay={handleOpenCardPay}
      />
      <CardPaymentModal
        open={cardPayOpen}
        items={cart}
        summary={cartSummary}
        onClose={() => setCardPayOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
    </>
  );
}
