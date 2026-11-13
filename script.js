/* =========================================
   MOOD-CODE V5 | UNIVERSO AURORA
   SCRIPT PRINCIPAL CON LUMI Y SUPABASE
========================================= */

/* 1. CONFIGURACIÓN SUPABASE */

const SUPABASE_URL = "https://qyibarydosjdarlgmuxa.supabase.co";
const SUPABASE_KEY = "sb_publishable_X-aNYHpgbqa2jBFGqOTfGA_RGeZw193";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

/* 2. ELEMENTOS PRINCIPALES */

const authScreen = document.getElementById("authScreen");
const appShell = document.getElementById("appShell");
const authForm = document.getElementById("authForm");
const msg = document.getElementById("login-mensaje");

let modo = "login";
let usuarioActual = null;

/* 3. MENSAJES */

function mostrarMensaje(texto, color = "var(--mint)") {
  if (!msg) return;
  msg.textContent = texto;
  msg.style.color = color;
}

/* 4. MOSTRAR APLICACIÓN */

function mostrarApp(entrar) {
  if (!authScreen || !appShell) return;

  authScreen.classList.toggle("hidden", entrar);
  appShell.classList.toggle("hidden", !entrar);

  if (entrar) {
    const correo = usuarioActual?.email ||
      localStorage.getItem("mood_email") || "";

    const nombre = nombreParaMostrar(correo);

    const correoUno = document.getElementById("correo-usuario");
    const correoDos = document.getElementById("correo-usuario-2");
    const perfilCorreo = document.getElementById("perfilCorreo");
    const nombreUno = document.getElementById("nombre-usuario");
    const nombreDos = document.getElementById("nombre-usuario-2");
    const avatar = document.getElementById("avatarLetra");

    if (correoUno) correoUno.textContent = correo;
    if (correoDos) correoDos.textContent = correo;
    if (perfilCorreo) perfilCorreo.value = correo;
    if (nombreUno) nombreUno.textContent = nombre;
    if (nombreDos) nombreDos.textContent = nombre;
    if (avatar) avatar.textContent = nombre.charAt(0).toUpperCase();

    const perfilNombre = document.getElementById("perfilNombre");
    const perfilMeta = document.getElementById("perfilMeta");
    if (perfilNombre) perfilNombre.value = nombre;
    if (perfilMeta) perfilMeta.value = leerMetaPerfil(correo);

    irAVista("inicio");
  }
}

/* 4b. NOMBRE DE PERFIL (V12): automático por correo y editable */

function nombreParaMostrar(correo) {
  if (!correo) return "Belenhr";
  const guardado = localStorage.getItem("moodcode_nombre_" + correo);
  if (guardado) return guardado;
  const base = correo.split("@")[0].replace(/\d+$/, "");
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function leerMetaPerfil(correo) {
  if (!correo) return "";
  return localStorage.getItem("moodcode_meta_" + correo) || "";
}

function aplicarNombre(nombre) {
  const nombreUno = document.getElementById("nombre-usuario");
  const nombreDos = document.getElementById("nombre-usuario-2");
  const avatar = document.getElementById("avatarLetra");
  const perfilNombre = document.getElementById("perfilNombre");
  if (nombreUno) nombreUno.textContent = nombre;
  if (nombreDos) nombreDos.textContent = nombre;
  if (avatar) avatar.textContent = nombre.charAt(0).toUpperCase();
  if (perfilNombre) perfilNombre.value = nombre;
}

const perfilForm = document.getElementById("perfilForm");
if (perfilForm) {
  perfilForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const correo = usuarioActual?.email || localStorage.getItem("mood_email") || "";
    const inputNombre = document.getElementById("perfilNombre");
    const inputMeta = document.getElementById("perfilMeta");
    const nuevoNombre = (inputNombre?.value || "").trim();
    if (nuevoNombre) {
      if (correo) localStorage.setItem("moodcode_nombre_" + correo, nuevoNombre);
      aplicarNombre(nuevoNombre);
    }
    if (correo && inputMeta) {
      localStorage.setItem("moodcode_meta_" + correo, inputMeta.value.trim());
    }
    mostrarToast("Perfil guardado 💜");
  });
}

/* 5. PESTAÑAS DE ACCESO */

const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const confirmWrap = document.getElementById("confirmPasswordWrap");
const passwordTwo = document.getElementById("login-pass2");
const btnEntrar = document.getElementById("btn-entrar");

if (tabLogin) {
  tabLogin.onclick = () => {
    modo = "login";
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");

    if (confirmWrap) confirmWrap.classList.add("hidden");
    if (passwordTwo) passwordTwo.required = false;
    if (btnEntrar) btnEntrar.textContent = "Entrar ✨";

    mostrarMensaje("");
  };
}

if (tabRegister) {
  tabRegister.onclick = () => {
    modo = "register";
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");

    if (confirmWrap) confirmWrap.classList.remove("hidden");
    if (passwordTwo) passwordTwo.required = true;
    if (btnEntrar) btnEntrar.textContent = "Crear cuenta ✨";

    mostrarMensaje("");
  };
}

/* 6. INICIAR SESIÓN Y REGISTRO */

if (authForm) {
  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-pass").value;

    if (!email || !password) {
      mostrarMensaje("Escribe tu correo y contraseña.", "#f3a9d1");
      return;
    }

    if (password.length < 6) {
      mostrarMensaje("La contraseña debe tener al menos 6 caracteres.", "#f3a9d1");
      return;
    }

    if (modo === "register") {
      const passwordConfirm = document.getElementById("login-pass2").value;

      if (password !== passwordConfirm) {
        mostrarMensaje("Las contraseñas no coinciden.", "#f3a9d1");
        return;
      }
    }

    const boton = document.getElementById("btn-entrar");
    boton.disabled = true;
    boton.textContent = "Un momento...";

    try {
      if (modo === "login") {
        const { data, error } =
          await supabaseClient.auth.signInWithPassword({
            email,
            password
          });

        if (error) throw error;

        usuarioActual = data.user;
        localStorage.setItem("mood_email", email);

        mostrarMensaje("¡Bienvenida a tu universo! ✨");
        mostrarApp(true);

      } else {
        const { data, error } =
          await supabaseClient.auth.signUp({
            email,
            password
          });

        if (error) throw error;

        if (data.session) {
          usuarioActual = data.user;
          localStorage.setItem("mood_email", email);
          mostrarApp(true);
          mostrarMensaje("¡Tu cuenta está lista! 💜");
        } else {
          mostrarMensaje(
            "Cuenta creada. Revisa tu correo para confirmar y después inicia sesión. 💜"
          );
        }
      }

    } catch (error) {
      console.error("Error de autenticación:", error);
      mostrarMensaje("No se pudo entrar: " + error.message, "#f3a9d1");

    } finally {
      boton.disabled = false;
      boton.textContent = modo === "login" ? "Entrar ✨" : "Crear cuenta ✨";
    }
  });
}

/* 7. COMPROBAR SESIÓN */

async function comprobarSesion() {
  try {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) throw error;

    if (data.session) {
      usuarioActual = data.session.user;
      localStorage.setItem("mood_email", usuarioActual.email);
      mostrarApp(true);
    } else {
      mostrarApp(false);
    }

  } catch (error) {
    console.error("Error al comprobar sesión:", error);
    mostrarApp(false);
  }
}

comprobarSesion();

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (session) {
    usuarioActual = session.user;
    localStorage.setItem("mood_email", session.user.email);
    mostrarApp(true);
  } else if (event === "SIGNED_OUT") {
    usuarioActual = null;
    mostrarApp(false);
  }
});

