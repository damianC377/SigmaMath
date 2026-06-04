// Método gráfico seleccionado actualmente
let currentMethod = "inferior";

// Guarda el último resultado recibido del backend
let lastResult = null;

// Instancia de Desmos
let calculator = null;

// Datos de la última operación
let lastA = 0;
let lastB = 4;
let lastN = 10;
let lastFuncion = "";

// Inicializar Desmos al cargar la página
window.addEventListener("load", () => {
  initDesmos();
});

// Crear y configurar la gráfica de Desmos
function initDesmos() {
  const el = document.getElementById("desmos-container");

  if (!el) return;

  if (typeof Desmos === "undefined") {
    el.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#ff6b6b;font-size:14px;font-family:Arial;">Error cargando Desmos</div>`;
    return;
  }

  calculator = Desmos.GraphingCalculator(el, {
    keypad: false,
    expressions: false,
    settingsMenu: false,
    zoomButtons: false,
    lockViewport: false,
    border: false,
    showGrid: true,
    backgroundColor: "#f8fafc",
  });
}

// Generar inputs de coeficientes según el grado elegido
function buildCoefInputs() {
  const grado = parseInt(document.getElementById("grado").value);
  const grid = document.getElementById("coef-grid");

  if (isNaN(grado)) {
    document.getElementById("coef-grid").innerHTML = "";
    document.getElementById("coef-hint").textContent = "";
    return;
  }

  grid.innerHTML = "";

  for (let i = 0; i <= grado; i++) {
    const div = document.createElement("div");

    div.className = "coef-item";

    div.innerHTML = `
      <div class="coef-label">Coef. ${i + 1}</div>
      <input
        type="number"
        class="coef-input"
        step="0.1"
        value="0"
        placeholder="0">
    `;

    grid.appendChild(div);
  }

  updateHint(grado);
}

// Convertir exponente a superíndice
function getSuperscript(n) {
  const map = {
    2: "²",
    3: "³",
    4: "⁴",
    5: "⁵",
  };

  return map[n] || `^${n}`;
}

// Mostrar ejemplo de polinomio
function updateHint(grado) {
  const exs = {
    1: "ax + b",
    2: "ax² + bx + c",
    3: "ax³ + bx² + cx + d",
    4: "ax⁴ + bx³ + cx² + dx + e",
    5: "ax⁵ + ... + f",
  };

  document.getElementById("coef-hint").textContent = `Forma: ${exs[grado]}`;
}

// Crear inputs al iniciar
buildCoefInputs();

// Abrir/cerrar acordeón
function toggleAccordion(header) {
  const body = header.nextElementSibling;
  const chevron = header.querySelector(".accordion-chevron");

  const isOpen = body.classList.contains("open");

  body.classList.toggle("open", !isOpen);
  chevron.style.transform = isOpen ? "" : "rotate(180deg)";
}

// Mostrar error
function showError(msg) {
  const el = document.getElementById("error-msg");

  el.textContent = msg;
  el.classList.add("visible");
}

// Ocultar error
function clearError() {
  document.getElementById("error-msg").classList.remove("visible");
}

// Validar datos ingresados
function validate() {
  const a = parseFloat(document.getElementById("a-val").value);
  const b = parseFloat(document.getElementById("b-val").value);
  const n = parseInt(document.getElementById("n-val").value);

  if (isNaN(a) || isNaN(b)) {
    showError("Los límites deben ser válidos");
    return false;
  }

  if (a >= b) {
    showError("a debe ser menor que b");
    return false;
  }

  if (isNaN(n) || n < 1) {
    showError("n debe ser mayor que 0");
    return false;
  }

  if (n > 200) {
    showError("Usa n ≤ 200");
    return false;
  }

  for (const inp of document.querySelectorAll(".coef-input")) {
    if (inp.value.trim() === "" || isNaN(parseFloat(inp.value))) {
      showError("Coeficientes inválidos");
      return false;
    }
  }

  clearError();
  return true;
}

// Construir función para cálculos y gráfica
function buildPolynomialFunction() {
  const grado = parseInt(document.getElementById("grado").value);

  const coefs = [...document.querySelectorAll(".coef-input")].map((i) =>
    parseFloat(i.value),
  );

  let expr = "";

  coefs.forEach((coef, idx) => {
    const power = grado - idx;

    if (coef === 0) return;

    const sign = coef >= 0 ? "+" : "-";
    const absC = Math.abs(coef);

    let term = "";

    if (power === 0) {
      term = `${absC}`;
    } else if (power === 1) {
      term = absC === 1 ? "x" : `${absC}*x`;
    } else {
      term = absC === 1 ? `x**${power}` : `${absC}*x**${power}`;
    }

    expr =
      expr === "" ? (coef < 0 ? `-${term}` : term) : `${expr} ${sign} ${term}`;
  });

  return expr || "0";
}

