const clientIdInput = document.getElementById("client-id");
const intervaloInput = document.getElementById("intervalo");
const listaEstados = document.getElementById("lista-estados");
const emptyHint = document.getElementById("empty-hint");
const btnAdd = document.getElementById("btn-add-estado");
const btnGuardar = document.getElementById("btn-guardar");
const saveStatus = document.getElementById("save-status");
const tplEstado = document.getElementById("tpl-estado");

let estados = [];

// ---------- Carga inicial ----------

async function cargarConfig() {
  const res = await fetch("/api/config");
  const data = await res.json();

  clientIdInput.value = data.client_id || "";
  intervaloInput.value = data.intervalo_cambio || 60;
  estados = Array.isArray(data.estados) ? data.estados : [];

  renderEstados();
}

// ---------- Render ----------

function renderEstados() {
  listaEstados.innerHTML = "";
  emptyHint.style.display = estados.length === 0 ? "block" : "none";

  estados.forEach((estado, index) => {
    const nodo = tplEstado.content.cloneNode(true);
    const card = nodo.querySelector(".estado-card");

    card.querySelector(".estado-numero").textContent = `Estado ${index + 1}`;

    card.querySelectorAll("[data-campo]").forEach((input) => {
      const campo = input.dataset.campo;
      input.value = estado[campo] || "";
      input.addEventListener("input", () => {
        estados[index][campo] = input.value;
        marcarSinGuardar();
      });
    });

    card.querySelector(".btn-borrar").addEventListener("click", () => {
      estados.splice(index, 1);
      renderEstados();
      marcarSinGuardar();
    });

    listaEstados.appendChild(nodo);
  });
}

// ---------- Acciones ----------

btnAdd.addEventListener("click", () => {
  estados.push({
    state: "",
    details: "",
    large_image: "",
    large_text: "",
    small_image: "",
    small_text: "",
  });
  renderEstados();
  marcarSinGuardar();

  // foco automático en el primer campo del estado recién creado
  const cards = listaEstados.querySelectorAll(".estado-card");
  const ultima = cards[cards.length - 1];
  ultima?.querySelector("input")?.focus();
});

clientIdInput.addEventListener("input", marcarSinGuardar);
intervaloInput.addEventListener("input", marcarSinGuardar);

btnGuardar.addEventListener("click", guardarConfig);

async function guardarConfig() {
  const payload = {
    client_id: clientIdInput.value.trim(),
    intervalo_cambio: Number(intervaloInput.value) || 60,
    estados: estados,
  };

  if (!payload.client_id) {
    alert("Falta el Client ID antes de guardar.");
    return;
  }

  btnGuardar.disabled = true;
  btnGuardar.textContent = "Guardando...";

  try {
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error desconocido");
    }

    marcarGuardado();
  } catch (err) {
    alert("No se pudo guardar: " + err.message);
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = "Guardar cambios";
  }
}

// ---------- Estado visual de "guardado" ----------

function marcarSinGuardar() {
  saveStatus.textContent = "cambios sin guardar";
  saveStatus.className = "topbar-status dirty";
}

function marcarGuardado() {
  saveStatus.textContent = "guardado ✓";
  saveStatus.className = "topbar-status saved";
}

cargarConfig();