/* 8. CERRAR SESIÓN */

async function salir() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;

    usuarioActual = null;
    localStorage.removeItem("mood_email");
    mostrarApp(false);

  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    mostrarToast("No se pudo cerrar sesión.");
  }
}

const btnSalir = document.getElementById("btn-salir");
const btnSalirMovil = document.getElementById("btn-salir-movil");

if (btnSalir) btnSalir.onclick = salir;
if (btnSalirMovil) btnSalirMovil.onclick = salir;

/* 9. FECHA */

const fechaHoy = document.getElementById("fecha-hoy");

if (fechaHoy) {
  fechaHoy.textContent = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

/* 10. NAVEGACIÓN */

function irAVista(nombre) {
  document.querySelectorAll(".view").forEach(view => {
    view.classList.remove("active");
  });

  const destino = document.getElementById("view-" + nombre);

  if (destino) {
    destino.classList.add("active");
  }

  document.querySelectorAll("[data-view]").forEach(boton => {
    boton.classList.toggle(
      "active",
      boton.dataset.view === nombre
    );
  });

  document.querySelectorAll(".bottom-nav button").forEach(boton => {
    boton.classList.toggle(
      "active",
      boton.dataset.view === nombre
    );
  });

  cerrarMenuMovil();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-view]").forEach(boton => {
  boton.addEventListener("click", () => {
    irAVista(boton.dataset.view);
  });
});

document.querySelectorAll("[data-view-btn]").forEach(boton => {
  boton.addEventListener("click", () => {
    irAVista(boton.dataset.viewBtn);
  });
});

/* 11. MENÚ MÓVIL */

const moreSheet = document.getElementById("moreSheet");
const mobileOverlay = document.getElementById("mobileOverlay");
const btnMore = document.getElementById("btnMore");
const btnCloseMore = document.getElementById("btnCloseMore");

function abrirMenuMovil() {
  if (moreSheet) moreSheet.classList.add("open");
  if (mobileOverlay) mobileOverlay.classList.add("active");
}

function cerrarMenuMovil() {
  if (moreSheet) moreSheet.classList.remove("open");
  if (mobileOverlay) mobileOverlay.classList.remove("active");
}

if (btnMore) btnMore.onclick = abrirMenuMovil;
if (btnCloseMore) btnCloseMore.onclick = cerrarMenuMovil;
if (mobileOverlay) mobileOverlay.onclick = cerrarMenuMovil;

/* 12. TEMPORIZADOR DE ENFOQUE */

let timerMin = 25;
let timerSeg = timerMin * 60;
let timerId = null;
let timerActivo = false;

const timerText = document.getElementById("timerText");
const timerEstado = document.getElementById("timerEstado");
const btnTimer = document.getElementById("btnTimer");
const btnTimerReset = document.getElementById("btnTimerReset");

function pintarTimer() {
  const minutos = Math.floor(timerSeg / 60);
  const segundos = timerSeg % 60;

  if (timerText) {
    timerText.textContent =
      String(minutos).padStart(2, "0") + ":" +
      String(segundos).padStart(2, "0");
  }
}

document.querySelectorAll(".mode-btn").forEach(boton => {
  boton.onclick = () => {
    clearInterval(timerId);
    timerActivo = false;

    document.querySelectorAll(".mode-btn").forEach(b => {
      b.classList.remove("active");
    });

    boton.classList.add("active");
    timerMin = Number(boton.dataset.min);
    timerSeg = timerMin * 60;

    if (timerEstado) timerEstado.textContent = "Listo para empezar";
    if (btnTimer) btnTimer.textContent = "▶ Empezar";

    pintarTimer();
  };
});

if (btnTimer) {
  btnTimer.onclick = () => {
    if (timerActivo) {
      clearInterval(timerId);
      timerActivo = false;
      btnTimer.textContent = "▶ Continuar";

      if (timerEstado) timerEstado.textContent = "Temporizador pausado";
      return;
    }

    timerActivo = true;
    btnTimer.textContent = "Ⅱ Pausar";

    if (timerEstado) timerEstado.textContent = "¡Tú puedes! 💜";

    timerId = setInterval(() => {
      if (timerSeg > 0) {
        timerSeg--;
        pintarTimer();
      } else {
        clearInterval(timerId);
        timerActivo = false;
        btnTimer.textContent = "▶ Empezar";

        if (timerEstado) timerEstado.textContent = "¡Sesión completada! ✨";

        const tarea = document.getElementById("focusTask");
        const stat = document.getElementById("stat-enfoque");

        if (stat) {
          stat.textContent = Number(stat.textContent || 0) + timerMin;
        }
        registrarDia({ enfoque: timerMin });

        detenerMusica();

        mostrarToast("¡Terminaste tu sesión! 💜");
        if (tarea) tarea.value = "";
      }
    }, 1000);
  };
}

if (btnTimerReset) {
  btnTimerReset.onclick = () => {
    clearInterval(timerId);
    timerActivo = false;
    timerSeg = timerMin * 60;

    if (btnTimer) btnTimer.textContent = "▶ Empezar";
    if (timerEstado) timerEstado.textContent = "Listo para empezar";

    detenerMusica();
    document.querySelectorAll(".music-btn").forEach(b => b.classList.remove("active"));
    const musicEstado = document.getElementById("musicEstado");
    if (musicEstado) musicEstado.textContent = "Sin música";

    pintarTimer();
  };
/* --- V12: Música relajante en Concentración (Web Audio, sin archivos) --- */

let musicaCtx = null;
let musicaMaster = null;
let musicaNodos = [];
let musicaTipo = "";
let melodiaId = null;

const ESCALA_SUAVE = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

function asegurarAudio() {
  if (!musicaCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    musicaCtx = new AudioCtx();
    musicaMaster = musicaCtx.createGain();
    const vol = document.getElementById("musicVol");
    musicaMaster.gain.value = (vol ? Number(vol.value) : 50) / 100 * 0.6;
    musicaMaster.connect(musicaCtx.destination);
  }
  if (musicaCtx.state === "suspended") musicaCtx.resume();
  return musicaCtx;
}

function ruidoBlanco(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const datos = buffer.getChannelData(0);
  for (let i = 0; i < datos.length; i++) datos[i] = Math.random() * 2 - 1;
  const fuente = ctx.createBufferSource();
  fuente.buffer = buffer;
  fuente.loop = true;
  return fuente;
}

function notaSuave(ctx, freq, cuando, duracion) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, cuando);
  gain.gain.linearRampToValueAtTime(0.35, cuando + 0.4);
  gain.gain.exponentialRampToValueAtTime(0.001, cuando + duracion);
  osc.connect(gain);
  gain.connect(musicaMaster);
  osc.start(cuando);
  osc.stop(cuando + duracion + 0.1);
}

