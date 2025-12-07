import tkinter as tk 
from tkinter import ttk, messagebox
from tkinter.scrolledtext import ScrolledText
from agente_domotico import agentePercepciones, acciones

def opciones_por_posicion(desde_acciones: dict) -> list[list[str]]:
    slots = [set(), set(), set()]
    for k in desde_acciones.keys():
        p = k.split(',')
        if len(p) == 3:
            for i in range(3):
                slots[i].add(p[i])
    return [sorted(list(s)) for s in slots]

TITULOS = ["👤 Presencia", "🕒 Tiempo", "🌡️ Temperatura"]

TOKEN_ICON = {
    # Presencia
    "presencia_humana" : "🧍 presencia_humana",
    "sin_presencia"    : "🌫️ sin_presencia",

    # Tiempo
    "es_de_dia"        : "🌞 es_de_dia",
    "es_de_noche"      : "🌙 es_de_noche",

    # Temperatura
    "temperatura_baja"   : "❄️ temperatura_baja",
    "temperatura_media"  : "🌤️ temperatura_media",
    "temperatura_alta"   : "🔥 temperatura_alta",
}

class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("🏠 Casa Domótica — Agente (percepciones → acción)")
        self.geometry("920x600")
        self.minsize(880, 560)

        BG_APP   = "#F3F4F6"
        BG_CARD  = "#FFFFFF"
        TXT_MAIN = "#111827"
        TXT_MUTE = "#6B7280"
        ACCENT   = "#2563EB"
        ACCENT_2 = "#1E40AF"

        self.configure(bg=BG_APP)
        self.style = ttk.Style()
        self.style.theme_use("clam")

        hero = tk.Frame(self, bg=ACCENT, height=60)
        hero.pack(fill="x")
        tk.Label(hero, text="🏠 Casa Domótica — Agente de Percepciones",
                 bg=ACCENT, fg="white", font=("Segoe UI Semibold", 14)
                 ).pack(padx=16, pady=12, anchor="w")
        tk.Label(hero, text="Elige una opción en cada grupo y pulsa ENVIAR. ( En un ambiente real, estas percepciones serían sensores en la casa domotica. )",
                 bg=ACCENT, fg="#E5E7EB", font=("Segoe UI", 10)
                 ).pack(padx=16, anchor="w")

        self.style.configure("Card.TLabelframe", background=BG_CARD, borderwidth=1, relief="solid")
        self.style.configure("Card.TLabelframe.Label", background=BG_CARD, foreground=TXT_MAIN, font=("Segoe UI", 10, "bold"))
        self.style.configure("Card.TFrame", background=BG_CARD)
        self.style.configure("TLabel", background=BG_APP, foreground=TXT_MAIN)
        self.style.configure("Muted.TLabel", background=BG_CARD, foreground=TXT_MUTE)
        self.style.configure("TButton", font=("Segoe UI", 10, "bold"), padding=6)
        self.style.map("TButton", background=[("active", ACCENT_2)], foreground=[("active", "white")])

        self.agente   = agentePercepciones(acciones)
        self.opciones = opciones_por_posicion(acciones)
        self.vars     = [tk.StringVar(value="") for _ in range(3)]

        wrapper = ttk.Frame(self, style="Card.TFrame", padding=12)
        wrapper.pack(fill="both", expand=True, padx=12, pady=12)

        left = ttk.Frame(wrapper, style="Card.TFrame")
        left.pack(side="left", fill="both", expand=True, padx=(0,10))

        right = ttk.Frame(wrapper, style="Card.TFrame")
        right.pack(side="right", fill="both", expand=True)

        grid = ttk.Frame(left, style="Card.TFrame")
        grid.pack(fill="both", expand=True)

        for i in range(3):
            card = ttk.Labelframe(grid, text=TITULOS[i], style="Card.TLabelframe", padding=10)

            if i < 2:
                card.grid(row=0, column=i, padx=8, pady=8, sticky="nsew")
                grid.grid_columnconfigure(i, weight=1)
            else:
                card.grid(row=1, column=0, columnspan=2, padx=8, pady=8, sticky="nsew")
                grid.grid_columnconfigure(0, weight=1)
                grid.grid_columnconfigure(1, weight=1)

            for j, token in enumerate(self.opciones[i]):
                label_text = TOKEN_ICON.get(token, token)
                ttk.Radiobutton(card, text=label_text, value=token, variable=self.vars[i])\
                    .grid(row=j, column=0, sticky="w", padx=6, pady=4)

            if self.opciones[i]:
                self.vars[i].set(self.opciones[i][0])

        btns = ttk.Frame(left, style="Card.TFrame")
        btns.pack(fill="x", pady=(6,0))
        ttk.Button(btns, text="🚀 ENVIAR", command=self.enviar).pack(side="left", ipadx=12)
        ttk.Button(btns, text="↺ Reiniciar", command=self.reiniciar).pack(side="left", padx=8, ipadx=10)

        panel = ttk.Labelframe(right, text="📤 Salida del agente", style="Card.TLabelframe", padding=10)
        panel.pack(fill="both", expand=True)

        ttk.Label(panel, text="Secuencia enviada:", style="Muted.TLabel").pack(anchor="w")
        self.var_seq = tk.StringVar(value="(vacío)")
        tk.Label(panel, textvariable=self.var_seq, bg=BG_CARD, fg=TXT_MAIN, wraplength=360, justify="left")\
            .pack(fill="x", pady=(0,8))

        self.log = ScrolledText(panel, height=18, wrap="word", background="#F9FAFB",
                                foreground=TXT_MAIN, relief="flat")
        self.log.pack(fill="both", expand=True)
        self.log.insert("end", "— aquí verás la respuesta literal del agente —\n")
        self.log.tag_configure("ok",     foreground="#065F46")
        self.log.tag_configure("warn",   foreground="#B45309")
        self.log.tag_configure("danger", foreground="#991B1B")
        self.log.tag_configure("muted",  foreground=TXT_MUTE)

        tk.Label(self, text="La UI no decide; solo arma la secuencia y muestra la respuesta del agente.",
                 bg=BG_APP, fg=TXT_MUTE, font=("Segoe UI", 9)).pack(pady=(0,8))

    def reiniciar(self):
        for i in range(3):
            if self.opciones[i]:
                self.vars[i].set(self.opciones[i][0])
            else:
                self.vars[i].set("")
        self.var_seq.set("(vacío)")
        self.log.delete("1.0", "end")
        self.log.insert("end", "— reiniciado —\n", ("muted",))

    def enviar(self):
        faltan = [TITULOS[i] for i in range(3) if not self.vars[i].get()]
        if faltan:
            messagebox.showerror("Faltan selecciones", "Selecciona una opción en: " + ", ".join(faltan))
            return

        seq = ",".join(v.get() for v in self.vars)
        self.var_seq.set(seq)
        out = self.agente.actuar(seq, "reiniciar")

        tag = "ok"
        if "reiniciar" in out.lower():
            tag = "danger"
        elif "bajar_persianas" in out or "cerrar" in out:
            tag = "warn"

        self.log.insert("end", f"→ agente: {out}\n", (tag,))
        self.log.see("end")

if __name__ == "__main__":
    App().mainloop()
