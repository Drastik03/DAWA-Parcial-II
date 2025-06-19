from flask import request, jsonify

API_KEYS = {"1f5cQ3ZRmD2HvBN9kXZ0v7tmx0NJTV4lG2U9o1JHD7k", "1f5cQ3ZRmD2HvBN9kXZ0v7tmx0NJTV4lG2123asdf1"}

def require_api_key(func):
    def wrapper(*args, **kwargs):
        api_key = request.headers.get('x-api-key')
        if api_key and api_key in API_KEYS:
            return func(*args, **kwargs)
        else:
            return jsonify({'error': 'Unauthorized'}), 401
    return wrapper