function iniciarMusica(tipo) {
  detenerMusica();
  const estado = document.getElementById("musicEstado");
  if (tipo === "off" || !tipo) {
    musicaTipo = "";
    if (estado) estado.textContent = "Sin música";
    return;
  }
  const ctx = asegurarAudio();
  musicaTipo = tipo;

  if (tipo === "lluvia") {
    const fuente = ruidoBlanco(ctx);
    const filtro = ctx.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 900;
    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    fuente.connect(filtro);
    filtro.connect(gain);
    gain.connect(musicaMaster);
    fuente.start();
    musicaNodos.push(fuente);
    if (estado) estado.textContent = "Sonando: Lluvia 🌧️";
  } else if (tipo === "olas") {
    const fuente = ruidoBlanco(ctx);
    const filtro = ctx.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 500;
    const gain = ctx.createGain();
    gain.gain.value = 0.35;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.22;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    fuente.connect(filtro);
    filtro.connect(gain);
    gain.connect(musicaMaster);
    fuente.start();
    lfo.start();
    musicaNodos.push(fuente, lfo);
    if (estado) estado.textContent = "Sonando: Olas 🌊";
  } else if (tipo === "melodia") {
    let indice = 2;
    melodiaId = setInterval(() => {
      indice = Math.max(0, Math.min(ESCALA_SUAVE.length - 1, indice + (Math.random() < 0.5 ? -1 : 1)));
      notaSuave(musicaCtx, ESCALA_SUAVE[indice], musicaCtx.currentTime, 2.5);
    }, 1800);
    notaSuave(ctx, ESCALA_SUAVE[2], ctx.currentTime, 2.5);
    if (estado) estado.textContent = "Sonando: Melodía suave 🎵";
  }
}

function detenerMusica() {
  if (melodiaId) { clearInterval(melodiaId); melodiaId = null; }
  musicaNodos.forEach(nodo => {
    try { nodo.stop(); } catch (e) {}
    try { nodo.disconnect(); } catch (e) {}
  });
  musicaNodos = [];
}

document.querySelectorAll(".music-btn").forEach(boton => {
  boton.onclick = () => {
    document.querySelectorAll(".music-btn").forEach(b => b.classList.remove("active"));
    boton.classList.add("active");
    iniciarMusica(boton.dataset.musica);
  };
});

const musicVol = document.getElementById("musicVol");
if (musicVol) {
  musicVol.oninput = () => {
    if (musicaMaster) musicaMaster.gain.value = musicVol.value / 100 * 0.6;
  };
}

}

pintarTimer();

/* 13. TEMPORIZADOR DE MOVIMIENTO */

let movMin = 5;
let movSeg = movMin * 60;
let movId = null;
let movActivo = false;

const movText = document.getElementById("movText");
const btnMov = document.getElementById("btnMov");
const movStatus = document.getElementById("movStatus");

function pintarMov() {
  if (!movText) return;

  movText.textContent =
    String(Math.floor(movSeg / 60)).padStart(2, "0") + ":" +
    String(movSeg % 60).padStart(2, "0");
}

document.querySelectorAll(".duration-btn").forEach(boton => {
  boton.onclick = () => {
    clearInterval(movId);
    movActivo = false;

    document.querySelectorAll(".duration-btn").forEach(b => {
      b.classList.remove("active");
    });

    boton.classList.add("active");
    movMin = Number(boton.dataset.mov);
    movSeg = movMin * 60;

    if (btnMov) btnMov.textContent = "▶ Empezar movimiento";
    if (movStatus) movStatus.textContent = "¡Lista para moverte! 💜";

    pintarMov();
  };
});

if (btnMov) {
  btnMov.onclick = () => {
    if (movActivo) {
      clearInterval(movId);
      movActivo = false;
      btnMov.textContent = "▶ Continuar";
      if (movStatus) movStatus.textContent = "Pausa de movimiento";
      return;
    }

    movActivo = true;
    btnMov.textContent = "Ⅱ Pausar";

    if (movStatus) movStatus.textContent = "¡Muévete a tu ritmo! ✨";

    movId = setInterval(() => {
      if (movSeg > 0) {
        movSeg--;
        pintarMov();
      } else {
        clearInterval(movId);
        movActivo = false;
        btnMov.textContent = "▶ Empezar movimiento";

        if (movStatus) movStatus.textContent = "¡Muy bien! Terminaste tu movimiento 🌸";

        const stat = document.getElementById("stat-movimiento");
        if (stat) {
          stat.textContent = Number(stat.textContent || 0) + movMin;
        }
        registrarDia({ mov: movMin });

        mostrarToast("¡Lumi está orgulloso de ti! 🐾");
      }
    }, 1000);
  };
}

pintarMov();

/* 14. HÁBITOS */

const habitInput = document.getElementById("habitInput");
const btnAddHabito = document.getElementById("btnAddHabito");
const habitList = document.getElementById("habitList");

function actualizarHabitos() {
  const checks = document.querySelectorAll(".habit-check");
  const completados = [...checks].filter(c => c.checked).length;

  const stat = document.getElementById("stat-habitos");
  if (stat) stat.textContent = completados;
  registrarDia({ habitos: completados });
}

if (btnAddHabito) {
  btnAddHabito.onclick = () => {
    const texto = habitInput.value.trim();

    if (!texto) {
      mostrarToast("Escribe un hábito primero.");
      return;
    }

    const etiqueta = document.createElement("label");
    etiqueta.className = "habit-item";

    const contenido = document.createElement("span");
    const titulo = document.createElement("h3");
    titulo.textContent = texto;

    const fecha = document.createElement("p");
    fecha.textContent = "Hoy";

    contenido.appendChild(titulo);
    contenido.appendChild(fecha);

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "habit-check";
    check.addEventListener("change", actualizarHabitos);

    etiqueta.appendChild(contenido);
    etiqueta.appendChild(check);

    habitList.appendChild(etiqueta);
    habitInput.value = "";

    mostrarToast("¡Nuevo hábito agregado! ✨");
  };
}

document.querySelectorAll(".habit-check").forEach(check => {
  check.addEventListener("change", actualizarHabitos);
});

/* 15. DIARIO */

const btnDiario = document.getElementById("btnDiario");
const journalText = document.getElementById("journalText");
const journalEntries = document.getElementById("journalEntries");

if (btnDiario) {
  btnDiario.onclick = () => {
    const texto = journalText.value.trim();

    if (!texto) {
      mostrarToast("Escribe algo antes de guardar.");
      return;
    }

    const entrada = document.createElement("div");
    entrada.className = "journal-entry";

    const fecha = document.createElement("small");
    fecha.textContent = new Date().toLocaleDateString("es-MX");

    const contenido = document.createElement("p");
    contenido.textContent = texto;

    entrada.appendChild(fecha);
    entrada.appendChild(contenido);

    journalEntries.prepend(entrada);
    journalText.value = "";

    mostrarToast("Tu recuerdo quedó guardado en esta sesión 💜");
  };
}

/* 16. ÁNIMO */

let animoSeleccionado = "";

document.querySelectorAll(".mood-btn").forEach(boton => {
  if (boton.dataset.energia) return;

  boton.addEventListener("click", () => {
    document.querySelectorAll(".mood-btn").forEach(b => {
      if (!b.dataset.energia) b.classList.remove("selected");
    });

    boton.classList.add("selected");
    animoSeleccionado = boton.querySelector("strong")?.textContent || "";
  });
});

const btnGuardarAnimo = document.getElementById("btnGuardarAnimo");

if (btnGuardarAnimo) {
  btnGuardarAnimo.onclick = () => {
    const animoMsg = document.getElementById("animoMsg");

    if (!animoSeleccionado) {
      if (animoMsg) animoMsg.textContent = "Selecciona cómo te sientes primero.";
      return;
    }

    if (animoMsg) {
      animoMsg.textContent = "Tu ánimo de hoy: " + animoSeleccionado + " 💜";
    }
    registrarDia({ animo: animoSeleccionado });
    pintarDiasAnimoV11();

    mostrarToast("¡Gracias por compartir cómo te sientes!");
  };
}

/* V11 · Cartel: resumen de la semana y del mes, con mensaje de Lumi.
   Reusa los días ya guardados por registrarDia (dias[fecha].animo). */
