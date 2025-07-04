import os
from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from flask_swagger_ui import get_swaggerui_blueprint
from src.utils.general.logs import HandleLogs
from src.api.Routes.api_routes import load_routes

app = Flask(__name__)
CORS(app)
api = Api(app)
load_routes(api)

#definiciones del swagger
SWAGGER_URL = '/ws/ceragen/'
API_URL = '/static/swagger.json'

SWAGGERUI_BLUEPRINT = get_swaggerui_blueprint(SWAGGER_URL, API_URL,
                                              config={
                                                  'app_name': 'secoed-ws-restfulapi'
                                              })

app.register_blueprint(SWAGGERUI_BLUEPRINT, url_prefix=SWAGGER_URL)

if __name__ == '__main__':
    try:
        HandleLogs.write_log("Servicio Iniciado")
        port = int(os.environ.get('PORT', 1005))
        app.run(debug=False, host='0.0.0.0', threaded=True)

    except Exception as err:
        HandleLogs.write_error(err)
    finally:
        HandleLogs.write_log("Servicio Finalizado")
