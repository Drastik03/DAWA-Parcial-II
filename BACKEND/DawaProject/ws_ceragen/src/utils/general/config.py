import configparser
import os

CFG = configparser.ConfigParser()
config_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'config.cfg')
CFG.read(config_path, encoding='utf-8')

AMBIENTE = CFG.get('AMBIENTE', 'env')
CONNECT_MAIL = CFG.get('AMBIENTE', 'connect_email', fallback='DEFAULT_SMTP')
class Parametros:
    db_user = CFG[AMBIENTE]['db_user']
    db_pass = CFG[AMBIENTE]['db_pass']
    db_host = CFG[AMBIENTE]['db_host']
    db_name = CFG[AMBIENTE]['db_name']
    db_port = CFG[AMBIENTE]['db_port']
    secret_jwt = CFG[AMBIENTE]['secret_jwt']
    api_moodle_url = CFG[AMBIENTE]['api_moodle_url']

class Config_SMPT:
    smpt_server = CFG[CONNECT_MAIL]['server_smtp']
    smpt_port = CFG[CONNECT_MAIL]['puerto_smtp']
    smpt_mail = CFG[CONNECT_MAIL]['mail']
    smpt_password = CFG[CONNECT_MAIL]['app_password']
    url = CFG[CONNECT_MAIL]['url']
    ruta = CFG[CONNECT_MAIL]['ruta']