const EMOCIONES_ALTAS_V11 = ["Alegría","Euforia","Entusiasmo","Amor","Orgullo","Sorpresa","Enojo","Miedo","Ansiedad","Estrés","Vergüenza","Envidia"];
function tipoEmocionV11(nombre) { return EMOCIONES_ALTAS_V11.includes(nombre) ? "alta" : "baja"; }
function resumenAnimoV11(periodo) {
  const dias = leerDias();
  const hoy = new Date();
  const dentro = (fecha) => {
    const d = new Date(fecha + "T00:00:00");
    if (periodo === "semana") { const ini = new Date(hoy); ini.setDate(hoy.getDate() - 6); ini.setHours(0, 0, 0, 0); return d >= ini && d <= hoy; }
    return d.getFullYear() === hoy.getFullYear() && d.getMonth() === hoy.getMonth();
  };
  const fechas = Object.keys(dias).filter(f => dentro(f) && dias[f].animo).sort();
  if (!fechas.length) return null;
  const conteo = {}; let altas = 0;
  fechas.forEach(f => { const n = dias[f].animo; conteo[n] = (conteo[n] || 0) + 1; if (tipoEmocionV11(n) === "alta") altas++; });
  const top = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
  return { fechas, top, mas: top[0], altas, bajas: fechas.length - altas };
}
function pintarDiasAnimoV11() {
  const tabla = document.getElementById("tablaDiasAnimo");
  if (!tabla) return;
  const dias = leerDias();
  const fechas = Object.keys(dias).filter(f => dias[f].animo).sort().slice(-7).reverse();
  tabla.innerHTML = fechas.length
    ? fechas.map(f => "<tr><td>" + f + "</td><td>" + dias[f].animo + " (" + tipoEmocionV11(dias[f].animo) + ")</td></tr>").join("")
    : "<tr><td>Todavía no hay registros. Guarda cómo te sientes hoy.</td><td></td></tr>";
}
function mostrarResumenAnimoV11(periodo) {
  const card = document.getElementById("resumenAnimoCard");
  const msg = document.getElementById("mensajeLumiResumen");
  if (!card || !msg) return;
  const r = resumenAnimoV11(periodo);
  if (!r) {
    card.classList.add("hidden");
    msg.classList.remove("hidden");
    msg.innerHTML = "<b>Lumi:</b> Todavía no tengo registros de esta " + (periodo === "semana" ? "semana" : "mes") + ". Guarda cómo te sientes hoy y yo te hago el resumen al final.";
    return;
  }
  const titulo = periodo === "semana" ? "Resumen de tu semana" : "Resumen de tu mes";
  document.getElementById("resumenAnimoTitulo").textContent = titulo + " · " + r.fechas.length + " día(s) registrado(s)";
  const pa = Math.round(r.altas / r.fechas.length * 100), pb = 100 - pa;
  document.getElementById("pctAltasAnimo").textContent = r.altas + " de " + r.fechas.length + " (" + pa + "%)";
  document.getElementById("pctBajasAnimo").textContent = r.bajas + " de " + r.fechas.length + " (" + pb + "%)";
  document.getElementById("barAltasAnimo").style.width = pa + "%";
  document.getElementById("barBajasAnimo").style.width = pb + "%";
  document.getElementById("tablaTopAnimo").innerHTML = r.top.map(([n, c]) => "<tr><td>" + n + "</td><td>" + c + " día(s)</td></tr>").join("");
  document.getElementById("resumenAnimoTexto").textContent = "La emoción que más se repitió fue " + r.mas[0] + " (" + r.mas[1] + " día(s)).";
  card.classList.remove("hidden");
  msg.classList.remove("hidden");
  const periodoTxt = periodo === "semana" ? "semana" : "mes";
  msg.innerHTML = "<b>Mensaje de Lumi al final de la " + periodoTxt + ":</b> Esta " + periodoTxt + " te sentiste más " + r.mas[0].toLowerCase() + " (" + r.mas[1] + " día(s) de " + r.fechas.length + "). Tuviste " + r.altas + " día(s) de emociones altas y " + r.bajas + " de emociones bajas. Las altas no siempre son buenas y las bajas no siempre son malas, lo importante es notarlas. Yo te acompaño en todas.";
}
const btnResumenSemana = document.getElementById("btnResumenSemana");
if (btnResumenSemana) btnResumenSemana.onclick = () => mostrarResumenAnimoV11("semana");
const btnResumenMes = document.getElementById("btnResumenMes");
if (btnResumenMes) btnResumenMes.onclick = () => mostrarResumenAnimoV11("mes");
pintarDiasAnimoV11();

/* 17. LUMI - MASCOTA */

const chispaWrap = document.getElementById("chispaWrap");
const chispaBubble = document.getElementById("chispaBubble");
const btnAlimentar = document.getElementById("btnAlimentar");

const frasesLumi = [
  "¡Hola! Tócame 💜",
  "¡Eres increíble! ✨",
  "¿Ya tomaste agüita? 💧",
  "¡Tú puedes! 🌸",
  "¡Vamos a enfocarnos! 🎯",
  "¡Qué bonito verte por aquí! ☾",
  "¡Un descansito también cuenta! 🐾"
];

function saludarLumi() {
  if (!chispaBubble) return;

  const indice = Math.floor(Math.random() * frasesLumi.length);
  chispaBubble.textContent = frasesLumi[indice];
}

if (chispaWrap) {
  chispaWrap.addEventListener("click", saludarLumi);

  chispaWrap.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      saludarLumi();
    }
  });
}

if (btnAlimentar) {
  btnAlimentar.onclick = () => {
    if (chispaBubble) {
      chispaBubble.textContent = "¡Ñam ñam! ¡Gracias! 🍎💜";
    }

    mostrarToast("¡Lumi está feliz! 🐈‍⬛");
  };
}

/* 18. RESPIRACIÓN */

const btnRespirar = document.getElementById("btnRespirar");
const breathCircle = document.getElementById("breathCircle");

if (btnRespirar && breathCircle) {
  btnRespirar.onclick = () => {
    breathCircle.classList.toggle("active");

    btnRespirar.textContent =
      breathCircle.classList.contains("active")
        ? "Detener respiración"
        : "Empezar respiración";
  };
}

/* 19. MOOD-LIGHT VISUAL */

const lightModes = document.querySelectorAll(".light-mode");
const moodLightBulb = document.querySelector(".mood-light-bulb");
const brightness = document.querySelector('.mood-light-controls input[type="range"]');

lightModes.forEach(boton => {
  boton.addEventListener("click", () => {
    lightModes.forEach(b => b.classList.remove("active"));
    boton.classList.add("active");

    if (!moodLightBulb) return;

    const modo = boton.textContent.trim();

    const colores = {
      Calma: "#c9b5ff",
      Enfoque: "#a4e8c1",
      Dormir: "#8c82d8",
      Energía: "#f3a9d1"
    };

    moodLightBulb.style.background =
      `linear-gradient(135deg,#fff1ce,${colores[modo] || "#c9b5ff"})`;
  });
});

if (brightness && moodLightBulb) {
  brightness.addEventListener("input", () => {
    const valor = Number(brightness.value);
    moodLightBulb.style.opacity = valor / 100;
    moodLightBulb.style.boxShadow =
      `0 0 ${valor / 1.5}px rgba(213,197,255,${valor / 100})`;
  });
}

/* 20. GRÁFICAS */

const datosSemana = [
  { dia: "Lun", enfoque: 35, mov: 15 },
  { dia: "Mar", enfoque: 45, mov: 20 },
  { dia: "Mié", enfoque: 30, mov: 10 },
  { dia: "Jue", enfoque: 50, mov: 25 },
  { dia: "Vie", enfoque: 40, mov: 18 },
  { dia: "Sáb", enfoque: 20, mov: 30 },
  { dia: "Dom", enfoque: 25, mov: 12 }
];