// Enviar datos al backend Flask y obtener resultados
async function calcular() {
  if (!validate()) return;

  const btn = document.getElementById("compute-btn");
  const label = document.getElementById("btn-label");

  btn.disabled = true;
  btn.classList.add("loading");

  label.innerHTML = 'Calculando<span class="loading-dots"></span>';

  const a = parseFloat(document.getElementById("a-val").value);
  const b = parseFloat(document.getElementById("b-val").value);
  const n = parseInt(document.getElementById("n-val").value);

  lastA = a;
  lastB = b;
  lastN = n;

  const grado = parseInt(document.getElementById("grado").value);

  const coeficientes = [...document.querySelectorAll(".coef-input")].map((i) =>
    parseFloat(i.value),
  );

  lastFuncion = buildPolynomialFunction();

  const payload = {
    a,
    b,
    n,
    tipo_ingreso: "coeficientes",
    grado,
    coeficientes,
  };

  try {
    const res = await fetch("http://127.0.0.1:5000/calcular", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error("Backend error");
    }

    const data = await res.json();

    lastResult = data;

    // Mostrar resultados
    renderResults(data);

    // Mostrar Δx
    updateDeltaX();

    // Dibujar gráfica
    drawGraph();

    document.getElementById("results-placeholder").style.display = "none";

    document.getElementById("results-section").style.display = "block";
  } catch (err) {
    console.error(err);
    showError("No se pudo conectar con Flask");
  } finally {
    btn.disabled = false;
    btn.classList.remove("loading");
    label.textContent = "Calcular Integral";
  }
}

// Construir polinomio bonito para mostrar al usuario
function buildPrettyPolynomial() {
  const grado = parseInt(document.getElementById("grado").value);

  const coefs = [...document.querySelectorAll(".coef-input")].map((i) =>
    parseFloat(i.value),
  );

  const supers = {
    2: "²",
    3: "³",
    4: "⁴",
    5: "⁵",
  };

  let expr = "";

  coefs.forEach((coef, idx) => {
    const potencia = grado - idx;

    if (coef === 0) return;

    const valor = Math.abs(coef);
    let termino = "";

    if (potencia === 0) {
      termino = `${valor}`;
    } else if (potencia === 1) {
      termino = valor === 1 ? "x" : `${valor}x`;
    } else {
      const exponente = supers[potencia] || `^${potencia}`;

      termino = valor === 1 ? `x${exponente}` : `${valor}x${exponente}`;
    }

    if (expr === "") {
      expr = coef < 0 ? `-${termino}` : termino;
    } else {
      expr += coef < 0 ? ` - ${termino}` : ` + ${termino}`;
    }
  });

  return expr || "0";
}

// Mostrar resultados en tarjetas
function renderResults(data) {
  const exacta = Number(data.integral_exacta || 0);
  const inferior = Number(data.suma_inferior || 0);
  const superior = Number(data.suma_superior || 0);
  const riemann = Number(data.suma_riemman || 0);

  updateResultCard("inferior", inferior, exacta);
  updateResultCard("superior", superior, exacta);
  updateResultCard("riemann", riemann, exacta);

  document.getElementById("val-exacta").textContent = exacta.toFixed(6);

  document.getElementById("funcion-str").textContent =
    `f(x) = ${buildPrettyPolynomial()}`;

  document.getElementById("graph-function").textContent =
    `f(x) = ${buildPrettyPolynomial()}`;

  document
    .querySelectorAll(".result-card")
    .forEach((c) => c.classList.add("loaded"));
}

// Actualizar valor de una tarjeta
function updateResultCard(type, value, exacta) {
  document.getElementById(`val-${type}`).textContent = value.toFixed(6);
}

// Calcular y mostrar Δx
function updateDeltaX() {
  const dx = (lastB - lastA) / lastN;

  document.getElementById("delta-strip").style.display = "flex";

  document.getElementById("delta-formula").textContent =
    `(${lastB} - ${lastA}) / ${lastN}`;

  document.getElementById("delta-value").textContent = dx.toFixed(6);
}

// Cambiar método gráfico
function switchGraphMethod(method, btn) {
  currentMethod = method;

  document
    .querySelectorAll(".method-tab")
    .forEach((b) => b.classList.remove("active"));

  btn.classList.add("active");

  if (lastResult) {
    drawGraph();
  }
}

