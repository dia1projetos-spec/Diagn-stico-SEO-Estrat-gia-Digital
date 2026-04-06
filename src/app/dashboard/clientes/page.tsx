"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

interface Client { id: string; email: string; name: string; siteUrl: string; createdAt: any; }

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", siteUrl: "" });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const q = query(collection(db, "users"), where("adminId", "==", auth.currentUser!.uid), where("role", "==", "client"));
      const snap = await getDocs(q);
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Client[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async () => {
    if (!form.name || !form.email || !form.password || !form.siteUrl) return;
    setSaving(true);
    try {
      // Create Firebase Auth user for client
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // Save client profile in Firestore
      await addDoc(collection(db, "users"), {
        uid: cred.user.uid,
        name: form.name,
        email: form.email,
        siteUrl: form.siteUrl,
        role: "client",
        adminId: auth.currentUser!.uid,
        createdAt: Timestamp.now(),
      });

      // Create site for client
      await addDoc(collection(db, "sites"), {
        url: form.siteUrl,
        name: form.name,
        ownerId: auth.currentUser!.uid,
        clientId: cred.user.uid,
        searchConsoleConnected: false,
        createdAt: Timestamp.now(),
      });

      setForm({ name: "", email: "", password: "", siteUrl: "" });
      setShowForm(false);
      loadClients();
    } catch (e: any) {
      alert(e.message || "Erro ao cadastrar cliente.");
    } finally {
      setSaving(false);
    }
  };

  const input = (label: string, key: keyof typeof form, type = "text", placeholder = "") => (
    <div>
      <label style={{ display: "block", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "7px" }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))} placeholder={placeholder}
        style={{ width: "100%", padding: "11px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "9px", color: "var(--text-primary)", fontSize: "14px", outline: "none" }}
        onFocus={e => e.target.style.borderColor = "var(--accent)"} onBlur={e => e.target.style.borderColor = "var(--border)"} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "28px", fontWeight: "800", marginBottom: "8px" }}>Clientes</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>Gerencie todos os seus clientes em um só lugar.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: "12px 22px", background: "var(--accent)", border: "none", borderRadius: "10px", color: "#0a0a0f", fontFamily: "var(--font-syne)", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
          + Novo Cliente
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--accent)44", borderRadius: "16px", padding: "28px", marginBottom: "28px", maxWidth: "560px" }}>
          <h3 style={{ fontFamily: "var(--font-syne)", fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>Cadastrar Novo Cliente</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {input("Nome do Cliente / Empresa", "name", "text", "Ex: Zoe Veos")}
            {input("Email de Acesso", "email", "email", "cliente@email.com")}
            {input("Senha de Acesso", "password", "password", "Senha inicial para o cliente")}
            {input("URL do Site", "siteUrl", "url", "https://seusite.com.br")}
            <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
              <button onClick={addClient} disabled={saving}
                style={{ flex: 1, padding: "12px", background: "var(--accent)", border: "none", borderRadius: "9px", color: "#0a0a0f", fontFamily: "var(--font-syne)", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                {saving ? "Cadastrando..." : "Cadastrar Cliente"}
              </button>
              <button onClick={() => setShowForm(false)}
                style={{ padding: "12px 20px", background: "transparent", border: "1px solid var(--border)", borderRadius: "9px", color: "var(--text-secondary)", fontSize: "14px", cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clients list */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>Carregando clientes...</div>
      ) : clients.length === 0 ? (
        <div style={{ background: "var(--bg-card)", border: "1px dashed var(--border)", borderRadius: "16px", padding: "60px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-syne)", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Nenhum cliente ainda</p>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Clique em "+ Novo Cliente" para começar.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {clients.map(client => (
            <div key={client.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "22px", transition: "all 0.2s" }}
              onMouseOver={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"}
              onMouseOut={e => (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-syne)", fontSize: "18px", fontWeight: "800", color: "var(--accent)" }}>
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontFamily: "var(--font-syne)", fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>{client.name}</p>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{client.email}</p>
                </div>
              </div>
              <div style={{ padding: "10px 12px", background: "var(--bg-elevated)", borderRadius: "8px", marginBottom: "14px" }}>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "3px" }}>SITE</p>
                <a href={client.siteUrl} target="_blank" style={{ fontSize: "13px", color: "var(--accent)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                  {client.siteUrl}
                </a>
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                Cadastrado em {client.createdAt?.toDate ? client.createdAt.toDate().toLocaleDateString("pt-BR") : "—"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
