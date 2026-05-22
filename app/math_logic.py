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
    "calcula la suma inferior"
    delta_x = calculo_delta_x(a, b, n)

    suma = 0

    for i in range(n):
       
       x_i = a + i * delta_x

       altura = funcion.subs(x, x_i)

       area = altura * delta_x

       suma += area

    return suma

def suma_superior(funcion, a, b, n):
    "calcula la suma superior"
    delta_x = calculo_delta_x(a, b, n)

    suma = 0

    for i in range(1, n + 1):
       
       x_i = a + i * delta_x

       altura = funcion.subs(x, x_i)

       area = altura * delta_x

       suma += area

    return suma

def suma_riemman(funcion, a, b, n):
    "calcula la suma de Riemman usando puntos medios"

    delta_x = calculo_delta_x(a, b, n)

    suma = 0

    for i in range(n):
       
       x_i = a + (i + 0.5) * delta_x

       altura = funcion.subs(x, x_i)

       area = altura * delta_x

       suma += area

    return suma

def integral_exacta(funcion, a, b):
    "calcula la integral exacta de una función entre a y b"
    integral = integrate(funcion, (x, a, b))
    return integral

