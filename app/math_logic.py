from sympy import symbols, integrate, sympify, Rational
from sympy.abc import x

def constructor_polinomio(grado, coeficientes):
    "construye un polinomio a partir de su grado y sus coeficientes"
    if len(coeficientes) != grado + 1:
        raise ValueError("El número de coeficientes debe ser igual al grado + 1")
    funcion = sum(
        Rational(coef) * x ** (grado - i)
        for i, coef in enumerate(coeficientes)
    )
    return funcion

def constructor_polinomio_teclado(texto):
    "Este lo obtiene digitado por teclado"
    try:
        texto = texto.replace('^', '**')
        funcion = sympify(texto)
        return funcion
    except Exception:
        raise ValueError(f"La función '{texto}' no es válida")
    

def calculo_delta_x(a, b, n):
    "calcula el valor de delta x"
    return (b - a) / n

def suma_inferior(funcion, a, b, n):
    "calcula la suma inferior real buscando el mínimo en cada intervalo"
    delta_x = calculo_delta_x(a, b, n)
    suma = 0
    muestras = 20

    for i in range(n):
        # Extremos del subintervalo actual
        x_izq = a + i * delta_x
        x_der = a + (i + 1) * delta_x

        # Evaluamos varios puntos dentro del subintervalo y tomamos el mínimo
        altura_min = min(
            float(funcion.subs(x, x_izq + j * (x_der - x_izq) / muestras))
            for j in range(muestras + 1)
        )

        area = altura_min * delta_x
        suma += area

    return float(suma)


def suma_superior(funcion, a, b, n):
    "calcula la suma superior real buscando el máximo en cada intervalo"
    delta_x = calculo_delta_x(a, b, n)
    suma = 0
    muestras = 20

    for i in range(n):
        # Extremos del subintervalo actual
        x_izq = a + i * delta_x
        x_der = a + (i + 1) * delta_x

        # Evaluamos varios puntos dentro del subintervalo y tomamos el máximo
        altura_max = max(
            float(funcion.subs(x, x_izq + j * (x_der - x_izq) / muestras))
            for j in range(muestras + 1)
        )

        area = altura_max * delta_x
        suma += area

    return float(suma)

def suma_riemman(funcion, a, b, n):
    "calcula la suma de Riemman usando puntos medios"
    delta_x = calculo_delta_x(a, b, n)
    suma = 0

    for i in range(n):
       x_i = a + (i + 0.5) * delta_x
       altura = funcion.subs(x, x_i)
       area = altura * delta_x
       suma += area

    return float(suma)

def integral_exacta(funcion, a, b):
    "calcula la integral exacta de una función entre a y b"
    integral = integrate(funcion, (x, a, b))
    return float(integral)


