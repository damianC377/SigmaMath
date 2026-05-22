from flask import Blueprint, request, jsonify

from app.math_logic import (
    constructor_polinomio,
    constructor_polinomio_teclado,
    suma_inferior,
    suma_superior,
    suma_riemman,
    integral_exacta
)

routes = Blueprint('routes', __name__)

@routes.route('/calcular', methods=['POST'])
def calcular():

    try:

        data = request.get_json()

        tipo_ingreso = data['tipo_ingreso']

        a = float(data['a'])
        b = float(data['b'])
        n = int(data['n'])

        if tipo_ingreso == 'coeficientes':
            
            grado = int(data['grado'])
            coeficientes = data['coeficientes']

            funcion = constructor_polinomio(grado, coeficientes)
        else:

            texto_funcion = data['texto_funcion']

            funcion = constructor_polinomio_teclado(texto_funcion)
        
        resultado = {
            "funcion": str(funcion),
            "suma_inferior": float(suma_inferior(funcion, a, b, n)),
            "suma_superior": float(suma_superior(funcion, a, b, n)),
            "suma_riemman": float(suma_riemman(funcion, a, b, n)),
            "integral_exacta": float(integral_exacta(funcion, a, b))
        }

        return jsonify(resultado)
    
    except Exception as e:
        
        return jsonify({"error": str(e)}), 400