const barras = document.getElementById("barrasSemana");

if (barras) {
  barras.innerHTML = datosSemana.map(d => `
    <div class="barra-dia">
      <div class="barra-par">
        <div class="barra" style="height:${d.enfoque * 1.5}px"></div>
        <div class="barra mov" style="height:${d.mov * 1.5}px"></div>
      </div>
      <small>${d.dia}</small>
    </div>
  `).join("");
}

function dibujarLinea(id, datos, color) {
  const svg = document.getElementById(id);
  if (!svg) return;

  const maximo = Math.max(...datos, 1);
  const puntos = datos.map((valor, i) => {
    const x = 10 + i * 53;
    const y = 105 - (valor / maximo) * 85;
    return `${x},${y}`;
  }).join(" ");

  svg.innerHTML = `
    <polyline points="${puntos}" fill="none"
      stroke="${color}" stroke-width="3"
      stroke-linecap="round" stroke-linejoin="round"/>
    ${datos.map((valor, i) => {
      const x = 10 + i * 53;
      const y = 105 - (valor / maximo) * 85;
      return `<circle cx="${x}" cy="${y}" r="4" fill="${color}"/>`;
    }).join("")}
  `;
}

dibujarLinea(
  "lineaEnfoque",
  [35, 45, 30, 50, 40, 20, 25],
  "#a98bff"
);

dibujarLinea(
  "lineaDoble",
  [35, 45, 30, 50, 40, 20, 25],
  "#a98bff"
);

/* 21. MAPA DE CALOR */

const heatmap = document.getElementById("heatmap");

if (heatmap) {
  heatmap.innerHTML = Array.from({ length: 56 }, (_, i) => {
    const intensidad = (i * 7 + 3) % 4;

    const colores = [
      "rgba(255,255,255,.08)",
      "rgba(169,139,255,.3)",
      "rgba(169,139,255,.6)",
      "#a98bff"
    ];

    return `<span style="background:${colores[intensidad]}"></span>`;
  }).join("");
}

/* 22. PARTES DEL CUERPO */

document.querySelectorAll(".parte-cuerpo").forEach(parte => {
  parte.addEventListener("click", () => {
    parte.classList.toggle("active");

    const lista = document.getElementById("listaCuerpo");

    if (lista) {
      const activas = document.querySelectorAll(".parte-cuerpo.active");

      lista.textContent = [...activas]
        .map(item => item.textContent.trim())
        .join(" · ") || "Aún no has seleccionado ninguna parte.";
    }
  });
});

/* 23. ENERGÍA */

document.querySelectorAll("[data-energia]").forEach(boton => {
  boton.addEventListener("click", () => {
    const nivel = Number(boton.dataset.energia);

    const emojis = {
      1: "😴",
      3: "😐",
      5: "😊"
    };

    const emoji = document.getElementById("energiaDespues");
    const texto = document.getElementById("energiaDespuesTxt");
    const barra = document.getElementById("barraEnergia");

    if (emoji) emoji.textContent = emojis[nivel];
    if (texto) texto.textContent = nivel + " / 5";
    if (barra) barra.style.width = (nivel * 20) + "%";

    registrarDia({ energiaDespues: nivel });
    mostrarToast("¡Gracias por registrar tu energía! 💜");
  });
});

/* 24. FECHA DEL PROGRESO */

const anillosFecha = document.getElementById("anillosFecha");

if (anillosFecha) {
  anillosFecha.textContent = new Date().toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short"
  });
}

/* 25. NOTIFICACIONES */

function mostrarToast(texto) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = texto;
  toast.classList.add("show");

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}


/* 27. GUARDAR PROGRESO (local + Supabase, sin romper nada) */
/* Se guarda siempre en este navegador y, si la tabla existe en Supabase,
   también se guarda ahí con tu usuario. Si la tabla aún no existe, la app
   sigue funcionando solo con lo local y avisa en la consola. */
async function guardarEnSupabase(tabla, datos) {
  try {
    const fila = { ...datos, user_id: usuarioActual ? usuarioActual.id : null, fecha: new Date().toISOString() };
    const { error } = await supabaseClient.from(tabla).insert(fila);
    if (error) console.warn("Supabase (" + tabla + "): aún no se guardó ahí - " + error.message);
  } catch (e) {
    console.warn("Supabase (" + tabla + "): no disponible ahora, se guardó en local.");
  }
}
function guardarLocal(clave, datos) {
  try { localStorage.setItem("moodcode_" + clave, JSON.stringify(datos)); } catch (e) {}
}
function leerLocal(clave, porDefecto) {
  try {
    const v = JSON.parse(localStorage.getItem("moodcode_" + clave) || "null");
    return v || porDefecto;
  } catch (e) { return porDefecto; }
}

/* 28. LUMI: ENERGÍA, FELICIDAD, NIVEL Y XP */
let lumiState = leerLocal("lumi", { energia: 80, felicidad: 90, nivel: 1, xp: 0, petalos: 0 });
function pintarLumi() {
  const e = document.getElementById("lumiEnergia");
  const f = document.getElementById("lumiFelicidad");
  const n = document.getElementById("lumiNivel");
  const bar = document.getElementById("lumiXpBar");
  if (e) e.textContent = lumiState.energia + "%";
  if (f) f.textContent = lumiState.felicidad + "%";
  if (n) n.textContent = lumiState.nivel;
  if (bar) bar.style.width = Math.min(lumiState.xp, 40) / 40 * 100 + "%";
  const jn = document.getElementById("jardinNivel");
  const jp = document.getElementById("jardinPetalos");
  const jx = document.getElementById("jardinXp");
  const jb = document.getElementById("jardinBarra");
  if (jn) jn.textContent = "Nivel " + lumiState.nivel + " 🌸";
  if (jp) jp.textContent = lumiState.petalos;
  if (jx) jx.textContent = lumiState.xp;
  if (jb) jb.style.width = Math.min(lumiState.xp, 40) / 40 * 100 + "%";
  guardarLocal("lumi", lumiState);
}
function ganarXpLumi(cantidad) {
  lumiState.xp += cantidad;
  lumiState.felicidad = Math.min(100, lumiState.felicidad + 10);
  lumiState.energia = Math.min(100, lumiState.energia + 10);
  if (lumiState.xp >= 40) { lumiState.nivel++; lumiState.xp -= 40; mostrarToast("¡Lumi subió al Nivel " + lumiState.nivel + "! 🎉"); }
  pintarLumi();
}
if (btnAlimentar) {
  btnAlimentar.addEventListener("click", () => {
    lumiState.energia = Math.min(100, lumiState.energia + 10);
    pintarLumi();
  });
}

