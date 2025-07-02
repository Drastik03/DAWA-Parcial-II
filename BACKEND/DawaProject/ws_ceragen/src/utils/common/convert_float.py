from decimal import Decimal

def convert_decimal_to_float(data):
    if isinstance(data, list):
        return [convert_decimal_to_float(item) for item in data]
    elif isinstance(data, dict):
        return {k: convert_decimal_to_float(v) for k, v in data.items()}
    elif isinstance(data, Decimal):
        return float(data)
    return data



def convert_decimals(data_list):
    new_list = []
    for row in data_list:
        new_row = {}
        for key, value in row.items():
            if isinstance(value, Decimal):
                new_row[key] = float(value)
            else:
                new_row[key] = value
        new_list.append(new_row)
    return new_list