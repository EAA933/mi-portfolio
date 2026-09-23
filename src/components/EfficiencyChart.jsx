import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";

/**
 * Tooltip personalizado con estética Aeroespacial / Dark HUD
 */
const CustomTooltip = ({ active, payload, label, unidad, acento }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div
      style={{
        background: "rgba(10, 14, 23, 0.95)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${acento || "#38bdf8"}`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px ${acento || "#38bdf8"}33`,
        borderRadius: "10px",
        padding: "12px 16px",
        color: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        maxWidth: "290px",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
          paddingBottom: "6px",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "14px", color: "#ffffff" }}>
          {label}
        </span>
        <span
          style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: acento || "#38bdf8",
            background: `${acento || "#38bdf8"}18`,
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          {data.ahorro}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#94a3b8" }}>• Proceso Anterior:</span>
          <span style={{ fontWeight: 600, color: "#cbd5e1" }}>
            {data.antes} {unidad}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: acento || "#38bdf8" }}>
            • Con Solución:
          </span>
          <span style={{ fontWeight: 700, color: "#ffffff" }}>
            {data.conSolucion} {unidad}
          </span>
        </div>
      </div>

      {data.detalle && (
        <div
          style={{
            marginTop: "8px",
            paddingTop: "6px",
            borderTop: "1px dashed rgba(255, 255, 255, 0.1)",
            color: "#94a3b8",
            fontSize: "11.5px",
            lineHeight: 1.4,
          }}
        >
          💡 {data.detalle}
        </div>
      )}
    </div>
  );
};

export function EfficiencyChartComponent({ proyecto }) {
  const [modo, setModo] = useState("tiempo"); // "tiempo" | "costos"
  const acento = proyecto.planeta?.acento || "#38bdf8";
  const ef = proyecto.eficiencia;

  if (!ef) return null;

  const datosActuales = modo === "tiempo" ? ef.comparativas.tiempo : ef.comparativas.costos;
  const unidad = modo === "tiempo" ? "hrs/mes" : "USD/mes";

  return (
    <div className="eficiencia-panel">
      <div className="ef-header">
        <div className="ef-titulos">
          <div className="ef-tag">
            <span className="ef-pulso" style={{ background: acento }}></span>
            Métricas de Impacto
          </div>
          <h4>Eficiencia Operativa Ganada</h4>
          <p className="ef-desc">
            Pasa el cursor sobre cada columna para ver el desglose del ahorro en tiempo y costos.
          </p>
        </div>

        {/* Selector interactivo de dimensión: Tiempo vs Costos */}
        <div className="ef-selector">
          <button
            type="button"
            className={`ef-tab ${modo === "tiempo" ? "activo" : ""}`}
            style={{ "--tab-acc": acento }}
            onClick={() => setModo("tiempo")}
          >
            ⏱️ Tiempo
          </button>
          <button
            type="button"
            className={`ef-tab ${modo === "costos" ? "activo" : ""}`}
            style={{ "--tab-acc": acento }}
            onClick={() => setModo("costos")}
          >
            💰 Costos ($)
          </button>
        </div>
      </div>

      {/* Gráfico Recharts Interactivo */}
      <div className="ef-chart-wrap" style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datosActuales}
            margin={{ top: 18, right: 12, left: -16, bottom: 24 }}
            barGap={6}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.07)" vertical={false} />
            <XAxis
              dataKey="concepto"
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              interval={0}
              tickFormatter={(v) => (v.length > 14 ? v.slice(0, 13) + "…" : v)}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
            />
            <Tooltip
              content={<CustomTooltip unidad={unidad} acento={acento} />}
              cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: "10px", fontSize: "12px", color: "#cbd5e1" }}
              formatter={(value) => (
                <span style={{ color: "#cbd5e1", fontSize: "12px" }}>
                  {value === "antes" ? "Antes (Proceso manual)" : "Con Solución"}
                </span>
              )}
            />
            <Bar
              dataKey="antes"
              name="antes"
              fill="#475569"
              radius={[4, 4, 0, 0]}
              maxBarSize={38}
            />
            <Bar
              dataKey="conSolucion"
              name="conSolucion"
              fill={acento}
              radius={[4, 4, 0, 0]}
              maxBarSize={38}
            >
              {datosActuales.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={acento}
                  style={{
                    filter: `drop-shadow(0 0 6px ${acento}66)`,
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Resumen de KPIs de negocio */}
      <div className="ef-kpis">
        <div className="ef-kpi">
          <span className="ef-kpi-val" style={{ color: acento }}>
            {ef.resumen.porcentaje}
          </span>
          <span className="ef-kpi-lbl">Optimización Lograda</span>
        </div>
        <div className="ef-kpi">
          <span className="ef-kpi-val" style={{ color: "#ffffff" }}>
            {ef.resumen.tiempo}
          </span>
          <span className="ef-kpi-lbl">Tiempo Acelerado</span>
        </div>
        <div className="ef-kpi">
          <span className="ef-kpi-val" style={{ color: "#34d399" }}>
            {ef.resumen.impacto}
          </span>
          <span className="ef-kpi-lbl">Impacto Anual Proyectado</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Función helper para montar el gráfico React en un contenedor DOM vanilla
 */
export function montarGraficoEficiencia(contenedor, proyecto) {
  if (!contenedor || !proyecto || !proyecto.eficiencia) return null;
  const root = createRoot(contenedor);
  root.render(<EfficiencyChartComponent proyecto={proyecto} />);
  return root;
}