/* 29. RUTINAS PASO A PASO */
const RUTINAS = {
  estiramiento: { nombre: "Estiramiento", pasos: [
    { nombre: "Cuello suave", texto: "Mueve el cuello despacio, de lado a lado, sin forzar." },
    { nombre: "Hombros arriba", texto: "Sube los hombros hacia las orejas y bájalos despacio." },
    { nombre: "Brazos al cielo", texto: "Estira los brazos hacia arriba y respira profundo." },
    { nombre: "Espalda larga", texto: "Estira la espalda hacia adelante, con las rodillas suaves." },
    { nombre: "Respira y suelta", texto: "Respira profundo 3 veces y suelta todo el cuerpo." } ] },
  baile: { nombre: "Baile", pasos: [
    { nombre: "Calienta el cuerpo", texto: "Mueve los brazos y las piernas al ritmo de la música." },
    { nombre: "Cadera suelta", texto: "Mueve la cadera de lado a lado, como te salga." },
    { nombre: "Pasos libres", texto: "Da pasitos adelante y atrás, sin parar de moverte." },
    { nombre: "Final con estilo", texto: "Termina con tu mejor paso y una sonrisa." } ] },
  yoga: { nombre: "Yoga suave", pasos: [
    { nombre: "Respira profundo", texto: "Inhala por la nariz y exhala despacio por la boca." },
    { nombre: "Gato y vaca", texto: "En cuatro apoyos, arquea y redondea la espalda despacio." },
    { nombre: "Perro mirando abajo", texto: "Estira las piernas y los brazos, con la cabeza suelta." },
    { nombre: "Postura del niño", texto: "Siéntate sobre tus talones y estira los brazos al frente." },
    { nombre: "Relajación final", texto: "Acuéstate, cierra los ojos y respira tranquila." } ] }
};
let rutinaActual = "estiramiento";
let pasoActual = 0;
let pasoSeg = 0;
let pasoTotalSeg = 60;
let rutinaId = null;
let rutinaActiva = false;
const pasoNum = document.getElementById("pasoNum");
const pasoNombre = document.getElementById("pasoNombre");
const pasoInstruccion = document.getElementById("pasoInstruccion");
const pasoTiempo = document.getElementById("pasoTiempo");
const pasoBarra = document.getElementById("pasoBarra");
const btnRutina = document.getElementById("btnRutina");
const btnPasoSiguiente = document.getElementById("btnPasoSiguiente");
const rutinaMsg = document.getElementById("rutinaMsg");
function duracionPaso() {
  const pasos = RUTINAS[rutinaActual].pasos.length;
  const total = (typeof movMin === "number" ? movMin : 5) * 60;
  return Math.max(10, Math.floor(total / pasos));
}
function mostrarPaso() {
  if (!pasoNum) return;
  const rutina = RUTINAS[rutinaActual];
  const paso = rutina.pasos[pasoActual];
  pasoTotalSeg = duracionPaso();
  pasoSeg = pasoTotalSeg;
  pasoNum.textContent = "Paso " + (pasoActual + 1) + " de " + rutina.pasos.length + " • " + rutina.nombre;
  pasoNombre.textContent = paso.nombre;
  pasoInstruccion.textContent = paso.texto;
  pasoTiempo.textContent = String(Math.floor(pasoSeg / 60)).padStart(2, "0") + ":" + String(pasoSeg % 60).padStart(2, "0");
  if (pasoBarra) pasoBarra.style.width = "0%";
}
function terminarRutina() {
  clearInterval(rutinaId);
  rutinaActiva = false;
  if (btnRutina) btnRutina.textContent = "▶ Empezar rutina";
  const minutos = typeof movMin === "number" ? movMin : 5;
  const stat = document.getElementById("stat-movimiento");
  if (stat) stat.textContent = Number(stat.textContent || 0) + minutos;
  registrarDia({ mov: minutos, rutinas: { [rutinaActual]: 1 } });
  ganarXpLumi(10);
  guardarLocal("sesiones_movimiento", { rutina: rutinaActual, minutos, fecha: new Date().toISOString() });
  guardarEnSupabase("sesiones_movimiento", { rutina: rutinaActual, minutos });
  if (rutinaMsg) rutinaMsg.textContent = "¡Terminaste " + RUTINAS[rutinaActual].nombre + "! Lumi ganó +10 XP y +10% de energía. 🩷";
  mostrarToast("¡Rutina completada! Lumi está orgulloso de ti. 🐾");
  pasoActual = 0;
  mostrarPaso();
}
function avanzarPaso() {
  const rutina = RUTINAS[rutinaActual];
  if (pasoActual < rutina.pasos.length - 1) { pasoActual++; mostrarPaso(); }
  else { terminarRutina(); }
}
document.querySelectorAll(".rutina-card").forEach(boton => {
  boton.addEventListener("click", () => {
    clearInterval(rutinaId);
    rutinaActiva = false;
    if (btnRutina) btnRutina.textContent = "▶ Empezar rutina";
    document.querySelectorAll(".rutina-card").forEach(b => b.classList.remove("active"));
    boton.classList.add("active");
    rutinaActual = boton.dataset.rutina;
    pasoActual = 0;
    mostrarPaso();
    if (rutinaMsg) rutinaMsg.textContent = "Rutina lista: " + RUTINAS[rutinaActual].nombre + ". Dale play cuando quieras.";
  });
});
if (btnRutina) {
  btnRutina.addEventListener("click", () => {
    if (rutinaActiva) {
      clearInterval(rutinaId);
      rutinaActiva = false;
      btnRutina.textContent = "▶ Continuar";
      if (rutinaMsg) rutinaMsg.textContent = "Rutina en pausa. Respira, no pasa nada.";
      return;
    }
    rutinaActiva = true;
    btnRutina.textContent = "Ⅱ Pausar";
    if (rutinaMsg) rutinaMsg.textContent = "¡Muévete a tu ritmo! ✨";
    rutinaId = setInterval(() => {
      if (pasoSeg > 0) {
        pasoSeg--;
        pasoTiempo.textContent = String(Math.floor(pasoSeg / 60)).padStart(2, "0") + ":" + String(pasoSeg % 60).padStart(2, "0");
        if (pasoBarra) pasoBarra.style.width = ((pasoTotalSeg - pasoSeg) / pasoTotalSeg * 100) + "%";
      } else {
        avanzarPaso();
      }
    }, 1000);
  });
}
if (btnPasoSiguiente) btnPasoSiguiente.addEventListener("click", () => { avanzarPaso(); });

/* 30. JARDÍN MÁGICO CON LUMI Y RECOMPENSAS */
const PLANTAS_JARDIN = [
  { id: "agua", nombre: "Tomar agua 💧", emoji: "🌷" },
  { id: "moverse", nombre: "Moverme 5 min 🏃", emoji: "🌻" },
  { id: "enfoque", nombre: "Concentrarme 🎯", emoji: "🌹" },
  { id: "respirar", nombre: "Respirar 🧘", emoji: "🌼" }
];
let jardinState = leerLocal("jardin", { plantas: { agua: 0, moverse: 0, enfoque: 0, respirar: 0 }, flores: [] });
const gardenPlants = document.getElementById("gardenPlants");
function renderJardin() {
  if (!gardenPlants) return;
  const jf = document.getElementById("jardinFlores");
  if (jf) jf.textContent = jardinState.flores.length;
  gardenPlants.innerHTML = "";
  PLANTAS_JARDIN.forEach(p => {
    const riegos = jardinState.plantas[p.id] || 0;
    const florecio = riegos >= 3;
    const div = document.createElement("div");
    div.className = "plant-card" + (florecio ? " bloomed" : "");
    const etapa = florecio ? p.emoji : (riegos === 0 ? "🌱" : "🌿");
    div.innerHTML = '<div class="plant-emoji">' + etapa + '</div><strong>' + p.nombre + '</strong><small>' + (florecio ? "¡Floreció! 🌸" : "Riegos: " + riegos + " / 3") + '</small>';
    const btn = document.createElement("button");
    btn.className = "btn-primary";
    btn.style.padding = "9px 14px";
    btn.textContent = florecio ? "Ya floreció 🌸" : "💧 Regar";
    btn.disabled = florecio;
    btn.addEventListener("click", () => regarPlanta(p.id));
    div.appendChild(btn);
    gardenPlants.appendChild(div);
  });
  const col = document.getElementById("gardenColeccion");
  if (col) col.textContent = jardinState.flores.length
    ? "Tu colección: " + jardinState.flores.map(id => { const p = PLANTAS_JARDIN.find(x => x.id === id); return p ? p.emoji + " " + p.nombre : id; }).join(" · ")
    : "Tu colección: aún no ha florecido ninguna flor.";
  guardarLocal("jardin", jardinState);
}
function regarPlanta(id) {
  if ((jardinState.plantas[id] || 0) >= 3) return;
  jardinState.plantas[id] = (jardinState.plantas[id] || 0) + 1;
  const p = PLANTAS_JARDIN.find(x => x.id === id);
  if (jardinState.plantas[id] >= 3) {
    jardinState.flores.push(id);
    lumiState.petalos += 10;
    ganarXpLumi(10);
    guardarLocal("jardin", jardinState);
    guardarEnSupabase("jardin", { planta: id, petalos: lumiState.petalos });
    const jm = document.getElementById("jardinMsg");
    if (jm) jm.textContent = "¡Floreció " + p.nombre + "! Ganaste 10 pétalos 🩷 y Lumi ganó +10 XP.";
    mostrarToast("¡Floreció " + p.nombre + "! +10 pétalos 🩷");
  } else {
    mostrarToast("¡Gracias por regar " + p.nombre + "! Lleva " + jardinState.plantas[id] + " / 3 riegos.");
  }
  renderJardin();
}
const lumiJardinWrap = document.getElementById("lumiJardinWrap");
if (lumiJardinWrap) {
  lumiJardinWrap.addEventListener("click", () => {
    mostrarToast("¡Hola! Lumi está feliz en su jardín 🩷");
    saludarLumi();
  });
}



