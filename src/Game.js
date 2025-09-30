// src/Game.jsx
import { useEffect, useState } from "react";

const ROOMS = {
  lobby: {
    name: "Saguão",
    img: "img/hospital-lobby.jpg",
    hotspots: [
      { id: "triage", x: "8%",  y: "60%", w: "18%", h: "20%", label: "Ir para Triagem" },
      { id: "pharmacy", x: "72%", y: "58%", w: "18%", h: "22%", label: "Ir para Farmácia" },
    ],
  },
  triage: {
    name: "Triagem",
    img: "/room-triage.png",
    hotspots: [
      { id: "lobby", x: "5%", y: "80%", w: "18%", h: "15%", label: "Voltar ao Saguão" },
      { id: "item-kit", x: "62%", y: "42%", w: "10%", h: "14%", label: "Coletar Kit", item: "kit" },
    ],
  },
  pharmacy: {
    name: "Farmácia",
    img: "/room-pharmacy.png",
    hotspots: [
      { id: "lobby", x: "5%", y: "80%", w: "18%", h: "15%", label: "Voltar ao Saguão" },
      { id: "item-seringue", x: "46%", y: "40%", w: "10%", h: "14%", label: "Coletar Seringa", item: "seringue" },
      { id: "item-key", x: "70%", y: "62%", w: "10%", h: "14%", label: "Coletar Chave", item: "key" },
    ],
  },
};

const ITEM_META = {
  kit: { name: "Kit Médico", icon: "/item-kit.png" },
  seringue: { name: "Seringa", icon: "/item-seringue.png" },
  key: { name: "Chave", icon: "/item-key.png" },
};

export default function Game({ isTurnOn = true }) {
  const [room, setRoom] = useState("lobby");
  const [inventory, setInventory] = useState([]);

  function collect(itemId) {
    if (!ITEM_META[itemId]) return;
    if (!isTurnOn) {
      alert("Inicie o turno para coletar itens.");
      return;
    }
    if (inventory.some(i => i.id === itemId)) return;
    setInventory(prev => [...prev, { id: itemId, ...ITEM_META[itemId] }]);
  }

  const current = ROOMS[room];

  // placeholders caso não tenha imagens
  const hasImage = (src) => typeof window !== "undefined" && !!document.querySelector(`img[src="${src}"]`);

  return (
    <div className="panel" style={{ width: "100%", maxWidth: 960, margin: "12px auto" }}>
      <h3 style={{ marginTop: 0 }}>{current.name}</h3>

      <div className="hotspots" style={{ position: "relative", display: "inline-block" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="room" src={current.img} alt={current.name}
             onError={(e)=>{ e.currentTarget.src='/hospital-lobby.png'; }}
        />
        {current.hotspots.map(h => (
          <button
            key={h.id}
            className="hotspot"
            title={h.label}
            style={{
              position: "absolute",
              left: h.x, top: h.y, width: h.w, height: h.h,
              background: "transparent", border: "2px dashed rgba(108,192,255,0.6)", borderRadius: 10
            }}
            onClick={() => h.item ? collect(h.item) : setRoom(h.id)}
          />
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        {room !== "lobby" && <button onClick={() => setRoom("lobby")}>← Voltar ao saguão</button>}
        <span className="tag">Salas: Lobby • Triagem • Farmácia</span>
      </div>

      <div className="panel" style={{ marginTop: 12 }}>
        <h4 style={{ margin: "0 0 8px" }}>Inventário</h4>
        {inventory.length === 0 ? (
          <div style={{ opacity: 0.7 }}>Nenhum item coletado</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {inventory.map(it => (
              <div key={it.id} className="panel" style={{ padding: 8, textAlign: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.icon} alt={it.name} style={{ width: 48, height: 48, imageRendering: "pixelated" }}
                     onError={(e)=>{ e.currentTarget.src='/item-kit.png'; }}
                />
                <div style={{ fontSize: 12, marginTop: 6 }}>{it.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
