from marshmallow import ValidationError
import re
import ipaddress


#valida que los datos recibidos desde el front sean los esperados
class ValidateDataRequestSchema:
    @staticmethod
    def validate_positive_integer(value):
        if value is None:
            raise ValidationError('Valor no puede ser nulo.')
        if not isinstance(value, int):
            raise ValidationError('Valor debe ser un número entero.')
        if value <= 0:
            raise ValidationError('Valor debe ser un número positivo.')

    @staticmethod
    def validate_string_not_empty(value):
        if value is None:
            raise ValidationError('Valor no puede ser nulo.')
        if not value.strip():
            raise ValidationError('Campo no puede estar vacio.')

    @staticmethod
    def validate_ip_address(value):
        try:
            ipaddress.ip_address(value)
        except ValueError:
            raise ValidationError('Dirección IP no es válida')

    @staticmethod
    def validate_host_name(value):

        if not value:
            raise ValidationError('Invalid host format')
        if len(value) > 253:
            raise ValidationError('Invalid host format')

        regex = re.compile(r'^(?!-)[A-Za-z0-9-]{1,63}(?<!-)$')

        if not all(regex.match(label) for label in value.split('.')):
            raise ValidationError('Invalid host format')

        if value.startswith('-') or value.endswith('-') or '..' in value:
            raise ValidationError('Invalid host format')

    @staticmethod
    def validate_person_ci(value):
        # Verifica que la cédula tenga exactamente 10 dígitos y cumpla con las reglas
        if not re.match(r'^\d{10}$', value):
            raise ValidationError('Cédula debe tener 10 dígitos')
        if not ValidateDataRequestSchema.validate_ecuadorian_id(value):
            raise ValidationError('Cédula no es válida')

    @staticmethod
    def validate_ecuadorian_id(ci):
        ci = ci.strip()
        if not re.match(r'^\d{10}$', ci):
            return False

        digits = list(map(int, ci))
        if len(digits) != 10:
            return False

        # Verifica que los dos primeros dígitos estén en el rango 01 a 24
        if not (1 <= int(ci[:2]) <= 24):
            return False

        # Verifica que el tercer dígito sea menor a 6
        if digits[2] >= 6:
            return False

        # Coeficientes para el cálculo del dígito verificador
        coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2]

        # Calcular la suma usando los coeficientes
        total = 0
        for i in range(9):
            product = digits[i] * coefficients[i]
            total += product - 9 if product > 9 else product

        # Determinar el dígito verificador
        calculated_check_digit = (10 - (total % 10)) % 10

        # Comparar el dígito verificador calculado con el último dígito de la cédula
        return calculated_check_digit == digits[9]

    @staticmethod
    def validate_boolean(value):
        if value is None:
            raise ValidationError('El valor no puede ser nulo.')
        if not isinstance(value, bool):
            raise ValidationError('Valor debe ser booleano -True o False-.')
