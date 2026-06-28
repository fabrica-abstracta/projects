import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Providers } from "./core/context/provider";
import { Home } from "./app/home/home";
import { Dashboard } from "./app/dashboard/dashboard";
import { Products } from "./app/product/product";
import { ProductExpirations } from "./app/product/product-expiration";
import { ProductPointOfSale } from "./app/product/point-sale";
import { Plans } from "./app/plans/plan";
import { Clients } from "./app/customer/customer";
import { Attendances } from "./app/attendance/attendance";
import { Memberships } from "./app/membership/membership";
import { Sales } from "./app/sale/sale";
import { Users } from "./app/user/user";
import { Roles } from "./app/permission/permission";
import { Settings } from "./app/settings/settings";
import { Layout } from "./core/components/layout";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Providers>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route element={<Layout />}>
            <Route path="/resumen" element={<Dashboard />} />
            <Route path="/productos" element={<Products />} />
            <Route path="/vencimientos" element={<ProductExpirations />} />
            <Route path="/punto-venta" element={<ProductPointOfSale />} />
            <Route path="/planes" element={<Plans />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/asistencias" element={<Attendances />} />
            <Route path="/membresias" element={<Memberships />} />
            <Route path="/ventas" element={<Sales />} />
            <Route path="/usuarios" element={<Users />} />
            <Route path="/permisos" element={<Roles />} />
            <Route path="/configuraciones" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Providers>
    </BrowserRouter>
  </StrictMode>,
);