/* 31. PROGRESO REAL: EMPIEZA EN 0, RACHA EN 0 DÍAS */
/* Cada día se guarda con lo que Belen hizo de verdad: enfoque, movimiento,
   hábitos, rutinas, ánimo y energía. Las gráficas se calculan con eso.
   La racha empieza en 0 días, como ella pidió. */
const RACHA_DIAS = 0;
function hoyISO() {
  const f = new Date();
  const m = String(f.getMonth() + 1).padStart(2, "0");
  const d = String(f.getDate()).padStart(2, "0");
  return f.getFullYear() + "-" + m + "-" + d;
}
function leerDias() { return leerLocal("dias", {}); }
function registrarDia(cambios) {
  const dias = leerDias();
  const hoy = dias[hoyISO()] || { enfoque: 0, mov: 0, habitos: 0, rutinas: {}, animo: "", energiaDespues: 0 };
  if (cambios.enfoque) hoy.enfoque = (hoy.enfoque || 0) + cambios.enfoque;
  if (cambios.mov) hoy.mov = (hoy.mov || 0) + cambios.mov;
  if (typeof cambios.habitos === "number") hoy.habitos = cambios.habitos;
  if (cambios.rutinas) {
    hoy.rutinas = hoy.rutinas || {};
    Object.keys(cambios.rutinas).forEach(k => { hoy.rutinas[k] = (hoy.rutinas[k] || 0) + cambios.rutinas[k]; });
  }
  if (cambios.animo) hoy.animo = cambios.animo;
  if (cambios.energiaDespues) hoy.energiaDespues = cambios.energiaDespues;
  dias[hoyISO()] = hoy;
  guardarLocal("dias", dias);
  pintarProgresoReal();
}
function ultimos7Dias() {
  const dias = leerDias();
  const out = [];
  const nombres = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  for (let i = 6; i >= 0; i--) {
    const f = new Date();
    f.setDate(f.getDate() - i);
    const iso = f.getFullYear() + "-" + String(f.getMonth() + 1).padStart(2, "0") + "-" + String(f.getDate()).padStart(2, "0");
    const d = dias[iso] || { enfoque: 0, mov: 0 };
    out.push({ dia: nombres[f.getDay()], enfoque: d.enfoque || 0, mov: d.mov || 0 });
  }
  return out;
}
function pintarProgresoReal() {
  const dias = leerDias();
  const hoy = dias[hoyISO()] || { enfoque: 0, mov: 0, habitos: 0, rutinas: {}, energiaDespues: 0 };
  // Inicio: hoy en 0 y subiendo con lo que hagas
  const se = document.getElementById("stat-enfoque");
  const sm = document.getElementById("stat-movimiento");
  const sh = document.getElementById("stat-habitos");
  if (se) se.textContent = hoy.enfoque || 0;
  if (sm) sm.textContent = hoy.mov || 0;
  if (sh) sh.textContent = hoy.habitos || 0;
  // Anillos de hoy
  const setAnillo = (id, numId, valor, meta) => {
    const el = document.getElementById(id);
    const num = document.getElementById(numId);
    if (el) el.style.setProperty("--p", Math.min(100, Math.round(valor / meta * 100)));
    if (num) num.textContent = valor;
  };
  setAnillo("anilloEnfoque", "anilloEnfoqueNum", hoy.enfoque || 0, 50);
  setAnillo("anilloMov", "anilloMovNum", hoy.mov || 0, 20);
  setAnillo("anilloHabitos", "anilloHabitosNum", hoy.habitos || 0, 5);
  // Semana real
  const semana = ultimos7Dias();
  const barrasEl = document.getElementById("barrasSemana");
  if (barrasEl) {
    barrasEl.innerHTML = semana.map(d => `
    <div class="barra-dia">
      <div class="barra-par">
        <div class="barra" style="height:${d.enfoque * 1.5}px"></div>
        <div class="barra mov" style="height:${d.mov * 1.5}px"></div>
      </div>
      <small>${d.dia}</small>
    </div>`).join("");
  }
  dibujarLinea("lineaEnfoque", semana.map(d => d.enfoque), "#f78fb8");
  // Moverme = Concentrarme: línea doble real (enfoque rosa, movimiento verde)
  const svgDoble = document.getElementById("lineaDoble");
  if (svgDoble) {
    const dibujar = (datos, color) => {
      const maximo = Math.max(...datos, 1);
      const puntos = datos.map((v, i) => (10 + i * 53) + "," + (105 - (v / maximo) * 85)).join(" ");
      return `<polyline points="${puntos}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    };
    svgDoble.innerHTML = dibujar(semana.map(d => d.enfoque), "#f78fb8") + dibujar(semana.map(d => d.mov), "#a4e8c1");
  }
  const diasConMov = semana.filter(d => d.mov > 0).length;
  const diasConEnfoque = semana.filter(d => d.enfoque > 0).length;
  const diasAmbos = semana.filter(d => d.mov > 0 && d.enfoque > 0).length;
  const mp = document.getElementById("movermePorcentaje");
  if (mp) {
    mp.textContent = diasConEnfoque === 0 ? "0% · Aún no hay datos" : Math.round(diasAmbos / diasConEnfoque * 100) + "% de tus días con movimiento también te concentraste";
  }
  // Mapa de calor: vacío al empezar en 0; se llena con tus días reales
  const heat = document.getElementById("heatmap");
  if (heat) {
    heat.innerHTML = Array.from({ length: 56 }, (_, i) => {
      const esRacha = i >= 56 - RACHA_DIAS;
      const color = esRacha ? (i % 2 ? "rgba(247,143,184,.6)" : "#f78fb8") : "rgba(255,255,255,.08)";
      return `<span style="background:${color}"></span>`;
    }).join("");
  }
  // Rueda: rutinas reales de los últimos 7 días
  let tot = { estiramiento: 0, baile: 0, yoga: 0 };
  Object.keys(dias).forEach(iso => {
    const r = dias[iso].rutinas || {};
    Object.keys(tot).forEach(k => { tot[k] += r[k] || 0; });
  });
  const totalRut = tot.estiramiento + tot.baile + tot.yoga;
  const setRueda = (txtId, barId, valor) => {
    const t = document.getElementById(txtId);
    const b = document.getElementById(barId);
    const pct = totalRut === 0 ? 0 : Math.round(valor / totalRut * 100);
    if (t) t.textContent = pct + "%";
    if (b) b.style.width = pct + "%";
  };
  setRueda("ruedaEstTxt", "ruedaEstBar", tot.estiramiento);
  setRueda("ruedaBaileTxt", "ruedaBaileBar", tot.baile);
  setRueda("ruedaYogaTxt", "ruedaYogaBar", tot.yoga);
  // Energía de hoy
  const ed = document.getElementById("energiaDespues");
  const et = document.getElementById("energiaDespuesTxt");
  const eb = document.getElementById("barraEnergia");
  const en = document.getElementById("energiaNota");
  const energiaHoy = hoy.energiaDespues || 0;
  if (ed) ed.textContent = energiaHoy === 0 ? "😴" : (energiaHoy <= 1 ? "😴" : (energiaHoy <= 3 ? "😐" : "😊"));
  if (et) et.textContent = energiaHoy + " / 5";
  if (eb) eb.style.width = (energiaHoy * 20) + "%";
  if (en) en.textContent = energiaHoy === 0 ? "Aún no hay datos de hoy" : "Tu energía de hoy: " + energiaHoy + " / 5";
  // Racha en 0, como pidió Belen: todo empieza en 0
  const rachaEl = document.getElementById("racha");
  if (rachaEl) rachaEl.textContent = RACHA_DIAS;
  const rachaCard = document.getElementById("rachaCard");
  if (rachaCard) rachaCard.textContent = RACHA_DIAS + " días";
  const rachaProg = document.getElementById("rachaProgreso");
  if (rachaProg) rachaProg.textContent = "🔥 " + RACHA_DIAS + " días";
}



/* 32. MOOD-LIGHT: CONEXIÓN A TU LÁMPARA REAL (ESP32 + tira de 30 LEDs) */
/* La app le habla al ESP32 por WiFi, a su dirección IP. El ESP32 tiene que
   estar encendido, en el mismo WiFi que tu compu, y con el código
   mood-light-esp32.ino cargado. Si no está conectado, la app sigue
   funcionando solo con la lucecita de la pantalla. */
let lampIp = leerLocal("lamp_ip", "") || "";
let lampColorActual = { r: 247, g: 143, b: 184 };
let lampBrillo = 70;
let lampConectada = false;
const lampIpInput = document.getElementById("lampIp");
const lampStatus = document.getElementById("lampStatus");
const lampColorInput = document.getElementById("lampColor");
const btnConectarLampara = document.getElementById("btnConectarLampara");
const btnProbarLampara = document.getElementById("btnProbarLampara");
const btnApagarLampara = document.getElementById("btnApagarLampara");
if (lampIpInput && lampIp) lampIpInput.value = lampIp;
function ponerLampStatus(texto) { if (lampStatus) lampStatus.textContent = texto; }
function hexARgb(hex) {
  const h = (hex || "#f78fb8").replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}
async function enviarALampara(color, brillo) {
  if (!lampIp) { ponerLampStatus("Escribe primero la IP de tu lámpara y toca Conectar."); return false; }
  lampColorActual = color;
  if (typeof brillo === "number") lampBrillo = brillo;
  const control = new AbortController();
  const tiempo = setTimeout(() => control.abort(), 3000);
  try {
    const respuesta = await fetch(`http://${lampIp}/color?r=${color.r}&g=${color.g}&b=${color.b}&brillo=${lampBrillo}`, { signal: control.signal });
    clearTimeout(tiempo);
    if (!respuesta.ok) throw new Error("El ESP32 respondió con error");
    lampConectada = true;
    ponerLampStatus("¡Conectada! Tu lámpara está en color rosa aurora. 💡🩷");
    return true;
  } catch (e) {
    clearTimeout(tiempo);
    lampConectada = false;
    ponerLampStatus("No se pudo conectar. Revisa que el ESP32 esté encendido, en el mismo WiFi y que la IP sea la correcta.");
    return false;
  }
}
async function conectarLampara() {
  const ip = (lampIpInput ? lampIpInput.value : "").trim();
  if (!ip) { ponerLampStatus("Escribe la IP de tu lámpara, por ejemplo 192.168.1.50"); return; }
  lampIp = ip;
  guardarLocal("lamp_ip", ip);
  ponerLampStatus("Conectando a " + ip + "...");
  const control = new AbortController();
  const tiempo = setTimeout(() => control.abort(), 3000);
  try {
    const respuesta = await fetch(`http://${ip}/estado`, { signal: control.signal });
    clearTimeout(tiempo);
    if (!respuesta.ok) throw new Error("Sin respuesta");
    lampConectada = true;
    ponerLampStatus("¡Lámpara conectada! 💡 Ya puedes cambiarle el color desde aquí.");
    mostrarToast("¡Tu lámpara está conectada! 💡");
    await enviarALampara(lampColorActual, lampBrillo);
  } catch (e) {
    clearTimeout(tiempo);
    lampConectada = false;
    ponerLampStatus("No se pudo conectar a " + ip + ". Revisa que el ESP32 esté encendido y en el mismo WiFi.");
  }
}
if (btnConectarLampara) btnConectarLampara.addEventListener("click", conectarLampara);
if (btnProbarLampara) btnProbarLampara.addEventListener("click", () => enviarALampara({ r: 247, g: 143, b: 184 }, lampBrillo));
if (btnApagarLampara) btnApagarLampara.addEventListener("click", () => enviarALampara({ r: 0, g: 0, b: 0 }, lampBrillo));
if (lampColorInput) {
  lampColorInput.addEventListener("input", () => {
    const color = hexARgb(lampColorInput.value);
    if (moodLightBulb) moodLightBulb.style.background = `linear-gradient(135deg,#fff1ce,${lampColorInput.value})`;
    enviarALampara(color, lampBrillo);
  });
}
// Los modos que ya tenías también se mandan a la lámpara real
const coloresModoLampara = {
  Calma: { r: 201, g: 181, b: 255 },
  Enfoque: { r: 164, g: 232, b: 193 },
  Dormir: { r: 140, g: 130, b: 216 },
  "Energía": { r: 243, g: 169, b: 209 }
};
if (typeof lightModes !== "undefined") {
  lightModes.forEach(boton => {
    boton.addEventListener("click", () => {
      const color = coloresModoLampara[boton.textContent.trim()] || { r: 201, g: 181, b: 255 };
      enviarALampara(color, lampBrillo);
    });
  });
}
if (typeof brightness !== "undefined" && brightness) {
  brightness.addEventListener("input", () => {
    lampBrillo = Number(brightness.value);
    enviarALampara(lampColorActual, lampBrillo);
  });
}
if (lampIp) ponerLampStatus("IP guardada: " + lampIp + ". Toca Conectar para encender tu lámpara.");


/* 26. INICIALIZACIÓN */

actualizarHabitos();
pintarTimer();
pintarMov();
pintarLumi();
renderJardin();
mostrarPaso();
pintarProgresoReal();

console.log("✨ MOOD-CODE V5 cargado correctamente.");
console.log("🐈‍⬛ Lumi está lista para acompañarte.");