// Dibujar curva, área y rectángulos
function drawGraph() {
  if (!calculator || !lastResult) return;

  calculator.setBlank();

  // Dibujar función
  calculator.setExpression({
    id: "func",
    latex: `y=${toLatex(lastFuncion)}`,
    color: "#63b3ed",
    lineWidth: 3,
  });

  // Pintar área bajo la curva
  calculator.setExpression({
    id: "area",
    latex: `\\left(y-0\\right)\\left(${toLatex(lastFuncion)}-y\\right)\\ge0\\left\\{${lastA}\\le x\\le${lastB}\\right\\}`,
    color: "#4fd1c5",
    fillOpacity: 0.25,
    lineOpacity: 0,
  });

  const dx = (lastB - lastA) / lastN;
  const muestras = 20;

  const color =
    currentMethod === "inferior"
      ? "#b794f4"
      : currentMethod === "superior"
        ? "#fc8181"
        : "#f6ad55";

  // Dibujar rectángulos
  for (let i = 0; i < lastN; i++) {
    const x0 = lastA + i * dx;
    const x1 = x0 + dx;

    let y = 0;

    if (currentMethod === "inferior") {
      // Evaluamos varios puntos dentro del subintervalo y nos quedamos con el mínimo
      const ys = Array.from({ length: muestras + 1 }, (_, j) =>
        evaluateFunction(lastFuncion, x0 + (j * (x1 - x0)) / muestras),
      );
      y = Math.min(...ys);
    } else if (currentMethod === "superior") {
      // Evaluamos varios puntos dentro del subintervalo y nos quedamos con el máximo
      const ys = Array.from({ length: muestras + 1 }, (_, j) =>
        evaluateFunction(lastFuncion, x0 + (j * (x1 - x0)) / muestras),
      );
      y = Math.max(...ys);
    } else if (currentMethod === "riemann") {
      // Evaluamos en el punto medio del subintervalo
      const sampleX = (x0 + x1) / 2;
      y = evaluateFunction(lastFuncion, sampleX);
    }

    // Rectángulo relleno
    calculator.setExpression({
      id: `rect${i}`,
      latex:
        y >= 0
          ? `0\\le y\\le${y}\\left\\{${x0}\\le x\\le${x1}\\right\\}`
          : `${y}\\le y\\le0\\left\\{${x0}\\le x\\le${x1}\\right\\}`,
      color,
      fillOpacity: 0.35,
      lineOpacity: 0,
    });

    // Borde superior
    calculator.setExpression({
      id: `top${i}`,
      latex: `y=${y}\\left\\{${x0}\\le x\\le${x1}\\right\\}`,
      color: "#ffffff",
      lineWidth: 1,
    });

    // Borde izquierdo
    calculator.setExpression({
      id: `left${i}`,
      latex: `x=${x0}\\left\\{${Math.min(0, y)}\\le y\\le${Math.max(0, y)}\\right\\}`,
      color: "#ffffff",
      lineWidth: 1,
    });

    // Borde derecho
    calculator.setExpression({
      id: `right${i}`,
      latex: `x=${x1}\\left\\{${Math.min(0, y)}\\le y\\le${Math.max(0, y)}\\right\\}`,
      color: "#ffffff",
      lineWidth: 1,
    });
  }

  updateLegend();
  zoomFit();
}

// Acercar gráfica
function zoomFit() {
  if (!calculator) return;

  const rango = lastB - lastA;
  const padding = rango * 0.5;

  // Estimar el rango Y evaluando varios puntos
  let yMin = 0,
    yMax = 0;
  const steps = 50;
  for (let i = 0; i <= steps; i++) {
    const x = lastA + (i / steps) * (lastB - lastA);
    const y = evaluateFunction(lastFuncion, x);
    yMin = Math.min(yMin, y);
    yMax = Math.max(yMax, y);
  }

  const yPadding = (yMax - yMin) * 0.3 || 2;

  calculator.setMathBounds({
    left: lastA - padding,
    right: lastB + padding,
    bottom: yMin - yPadding,
    top: yMax + yPadding,
  });
}

// Actualizar leyenda del método
function updateLegend() {
  const legend = document.getElementById("rect-legend");
  const dot = document.getElementById("rect-legend-dot");
  const label = document.getElementById("rect-legend-label");

  legend.style.display = "flex";

  if (currentMethod === "inferior") {
    dot.style.background = "#b794f4";
    label.textContent = "Rectángulos Inferiores";
  }

  if (currentMethod === "superior") {
    dot.style.background = "#fc8181";
    label.textContent = "Rectángulos Superiores";
  }

  if (currentMethod === "riemann") {
    dot.style.background = "#f6ad55";
    label.textContent = "Rectángulos Punto Medio";
  }
}

// Evaluar función en un valor x
function evaluateFunction(expr, x) {
  try {
    const safeExpr = expr
      .replace(/(?<![a-zA-Z])x(?![a-zA-Z])/g, `(${x})`)
      .replace(/^\s*-/, "0-");
    return eval(safeExpr);
  } catch (e) {
    console.error("evaluateFunction error:", e, "expr:", expr, "x:", x);
    return 0;
  }
}

// Convertir expresión a formato LaTeX
function toLatex(expr) {
  return expr.replaceAll("**", "^").replaceAll("*", "");
}
